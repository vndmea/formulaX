import type { FormulaRenderOptions } from '@formulaxjs/renderer';
import type { RuntimeEditorOptions } from '@formulaxjs/runtime';

export interface RendererV2RenderOptions extends FormulaRenderOptions {
  height?: number | string;
  wrap?: RuntimeEditorOptions['wrap'];
  maxWidth?: number;
  lineGap?: number;
  continuationIndent?: number;
  runtime?: Pick<RuntimeEditorOptions, 'assets' | 'readOnly'>;
}
