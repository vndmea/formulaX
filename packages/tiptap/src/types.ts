import type { FormulaXEditorOptions, FormulaXEditorPreloadMode } from '@formulaxjs/editor';
import type { FormulaRenderer } from '@formulaxjs/renderer';

export interface FormulaXPayload {
  latex: string;
}

export interface FormulaXTiptapOptions {
  name?: string;
  formulaClassName?: string;
  formulaAttributeName?: string;
  cursorStyle?: string;
  initialLatex?: string;
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
    locale: FormulaXEditorOptions['locale'];
    assets: FormulaXEditorOptions['assets'];
    render: {
      fontsize: number;
    };
  };
}
