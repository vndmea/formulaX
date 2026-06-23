import {
  createFormulaRenderCacheKey,
  type FormulaRenderer,
  type FormulaRenderResult,
} from '@formulaxjs/renderer';
import { createRuntimeEditor } from '@formulaxjs/runtime';
import { createHiddenRenderHost } from './dom';
import type { RendererV2RenderOptions } from './types';

const renderCache = new Map<string, Promise<FormulaRenderResult>>();

export function createFormulaRendererV2(
  defaults: RendererV2RenderOptions = {},
): FormulaRenderer {
  return {
    renderLatex(latex, options = {}) {
      return renderLatexToSvgMarkup(latex, {
        ...defaults,
        ...options,
      });
    },
  };
}

export function renderLatexToSvgMarkup(
  latex: string,
  options: RendererV2RenderOptions = {},
): Promise<FormulaRenderResult> {
  const normalizedLatex = latex.trim();

  if (!normalizedLatex) {
    return Promise.resolve({
      engine: 'runtime-v2',
      output: 'svg',
      latex: '',
      html: '',
    });
  }

  const cacheKey = createFormulaRenderCacheKey({
    engine: 'runtime-v2',
    latex: normalizedLatex,
    output: 'svg',
    fontSize: options.fontSize,
    displayMode: options.displayMode,
    className: options.className,
  });

  if (options.cache !== false) {
    const cached = renderCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const pending = renderLatexToSvgMarkupUncached(normalizedLatex, options);
  if (options.cache !== false) {
    renderCache.set(cacheKey, pending);
    pending.catch(() => {
      if (renderCache.get(cacheKey) === pending) {
        renderCache.delete(cacheKey);
      }
    });
  }

  return pending;
}

async function renderLatexToSvgMarkupUncached(
  latex: string,
  options: RendererV2RenderOptions,
): Promise<FormulaRenderResult> {
  if (typeof document === 'undefined') {
    throw new Error('renderer-v2 requires a browser document.');
  }

  const host = createHiddenRenderHost(document);
  const handle = await createRuntimeEditor(host, {
    initialLatex: latex,
    autofocus: false,
    height: options.height ?? '100%',
    readOnly: true,
    assets: options.runtime?.assets,
    render: {
      fontSize: options.fontSize ?? 40,
    },
  });

  try {
    await handle.ready;
    return {
      engine: 'runtime-v2',
      output: 'svg',
      latex,
      html: handle.getRenderHtml(),
    };
  } finally {
    handle.destroy();
    host.remove();
  }
}
