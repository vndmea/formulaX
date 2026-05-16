import type { FormulaRenderOptions } from '@formulaxjs/renderer';
import type { KityEditorAssets } from '@formulaxjs/kity-runtime';

export interface KityFormulaRenderOptions extends FormulaRenderOptions {
  height?: number | string;
  assets?: Partial<KityEditorAssets>;
}
