import { createEmptyState, parseLatex, type FormulaState } from '@formulax/core';
import { mountKityEditor, type KityEditorHandle } from '@formulax/kity-runtime';
import type { MountedFormulaXEditor, RequiredFormulaXTinyMceOptions } from './types';

export interface MountFormulaXEditorOptions {
  initialLatex?: string;
  options: RequiredFormulaXTinyMceOptions;
}

interface SvgBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function mountFormulaXEditorInModal(
  root: HTMLElement,
  input: MountFormulaXEditorOptions,
): MountedFormulaXEditor {
  let destroyed = false;
  let latestLatex = input.initialLatex ?? '';
  let handle: KityEditorHandle | null = null;

  root.innerHTML = '';
  root.classList.add('fx-tinymce-kity-host');

  const readyPromise = mountKityEditor(root, {
    initialLatex:
      latestLatex || 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}',
    height: input.options.editor.height ?? '100%',
    autofocus: input.options.editor.autofocus ?? true,
    assets: input.options.editor.assets,
    render: {
      fontsize: input.options.editor.render?.fontsize ?? 40,
    },
  })
    .then((nextHandle) => {
      if (destroyed) {
        nextHandle.destroy();
        throw new Error('FormulaX editor mount cancelled');
      }

      handle = nextHandle;
      return nextHandle;
    })
    .catch((error) => {
      console.error('[FormulaX] Failed to load FormulaX editor:', error);

      if (!destroyed) {
        root.innerHTML = `
          <div class="fx-tinymce-editor-error">
            Failed to load FormulaX editor.
            <pre>${escapeHtml(error instanceof Error ? error.message : String(error))}</pre>
          </div>
        `;
      }

      throw error;
    });

  const getCurrentLatex = async (): Promise<string> => {
    const readyHandle = handle ?? await readyPromise;
    const latex = await tryReadLatexFromKityHandle(readyHandle);

    if (latex) {
      latestLatex = latex;
    }

    return latestLatex;
  };

  return {
    root,

    getLatex: getCurrentLatex,

    async getState(): Promise<FormulaState> {
      const latex = await getCurrentLatex();

      try {
        return {
          ...createEmptyState(),
          doc: parseLatex(latex),
        };
      } catch {
        return createEmptyState();
      }
    },

    async getRenderHtml(): Promise<string> {
      await readyPromise;
      return renderCurrentFormulaAsSvgHtml(root);
    },

    destroy(): void {
      if (destroyed) return;
      destroyed = true;

      void readyPromise
        .then((readyHandle) => readyHandle.destroy())
        .catch(() => {
          // ignore destroy errors
        });

      root.innerHTML = '';
    },
  };
}

async function tryReadLatexFromKityHandle(
  handle: KityEditorHandle,
): Promise<string | null> {
  const candidates = [
    'get.source',
    'getSource',
    'getLatex',
    'get.latex',
    'get.content',
    'getContent',
  ];

  for (const command of candidates) {
    try {
      let value: unknown = null;

      handle.ready(function ready() {
        value = this.execCommand(command);
      });

      if (typeof value === 'string' && value.trim()) {
        return value;
      }

      if (value && typeof value === 'object' && 'latex' in value) {
        const latex = (value as { latex?: unknown }).latex;
        if (typeof latex === 'string' && latex.trim()) {
          return latex;
        }
      }
    } catch {
      // try next command
    }
  }

  return null;
}

function renderCurrentFormulaAsSvgHtml(root: HTMLElement): string {
  const svg = findFormulaSvg(root);

  if (!svg) {
    return '';
  }

  return serializeSvgForInsertion(svg);
}

function findFormulaSvg(root: HTMLElement): SVGSVGElement | null {
  return root.querySelector<SVGSVGElement>(
    '.kf-editor-edit-area svg, .kf-editor-canvas-container svg, svg',
  );
}

