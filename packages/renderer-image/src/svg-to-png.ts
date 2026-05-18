export interface SvgToPngOptions {
  scale?: number;
  backgroundColor?: string;
}

export interface SvgDisplayMetrics {
  width: number;
  height: number;
  displayStyle?: string;
}

export interface SvgToPngResult extends SvgDisplayMetrics {
  blob: Blob;
}

export async function svgMarkupToPngBlob(
  svgMarkup: string,
  options: SvgToPngOptions = {},
): Promise<SvgToPngResult> {
  if (typeof document === 'undefined') {
    throw new Error('svgMarkupToPngBlob requires a browser document.');
  }

  const deviceScale = globalThis.devicePixelRatio || 1;
  const scale = options.scale ?? Math.min(Math.max(4, deviceScale * 2), 6);
  const normalizedSvg = await normalizeSvgMarkup(svgMarkup);
  const { width, height, displayStyle } = readSvgDisplayMetrics(normalizedSvg);

  await waitForFonts();

  const svgBlob = new Blob([normalizedSvg], {
    type: 'image/svg+xml;charset=utf-8',
  });
  const url = URL.createObjectURL(svgBlob);

  try {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width * scale));
    canvas.height = Math.max(1, Math.ceil(height * scale));

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context is not available.');
    }

    if (options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (shouldPreferCanvgRasterization(normalizedSvg)) {
      await drawSvgToCanvasWithCanvg(canvas, normalizedSvg);
    } else {
      await drawSvgToCanvasWithImage(canvas, url, width, height, scale);
    }

    const blob = await canvasToPngBlob(canvas);

    return {
      blob,
      width,
      height,
      displayStyle,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function shouldPreferCanvgRasterization(svgMarkup: string): boolean {
  return /<text[\s>]|font-family\s*=|font-family\s*:|@font-face/i.test(svgMarkup);
}

export function readSvgDisplayMetrics(svgMarkup: string): SvgDisplayMetrics {
  const doc = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml');
  const svg = doc.documentElement;

  if (svg.tagName.toLowerCase() !== 'svg') {
    throw new Error('Formula render result does not contain an SVG element.');
  }

  const width = parseCssLength(svg.getAttribute('width'));
  const height = parseCssLength(svg.getAttribute('height'));

  if (!width || !height) {
    const viewBox = svg.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.trim().split(/\s+/).map(Number);
      if (parts.length === 4 && parts.every(Number.isFinite) && parts[2] > 0 && parts[3] > 0) {
        return {
          width: parts[2],
          height: parts[3],
          displayStyle: readFormulaImageDisplayStyle(svg.getAttribute('style')),
        };
      }
    }

    throw new Error('Unable to determine formula SVG size.');
  }

  return {
    width,
    height,
    displayStyle: readFormulaImageDisplayStyle(svg.getAttribute('style')),
  };
}

async function normalizeSvgMarkup(markup: string): Promise<string> {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = markup.trim();

  const svg = wrapper.querySelector('svg');
  if (!svg) {
    throw new Error('Formula render result does not contain an SVG element.');
  }

  if (!svg.getAttribute('xmlns')) {
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  const resourceCache = new Map<string, Promise<string>>();
  await normalizeEmbeddedSvgStyles(svg, document.baseURI, resourceCache);
  await embedRelevantFontFaces(svg, document, resourceCache);

  return svg.outerHTML;
}

async function normalizeEmbeddedSvgStyles(
  svg: SVGElement,
  baseUrl: string,
  resourceCache: Map<string, Promise<string>>,
): Promise<void> {
  const styleElements = Array.from(svg.querySelectorAll('style'));

  await Promise.all(styleElements.map(async (styleElement) => {
    if (!styleElement.textContent) {
      return;
    }

    styleElement.textContent = await inlineCssUrls(
      styleElement.textContent,
      baseUrl,
      resourceCache,
    );
  }));
}

async function embedRelevantFontFaces(
  svg: SVGElement,
  doc: Document,
  resourceCache: Map<string, Promise<string>>,
): Promise<void> {
  const usedFontFamilies = readSvgUsedFontFamilies(svg);
  if (!usedFontFamilies.size) {
    return;
  }

  const fontFaceRules = await collectDocumentFontFaceRules(doc, usedFontFamilies, resourceCache);
  if (!fontFaceRules.length) {
    return;
  }

  const defs = ensureSvgDefs(svg);
  const styleElement = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleElement.textContent = fontFaceRules.join('\n');
  defs.prepend(styleElement);
}

function readSvgUsedFontFamilies(svg: SVGElement): Set<string> {
  const families = new Set<string>();
  const elements = [svg, ...Array.from(svg.querySelectorAll<SVGElement>('[font-family], [style]'))];

  elements.forEach((element) => {
    const direct = element.getAttribute('font-family');
    if (direct) {
      splitFontFamilyList(direct).forEach((family) => families.add(family));
    }

    const styleText = element.getAttribute('style');
    if (!styleText) {
      return;
    }

    const match = styleText.match(/font-family\s*:\s*([^;]+)/i);
    if (!match?.[1]) {
      return;
    }

    splitFontFamilyList(match[1]).forEach((family) => families.add(family));
  });

  return families;
}

function splitFontFamilyList(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

async function collectDocumentFontFaceRules(
  doc: Document,
  usedFontFamilies: Set<string>,
  resourceCache: Map<string, Promise<string>>,
): Promise<string[]> {
  const rules: string[] = [];
  const pendingRules: Array<Promise<void>> = [];

  for (const stylesheet of Array.from(doc.styleSheets)) {
    let cssRules: CSSRuleList;

    try {
      cssRules = stylesheet.cssRules;
    } catch {
      continue;
    }

    const baseUrl = stylesheet.href ?? doc.baseURI;
    for (const rule of Array.from(cssRules)) {
      if (rule.type !== CSSRule.FONT_FACE_RULE) {
        continue;
      }

      const fontFaceRule = rule as CSSFontFaceRule;
      const fontFamily = fontFaceRule.style.getPropertyValue('font-family')
        .trim()
        .replace(/^['"]|['"]$/g, '');

      if (!fontFamily || !usedFontFamilies.has(fontFamily)) {
        continue;
      }

      pendingRules.push(
        inlineCssUrls(fontFaceRule.cssText, baseUrl, resourceCache).then((cssText) => {
          rules.push(cssText);
        }),
      );
    }
  }

  await Promise.all(pendingRules);
  return Array.from(new Set(rules));
}

async function inlineCssUrls(
  cssText: string,
  baseUrl: string,
  resourceCache: Map<string, Promise<string>>,
): Promise<string> {
  const matches = Array.from(cssText.matchAll(/url\(([^)]+)\)/g));
  if (!matches.length) {
    return cssText;
  }

  const replacements = await Promise.all(matches.map(async (match) => {
    const original = match[0];
    const rawValue = match[1] ?? '';
    const value = rawValue.trim().replace(/^['"]|['"]$/g, '');
    if (!value || value.startsWith('data:') || value.startsWith('blob:')) {
      return [original, `url("${value}")`] as const;
    }

    try {
      const absoluteUrl = new URL(value, baseUrl).href;
      const inlined = await fetchResourceAsDataUrl(absoluteUrl, resourceCache);
      return [original, `url("${inlined}")`] as const;
    } catch {
      return [original, `url("${value}")`] as const;
    }
  }));

  let nextCssText = cssText;
  replacements.forEach(([original, replacement]) => {
    nextCssText = nextCssText.replace(original, replacement);
  });

  return nextCssText;
}

function ensureSvgDefs(svg: SVGElement): SVGDefsElement {
  const existing = svg.querySelector(':scope > defs');
  if (existing instanceof SVGDefsElement) {
    return existing;
  }

  const defs = svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'defs');
  svg.prepend(defs);
  return defs;
}

function readFormulaImageDisplayStyle(styleText: string | null): string | undefined {
  if (!styleText) {
    return undefined;
  }

  const styleMap = new Map<string, string>();
  styleText
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((declaration) => {
      const [property, ...valueParts] = declaration.split(':');
      const propertyName = property?.trim().toLowerCase();
      const propertyValue = valueParts.join(':').trim();
      if (!propertyName || !propertyValue) {
        return;
      }
      styleMap.set(propertyName, propertyValue);
    });

  const width = styleMap.get('width');
  const height = styleMap.get('height');
  if (!width && !height) {
    return undefined;
  }

  return [
    width ? `width:${width}` : '',
    height ? `height:${height}` : '',
  ]
    .filter(Boolean)
    .join('; ');
}

function parseCssLength(value: string | null): number | null {
  if (!value) return null;
  const numberValue = Number.parseFloat(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

async function fetchResourceAsDataUrl(
  absoluteUrl: string,
  resourceCache: Map<string, Promise<string>>,
): Promise<string> {
  let pending = resourceCache.get(absoluteUrl);
  if (!pending) {
    pending = (async () => {
      const response = await fetch(absoluteUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch resource: ${absoluteUrl}`);
      }

      const mimeType = response.headers.get('content-type') || 'application/octet-stream';
      const buffer = await response.arrayBuffer();
      return `data:${mimeType};base64,${encodeArrayBufferAsBase64(buffer)}`;
    })().catch(() => absoluteUrl);
    resourceCache.set(absoluteUrl, pending);
  }

  return pending;
}

function encodeArrayBufferAsBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (let index = 0; index < bytes.length; index += 0x8000) {
    const chunk = bytes.subarray(index, index + 0x8000);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

async function waitForFonts(): Promise<void> {
  const fonts = document.fonts;
  if (!fonts?.ready) {
    return;
  }

  await fonts.ready;
}

async function drawSvgToCanvasWithCanvg(
  canvas: HTMLCanvasElement,
  svgMarkup: string,
): Promise<void> {
  const { createCanvgRuntime } = await import('../../kity-runtime/src/vendor/kity-formula/canvg-runtime');
  const canvg = createCanvgRuntime();
  canvg(canvas, svgMarkup, {
    ignoreMouse: true,
    ignoreAnimation: true,
    ignoreDimensions: true,
    ignoreClear: true,
    scaleWidth: canvas.width,
    scaleHeight: canvas.height,
  });
}

async function drawSvgToCanvasWithImage(
  canvas: HTMLCanvasElement,
  url: string,
  width: number,
  height: number,
  scale: number,
): Promise<void> {
  const image = new Image();
  image.decoding = 'async';
  image.src = url;

  await decodeImage(image);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not available.');
  }

  ctx.scale(scale, scale);
  ctx.drawImage(image, 0, 0, width, height);
}

async function decodeImage(image: HTMLImageElement): Promise<void> {
  if (typeof image.decode === 'function') {
    await image.decode();
    return;
  }

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Failed to decode formula SVG image.'));
  });
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert formula SVG to PNG.'));
      }
    }, 'image/png');
  });
}
