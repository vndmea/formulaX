import type { FormulaXKityEditorOptions } from '@formulaxjs/editor';

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
  editor?: Omit<FormulaXKityEditorOptions, 'initialLatex'>;
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
    assets: FormulaXKityEditorOptions['assets'];
    render: {
      fontsize: number;
    };
  };
}
