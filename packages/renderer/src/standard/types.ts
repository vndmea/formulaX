import type { FormulaRenderOptions } from '../shared/types';
import type { RuntimeEditorOptions } from '@formulaxjs/runtime';

export interface StandardRendererOptions extends FormulaRenderOptions {
  height?: number | string;
  wrap?: RuntimeEditorOptions['wrap'];
  maxWidth?: number;
  lineGap?: number;
  continuationIndent?: number;
  runtime?: {
    assets?: RuntimeEditorOptions['assets'];
    readOnly?: RuntimeEditorOptions['readOnly'];
  };
}
