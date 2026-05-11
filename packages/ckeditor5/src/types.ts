import type { KityEditorAssets } from '@formulax/kity-runtime';

export interface FormulaXPayload {
  latex: string;
  html?: string;
}

export interface FormulaXCKEditor5Options {
  buttonName?: string;
  toolbarText?: string;
  tooltip?: string;
  cursorStyle?: string;
  formulaClassName?: string;
  formulaAttributeName?: string;
  modal?: {
    title?: string;
    insertText?: string;
    updateText?: string;
    cancelText?: string;
    closeOnBackdrop?: boolean;
  };
  editor?: {
    height?: number | string;
    autofocus?: boolean;
    assets?: Partial<KityEditorAssets>;
    render?: {
      fontsize?: number;
    };
  };
}

export interface RequiredFormulaXCKEditor5Options {
  buttonName: string;
  toolbarText: string;
  tooltip: string;
  cursorStyle: string;
  formulaClassName: string;
  formulaAttributeName: string;
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
    assets: Partial<KityEditorAssets>;
    render: {
      fontsize: number;
    };
  };
}