export function serializeSvgForInsertion(svg: SVGSVGElement): string {
  const contentBox = getSvgContentBox(svg);
  const inlineViewport = contentBox ? createInlineSvgViewport(contentBox) : null;
  const clone = inlineViewport
    ? createInlineSvgClone(svg, inlineViewport)
    : (svg.cloneNode(true) as SVGSVGElement);

  uniquifySvgIds(clone);
  sizeSvgForInlineDisplay(clone, svg, inlineViewport);

  clone.removeAttribute('id');
  clone.removeAttribute('xmlns');
  clone.removeAttribute('xmlns:xlink');
  clone.setAttribute('class', mergeClassNames(clone.getAttribute('class'), 'formulax-math__svg'));
  clone.setAttribute('focusable', 'false');
  clone.setAttribute('aria-hidden', 'true');
  clone.setAttribute('preserveAspectRatio', clone.getAttribute('preserveAspectRatio') || 'xMinYMin meet');

  return new XMLSerializer().serializeToString(clone);
}

function getSvgContentBox(svg: SVGSVGElement): SvgBox | null {
  const candidates = [
    '[data-root="true"] > g[data-type="kf-editor-exp-content-box"]',
    'g[data-type="kf-editor-exp-content-box"]',
    'g[data-type="kf-container"]',
    'svg > g, g',
  ];

  for (const selector of candidates) {
    const content = svg.querySelector<SVGGraphicsElement>(selector);
    const box = content ? readSvgBoxInRootSpace(content) : null;
    if (box) {
      return box;
    }
  }

  return readSvgBox(svg);
}

function readSvgBoxInRootSpace(element: SVGGraphicsElement): SvgBox | null {
  const box = readSvgBox(element);
  const elementMatrix = typeof element.getCTM === 'function' ? element.getCTM() : null;
  const rootMatrix = typeof element.ownerSVGElement?.getCTM === 'function'
    ? element.ownerSVGElement.getCTM()
    : null;

  if (!box || !elementMatrix) {
    return box;
  }

  const matrix = rootMatrix
    ? multiplySvgMatrices(invertSvgMatrix(rootMatrix), elementMatrix)
    : elementMatrix;

  const points = [
    { x: box.x, y: box.y },
    { x: box.x + box.width, y: box.y },
    { x: box.x, y: box.y + box.height },
    { x: box.x + box.width, y: box.y + box.height },
  ].map((point) => ({
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f,
  }));

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  const width = Math.max(...xs) - x;
  const height = Math.max(...ys) - y;

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return { x, y, width, height };
}

function invertSvgMatrix(matrix: DOMMatrix | SVGMatrix): SVGMatrixLike {
  const determinant = matrix.a * matrix.d - matrix.b * matrix.c;

  if (!Number.isFinite(determinant) || determinant === 0) {
    return {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 0,
      f: 0,
    };
  }

  return {
    a: matrix.d / determinant,
    b: -matrix.b / determinant,
    c: -matrix.c / determinant,
    d: matrix.a / determinant,
    e: (matrix.c * matrix.f - matrix.d * matrix.e) / determinant,
    f: (matrix.b * matrix.e - matrix.a * matrix.f) / determinant,
  };
}

function multiplySvgMatrices(
  left: DOMMatrix | SVGMatrixLike,
  right: DOMMatrix | SVGMatrixLike,
): SVGMatrixLike {
  return {
    a: left.a * right.a + left.c * right.b,
    b: left.b * right.a + left.d * right.b,
    c: left.a * right.c + left.c * right.d,
    d: left.b * right.c + left.d * right.d,
    e: left.a * right.e + left.c * right.f + left.e,
    f: left.b * right.e + left.d * right.f + left.f,
  };
}

