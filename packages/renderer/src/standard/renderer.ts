import { createFormulaRenderCacheKey } from '../shared/cache';
import type { FormulaRenderer, FormulaRenderResult } from '../shared/types';
import { createRuntimeEditor } from '@formulaxjs/runtime';
import { createHiddenRenderHost } from './dom';
import type { StandardRendererOptions } from './types';

const renderCache = new Map<string, Promise<FormulaRenderResult>>();

export function createStandardFormulaRenderer(
  defaults: StandardRendererOptions = {},
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
  options: StandardRendererOptions = {},
): Promise<FormulaRenderResult> {
  const normalizedLatex = latex.trim();

  if (!normalizedLatex) {
    return Promise.resolve({
      engine: 'standard',
      output: 'svg',
      latex: '',
      html: '',
    });
  }

  const cacheKey = createFormulaRenderCacheKey({
    engine: 'standard',
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
  options: StandardRendererOptions,
): Promise<FormulaRenderResult> {
  if (typeof document === 'undefined') {
    throw new Error('standard renderer requires a browser document.');
  }

  const host = createHiddenRenderHost(document);
  if (typeof options.maxWidth === 'number' && options.maxWidth > 0) {
    host.style.width = `${options.maxWidth}px`;
  }
  const handle = await createRuntimeEditor(host, {
    initialLatex: latex,
    autofocus: false,
    height: options.height ?? '100%',
    readOnly: true,
    assets: options.runtime?.assets,
    wrap: options.wrap,
    maxWidth: options.maxWidth,
    lineGap: options.lineGap,
    continuationIndent: options.continuationIndent,
    render: {
      fontSize: options.fontSize ?? 40,
    },
  });

  try {
    await handle.ready;
    return {
      engine: 'standard',
      output: 'svg',
      latex,
      html: handle.getRenderHtml(),
    };
  } finally {
    handle.destroy();
    host.remove();
  }
}
