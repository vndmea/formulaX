import type {
  FormulaXDisplayRenderResult,
  FormulaXImageRenderOptions,
} from './types';
import { createFormulaImageHtml } from './image-markup';
import { svgMarkupToPngBlob } from './svg-to-png';

export const FORMULAX_OUTPUT_ATTRIBUTE = 'data-formulax-output';
export const FORMULAX_IMAGE_URL_ATTRIBUTE = 'data-formulax-image-url';
export const FORMULAX_IMAGE_WIDTH_ATTRIBUTE = 'data-formulax-image-width';
export const FORMULAX_IMAGE_HEIGHT_ATTRIBUTE = 'data-formulax-image-height';
export const FORMULAX_IMAGE_STYLE_ATTRIBUTE = 'data-formulax-image-style';

export async function renderFormulaDisplayHtml(
  options: FormulaXImageRenderOptions,
): Promise<FormulaXDisplayRenderResult> {
  const source = await options.renderer.renderLatex(options.latex, {
    ...options.render,
    className: options.className,
  });

  if (options.output !== 'image') {
    return {
      output: 'svg',
      latex: options.latex,
      renderHtml: source.html,
      source,
    };
  }

  if (!options.image?.upload) {
    throw new Error('FormulaX image output requires image.upload.');
  }

  try {
    const png = await svgMarkupToPngBlob(source.html, {
      scale: options.image.scale,
      backgroundColor: options.image.backgroundColor,
    });

    const filename = resolveImageFilename(options.image.filename, options.latex);
    const uploaded = await options.image.upload({
      latex: options.latex,
      svg: source.html,
      blob: png.blob,
      filename,
      mimeType: 'image/png',
      width: png.width,
      height: png.height,
      displayStyle: png.displayStyle,
    });

    if (!uploaded.url) {
      throw new Error('Formula image upload did not return a URL.');
    }

    const image = {
      url: uploaded.url,
      width: uploaded.width ?? png.width,
      height: uploaded.height ?? png.height,
      displayStyle: png.displayStyle,
    };

    return {
      output: 'image',
      latex: options.latex,
      source,
      image,
      renderHtml: createFormulaImageHtml({
        src: image.url,
        latex: options.latex,
        className: options.className,
        width: image.width,
        height: image.height,
        style: image.displayStyle,
      }),
    };
  } catch (error) {
    if (options.image.onUploadError === 'fallback-svg') {
      return {
        output: 'svg',
        latex: options.latex,
        renderHtml: source.html,
        source,
      };
    }

    throw error;
  }
}

export function createFormulaDisplayAttributes(
  display: FormulaXDisplayRenderResult,
): Record<string, string | undefined> {
  return {
    [FORMULAX_OUTPUT_ATTRIBUTE]: display.output,
    [FORMULAX_IMAGE_URL_ATTRIBUTE]: display.image?.url,
    [FORMULAX_IMAGE_WIDTH_ATTRIBUTE]: display.image?.width ? String(display.image.width) : undefined,
    [FORMULAX_IMAGE_HEIGHT_ATTRIBUTE]: display.image?.height ? String(display.image.height) : undefined,
    [FORMULAX_IMAGE_STYLE_ATTRIBUTE]: display.image?.displayStyle,
  };
}

function resolveImageFilename(
  filename: string | ((latex: string) => string) | undefined,
  latex: string,
): string {
  if (typeof filename === 'function') {
    return filename(latex);
  }

  if (filename) {
    return filename;
  }

  return `formulax-${hashString(latex)}.png`;
}

function hashString(input: string): string {
  let hash = 5381;

  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(index);
  }

  return Math.abs(hash >>> 0).toString(36);
}
