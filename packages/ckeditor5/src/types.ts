import type {
  FormulaXEditorOptions,
  FormulaXEditorPreloadMode,
  FormulaXIconOptions,
} from '@formulaxjs/editor';
import type { FormulaRenderer } from '@formulaxjs/renderer';
import type {
  FormulaXImageOptions,
  FormulaXOutputMode,
} from '@formulaxjs/renderer-image';

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

export interface FormulaXCKEditor5Options extends FormulaXIconOptions {
  name?: string;
  buttonName?: string;
  toolbarText?: string;
  tooltip?: string;
  cursorStyle?: string;
  formulaClassName?: string;
  formulaAttributeName?: string;
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

export interface RequiredFormulaXCKEditor5Options {
  name: string;
  buttonName: string;
  toolbarText: string;
  tooltip: string;
  formulaIcon: string;
  formulaIconName: string;
  cursorStyle: string;
  formulaClassName: string;
  formulaAttributeName: string;
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
    locale: FormulaXEditorOptions['locale'];
    assets: FormulaXEditorOptions['assets'];
    render: {
      fontsize: number;
    };
  };
}
