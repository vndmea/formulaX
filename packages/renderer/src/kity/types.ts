import type { FormulaRenderOptions } from '../shared/types';
import type { KityEditorAssets } from '@formulaxjs/runtime-kity';

export interface KityFormulaRenderOptions extends FormulaRenderOptions {
  height?: number | string;
  assets?: Partial<KityEditorAssets>;
  assetCacheKey?: string;
}
