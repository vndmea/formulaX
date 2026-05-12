import type { FormulaXKityEditorOptions } from '@formulax/editor';

export interface FormulaXPayload {
  latex: string;
  html?: string;
}

export interface FormulaXTiptapOptions {
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
  editor?: Omit<FormulaXKityEditorOptions, 'initialLatex'>;
}

export interface RequiredFormulaXTiptapOptions {
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
    assets: FormulaXKityEditorOptions['assets'];
    render: {
      fontsize: number;
    };
  };
}

