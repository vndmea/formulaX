import type { FormulaState } from '@formulaxjs/core';
import type { FormulaXEditorOptions, FormulaXEditorPreloadMode } from '@formulaxjs/editor';
import type { FormulaRenderer } from '@formulaxjs/renderer';

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
    getRng?: () => Range;
    setRng?: (range: Range) => void;
    select?: (node: HTMLElement) => void;
    collapse?: (toStart?: boolean) => void;
  };
  undoManager?: {
    transact?: (callback: () => void) => void;
    add?: () => void;
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
  nodeChanged?: () => void;
  dispatch?: (name: string, args?: Record<string, unknown>) => void;
  fire?: (name: string, args?: Record<string, unknown>) => void;
}

export interface FormulaXTinyMceOptions {
  pluginName?: string;
  buttonName?: string;
  menuItemName?: string;
  toolbarText?: string;
  tooltip?: string;
  cursorStyle?: string;
  formulaClassName?: string;
  formulaAttributeName?: string;
  renderer?: FormulaRenderer;
  preload?: FormulaXEditorPreloadMode;
  modal?: FormulaXModalOptions;
  initialLatex?: string;
  editor?: Omit<FormulaXEditorOptions, 'initialLatex'>;
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
  cursorStyle: string;
  formulaClassName: string;
  formulaAttributeName: string;
  initialLatex: string;
  renderer: FormulaRenderer;
  preload: FormulaXEditorPreloadMode;
  modal: Required<FormulaXModalOptions>;
  editor: Required<Omit<FormulaXEditorOptions, 'initialLatex'>>;
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
