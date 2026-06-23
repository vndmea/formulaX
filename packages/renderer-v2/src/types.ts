import type { FormulaRenderOptions } from '@formulaxjs/renderer';
import type { RuntimeEditorOptions } from '@formulaxjs/runtime';

export interface RendererV2RenderOptions extends FormulaRenderOptions {
  height?: number | string;
  runtime?: Pick<RuntimeEditorOptions, 'assets' | 'readOnly'>;
}
