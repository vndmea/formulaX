import {
  createFormulaRenderCacheKey,
  type FormulaRenderer,
  type FormulaRenderResult,
} from '@formulaxjs/renderer';
import { mountKityEditor, type KityEditorAssets } from '@formulaxjs/kity-runtime';
import { createHiddenRenderHost } from './dom';
import {
  serializeKityFormulaFromRoot,
  waitForKityFormulaSvgLayout,
} from './serialize';
import type { KityFormulaRenderOptions } from './types';

const renderCache = new Map<string, Promise<FormulaRenderResult>>();

function hasCustomAssetOverrides(assets?: Partial<KityEditorAssets>): boolean {
  return Boolean(assets && Object.keys(assets).length > 0);
}

export function createKityFormulaRenderer(
  defaults: KityFormulaRenderOptions = {},
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
  options: KityFormulaRenderOptions = {},
): Promise<FormulaRenderResult> {
  const normalizedLatex = latex.trim();
  const shouldUseCache = options.cache !== false
    && !(hasCustomAssetOverrides(options.assets) && !options.assetCacheKey);

  if (!normalizedLatex) {
    return Promise.resolve({
      engine: 'kity',
      output: 'svg',
      latex: normalizedLatex,
      html: '',
    });
  }

  const cacheKey = createFormulaRenderCacheKey({
    engine: 'kity',
    latex: normalizedLatex,
    output: 'svg',
    fontSize: options.fontSize,
    displayMode: options.displayMode,
    className: options.className,
    assetCacheKey: options.assetCacheKey,
  });

  if (shouldUseCache) {
    const cached = renderCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const pending = renderLatexToSvgMarkupUncached(normalizedLatex, options);

  if (shouldUseCache) {
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
  options: KityFormulaRenderOptions,
): Promise<FormulaRenderResult> {
  if (typeof document === 'undefined') {
    throw new Error('Kity renderer requires a browser document.');
  }

  const host = createHiddenRenderHost(document);
  const handle = await mountKityEditor(host, {
    initialLatex: latex,
    height: options.height ?? '100%',
    autofocus: false,
    assets: options.assets,
    render: {
      fontsize: options.fontSize ?? 40,
    },
  });

  try {
    await waitForKityFormulaSvgLayout(host);

    return {
      engine: 'kity',
      output: 'svg',
      latex,
      html: serializeKityFormulaFromRoot(host),
    };
  } finally {
    handle.destroy();
    host.remove();
  }
}
