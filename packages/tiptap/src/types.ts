import type { FormulaXEditorOptions, FormulaXEditorPreloadMode } from '@formulaxjs/editor';
import type { FormulaMarkupOutput, FormulaRenderer } from '@formulaxjs/renderer';
import type {
  FormulaXImageOptions,
} from '@formulaxjs/renderer-image';

export type FormulaXOutputMode = FormulaMarkupOutput;

export interface FormulaXPayload {
  latex: string;
  output?: FormulaXOutputMode;
  image?: {
    url: string;
    width?: number;
    height?: number;
    style?: string;
  };
}

export interface FormulaXTiptapOptions {
  name?: string;
  formulaClassName?: string;
  formulaAttributeName?: string;
  cursorStyle?: string;
  initialLatex?: string;
  output?: FormulaXOutputMode;
  image?: FormulaXImageOptions;
  renderer?: FormulaRenderer;
  preload?: FormulaXEditorPreloadMode;
  modal?: {
    title?: string;
    insertText?: string;
    updateText?: string;
    cancelText?: string;
    closeOnBackdrop?: boolean;
  };
  editor?: Omit<FormulaXEditorOptions, 'initialLatex'>;
}

export interface RequiredFormulaXTiptapOptions {
  name: string;
  formulaClassName: string;
  formulaAttributeName: string;
  cursorStyle: string;
  initialLatex: string;
  output: FormulaXOutputMode;
  image?: FormulaXImageOptions;
  renderer: FormulaRenderer;
  preload: FormulaXEditorPreloadMode;
  modal: {
    title: string;
    insertText: string;
    updateText: string;
    cancelText: string;
    closeOnBackdrop: boolean;
  };
  editor: {
    height: number | string;
    autofocus: boolean;
    runtime: FormulaXEditorOptions['runtime'];
    locale: FormulaXEditorOptions['locale'];
    assets: FormulaXEditorOptions['assets'];
    runtimeAssets: FormulaXEditorOptions['runtimeAssets'];
    wrap: NonNullable<FormulaXEditorOptions['wrap']>;
    maxWidth: NonNullable<FormulaXEditorOptions['maxWidth']>;
    lineGap: number;
    continuationIndent: number;
    render: {
      fontsize: number;
    };
  };
}
