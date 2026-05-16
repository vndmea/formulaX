import type { FormulaXEditorOptions, FormulaXEditorPreloadMode } from '@formulaxjs/editor';
import type { FormulaRenderer } from '@formulaxjs/renderer';

export interface FormulaXPayload {
  latex: string;
}

export interface FormulaXCKEditor5Options {
  name?: string;
  buttonName?: string;
  toolbarText?: string;
  tooltip?: string;
  cursorStyle?: string;
  formulaClassName?: string;
  formulaAttributeName?: string;
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

export interface RequiredFormulaXCKEditor5Options {
  name: string;
  buttonName: string;
  toolbarText: string;
  tooltip: string;
  cursorStyle: string;
  formulaClassName: string;
  formulaAttributeName: string;
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
    assets: FormulaXEditorOptions['assets'];
    render: {
      fontsize: number;
    };
  };
}
