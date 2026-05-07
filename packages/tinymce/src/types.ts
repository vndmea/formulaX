import type { FormulaState } from '@formulax/core';
import type { KityEditorAssets } from '@formulax/kity-runtime';

export interface TinyMceLike {
  PluginManager?: {
    add: (name: string, callback: (editor: TinyMceEditorLike, pluginUrl?: string) => unknown) => void;
  };
  majorVersion?: string | number;
  minorVersion?: string | number;
}

export interface TinyMceEditorLike {
  id?: string;
  insertContent: (content: string) => void;
  addCommand: (name: string, callback: (...args: unknown[]) => void) => void;
  execCommand: (name: string, ui?: boolean, value?: unknown) => void;
  on: (name: string, callback: (event: any) => void) => void;
  off?: (name: string, callback: (event: any) => void) => void;
  ui?: {
    registry?: {
      addButton?: (name: string, config: Record<string, unknown>) => void;
      addMenuItem?: (name: string, config: Record<string, unknown>) => void;
      addIcon?: (name: string, svg: string) => void;
    };
  };
  selection?: {
    getNode?: () => HTMLElement;
    select?: (node: HTMLElement) => void;
  };
  dom?: {
    encode?: (value: string) => string;
    decode?: (value: string) => string;
  };
  schema?: {
    addValidElements?: (validElements: string) => void;
  };
  getDoc?: () => Document;
  getWin?: () => Window;
  getBody?: () => HTMLElement;
  focus?: () => void;
  dispatch?: (name: string, args?: Record<string, unknown>) => void;
  fire?: (name: string, args?: Record<string, unknown>) => void;
}

export interface FormulaXTinyMceOptions {
  pluginName?: string;
  buttonName?: string;
  menuItemName?: string;
  toolbarText?: string;
  tooltip?: string;
  formulaClassName?: string;
  formulaAttributeName?: string;
  renderMode?: 'text' | 'html';
  modal?: FormulaXModalOptions;
  initialLatex?: string;
  editor?: FormulaXEditorOptions;
}

export interface FormulaXEditorOptions {
  mode?: 'kity';
  height?: number | string;
  autofocus?: boolean;
  assets?: Partial<KityEditorAssets>;
  render?: {
    fontsize?: number;
  };
}

export interface FormulaXModalOptions {
  title?: string;
  insertText?: string;
  updateText?: string;
  cancelText?: string;
  width?: string;
  height?: string;
  closeOnBackdrop?: boolean;
}

export interface RequiredFormulaXTinyMceOptions {
  pluginName: string;
  buttonName: string;
  menuItemName: string;
  toolbarText: string;
  tooltip: string;
  formulaClassName: string;
  formulaAttributeName: string;
  renderMode: 'text' | 'html';
  initialLatex: string;
  modal: Required<FormulaXModalOptions>;
  editor: Required<FormulaXEditorOptions>;
}

export interface FormulaXModalOpenOptions {
  editor: TinyMceEditorLike;
  target?: HTMLElement | null;
  initialLatex?: string;
  options: RequiredFormulaXTinyMceOptions;
}

export interface MountedFormulaXEditor {
  root: HTMLElement;
  getLatex: () => string | Promise<string>;
  getState: () => FormulaState | Promise<FormulaState>;
  getRenderHtml?: () => string | Promise<string>;
  destroy: () => void;
}
