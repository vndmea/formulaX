import type { FormulaXEditorOptions } from '@formulaxjs/editor';

export interface FormulaXPayload {
  latex: string;
}

export interface FormulaXTiptapOptions {
  name?: string;
  formulaClassName?: string;
  formulaAttributeName?: string;
  cursorStyle?: string;
  initialLatex?: string;
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
    assets: FormulaXEditorOptions['assets'];
    render: {
      fontsize: number;
    };
  };
}