interface SVGMatrixLike {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

function readSvgBox(element: SVGGraphicsElement): SvgBox | null {
  if (typeof element.getBBox !== 'function') {
    return null;
  }

  try {
    const box = element.getBBox();
    if (!Number.isFinite(box.width) || !Number.isFinite(box.height) || box.width <= 0 || box.height <= 0) {
      return null;
    }

    return {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    };
  } catch {
    return null;
  }
}

function createInlineSvgViewport(contentBox: SvgBox): SvgBox {
  const edgePadding = Math.max(0.5, Math.min(contentBox.width, contentBox.height) * 0.006);

  return {
    x: contentBox.x,
    y: contentBox.y,
    width: contentBox.width + edgePadding,
    height: contentBox.height + edgePadding,
  };
}

function createInlineSvgClone(source: SVGSVGElement, viewport: SvgBox): SVGSVGElement {
  const clone = source.cloneNode(false) as SVGSVGElement;
  const ownerDocument = source.ownerDocument;

  copySvgRootAttributes(source, clone);
  clone.setAttribute(
    'viewBox',
    `0 0 ${roundLength(viewport.width)} ${roundLength(viewport.height)}`,
  );

  Array.from(source.children).forEach((child) => {
    if (child.tagName.toLowerCase() === 'defs') {
      clone.appendChild(child.cloneNode(true));
    }
  });

  const contentRoot = findSvgContentRoot(source);
  if (!contentRoot) {
    return clone;
  }

  const wrapper = ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
  wrapper.setAttribute(
    'transform',
    `translate(${roundLength(-viewport.x)} ${roundLength(-viewport.y)})`,
  );
  wrapper.appendChild(contentRoot.cloneNode(true));
  clone.appendChild(wrapper);

  return clone;
}

function copySvgRootAttributes(source: SVGSVGElement, target: SVGSVGElement): void {
  const excluded = new Set([
    'id',
    'width',
    'height',
    'viewBox',
    'class',
    'focusable',
    'aria-hidden',
    'xmlns',
    'xmlns:xlink',
  ]);

  Array.from(source.attributes).forEach((attribute) => {
    if (excluded.has(attribute.name)) return;
    target.setAttribute(attribute.name, attribute.value);
  });
}

function findSvgContentRoot(svg: SVGSVGElement): SVGGElement | null {
  const directContainer = Array.from(svg.children).find((child) => {
    return child.tagName.toLowerCase() === 'g'
      && child.getAttribute('data-type') === 'kf-container';
  });

  if (directContainer instanceof SVGGElement) {
    return directContainer;
  }

  const firstGroup = Array.from(svg.children).find((child) => child.tagName.toLowerCase() === 'g');
  return firstGroup instanceof SVGGElement ? firstGroup : null;
}

function sizeSvgForInlineDisplay(
  clone: SVGSVGElement,
  source: SVGSVGElement,
  viewport: SvgBox | null,
): void {
  const viewBox = clone.viewBox?.baseVal;
  const rect = source.getBoundingClientRect();
  const width = viewport?.width || viewBox?.width || rect.width || Number(clone.getAttribute('width')) || 1;
  const height = viewport?.height || viewBox?.height || rect.height || Number(clone.getAttribute('height')) || 1;
  const ratio = Math.max(0.1, width / Math.max(1, height));
  const inlineHeightEm = 1.65;
  const inlineWidthEm = Math.min(40, Math.max(0.75, ratio * inlineHeightEm));

  clone.setAttribute('width', roundLength(width));
  clone.setAttribute('height', roundLength(height));
  clone.setAttribute(
    'style',
    mergeInlineStyles(
      clone.getAttribute('style'),
      `width:${roundLength(inlineWidthEm)}em`,
      `height:${inlineHeightEm}em`,
    ),
  );
}

function roundLength(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

function uniquifySvgIds(svg: SVGSVGElement): void {
  const idMap = new Map<string, string>();
  const prefix = `fx-${randomIdPrefix()}-`;
  const elementsWithId = svg.querySelectorAll<Element>('[id]');

  elementsWithId.forEach((element) => {
    const id = element.getAttribute('id');
    if (!id) return;

    const nextId = `${prefix}${id}`;
    idMap.set(id, nextId);
    element.setAttribute('id', nextId);
  });

  if (!idMap.size) return;

  svg.querySelectorAll<Element>('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const nextValue = rewriteSvgReferences(attribute.value, idMap);
      if (nextValue !== attribute.value) {
        element.setAttribute(attribute.name, nextValue);
      }
    });
  });
}

function randomIdPrefix(): string {
  return Math.random().toString(36).slice(2, 5).padEnd(3, '0');
}

function rewriteSvgReferences(value: string, idMap: Map<string, string>): string {
  let nextValue = value;

  idMap.forEach((nextId, id) => {
    nextValue = nextValue
      .replaceAll(`#${id}`, `#${nextId}`)
      .replaceAll(`url(${id})`, `url(${nextId})`)
      .replaceAll(`url(#${id})`, `url(#${nextId})`);
  });

  return nextValue;
}

function mergeClassNames(...values: Array<string | null | undefined>): string {
  return values
    .flatMap((value) => value?.split(/\s+/) ?? [])
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index)
    .join(' ');
}

function mergeInlineStyles(...values: Array<string | null | undefined>): string {
  return values
    .flatMap((value) => value?.split(';') ?? [])
    .map((value) => value.trim())
    .filter(Boolean)
    .join('; ');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
