export type FormulaEnvironmentName = 'matrix' | 'cases';

export interface FormulaDiagnostic {
  message: string;
  severity: 'error' | 'warning';
}

export interface FormulaDoc {
  type: 'doc';
  id: string;
  root: FormulaRowNode;
  sourceLatex: string;
  version: number;
  diagnostics: FormulaDiagnostic[];
}

export interface FormulaRowNode {
  type: 'row';
  id: string;
  children: FormulaNode[];
  placeholder?: FormulaPlaceholderNode;
}

export interface FormulaSymbolNode {
  type: 'symbol';
  id: string;
  value: string;
  latex?: string;
  fontFamily?: string;
}

export interface FormulaPlaceholderNode {
  type: 'placeholder';
  id: string;
  role?: string;
  label?: string;
  required?: boolean;
  isRoot?: boolean;
}

export interface FormulaFractionNode {
  type: 'frac';
  id: string;
  numerator: FormulaRowNode;
  denominator: FormulaRowNode;
}

export interface FormulaSqrtNode {
  type: 'sqrt';
  id: string;
  index?: FormulaRowNode;
  value: FormulaRowNode;
}

export interface FormulaScriptNode {
  type: 'script';
  id: string;
  base: FormulaNode;
  sup?: FormulaRowNode;
  sub?: FormulaRowNode;
  order?: Array<'sup' | 'sub'>;
}

export interface FormulaFunctionNode {
  type: 'function';
  id: string;
  name: string;
  body: FormulaRowNode;
  bodyStyle?: 'atom' | 'group';
}

export interface FormulaLargeOperatorNode {
  type: 'large-op';
  id: string;
  operator: 'sum';
  sup?: FormulaRowNode;
  sub?: FormulaRowNode;
  order?: Array<'sup' | 'sub'>;
  body: FormulaRowNode;
  bodyStyle?: 'atom' | 'group';
}

export interface FormulaIntegralNode {
  type: 'integral';
  id: string;
  operator: 'int' | 'iint' | 'iiint';
  sup?: FormulaRowNode;
  sub?: FormulaRowNode;
  order?: Array<'sup' | 'sub'>;
  body: FormulaRowNode;
  bodyStyle?: 'atom' | 'group';
}

export interface FormulaFenceNode {
  type: 'fence';
  id: string;
  left: string;
  right: string;
  body: FormulaRowNode;
}

export interface FormulaMatrixNode {
  type: 'matrix';
  id: string;
  environment: FormulaEnvironmentName;
  rows: FormulaRowNode[][];
}

export interface FormulaUnsupportedNode {
  type: 'unsupported';
  id: string;
  rawLatex: string;
  reason?: string;
}

export type FormulaNode =
  | FormulaRowNode
  | FormulaSymbolNode
  | FormulaPlaceholderNode
  | FormulaFractionNode
  | FormulaSqrtNode
  | FormulaScriptNode
  | FormulaFunctionNode
  | FormulaLargeOperatorNode
  | FormulaIntegralNode
  | FormulaFenceNode
  | FormulaMatrixNode
  | FormulaUnsupportedNode;

export interface FormulaCaretSelection {
  kind: 'caret';
  rowId: string;
  offset: number;
}

export interface FormulaRangeSelection {
  kind: 'range';
  rowId: string;
  anchorOffset: number;
  focusOffset: number;
  startOffset: number;
  endOffset: number;
}

export interface FormulaNodeSelection {
  kind: 'node';
  rowId: string;
  nodeId: string;
  startOffset: number;
  endOffset: number;
}

export type FormulaSelection =
  | FormulaCaretSelection
  | FormulaRangeSelection
  | FormulaNodeSelection;

export interface FormulaHistorySnapshot {
  doc: FormulaDoc;
  selection: FormulaSelection | null;
}

export interface FormulaHistoryState {
  undoStack: FormulaHistorySnapshot[];
  redoStack: FormulaHistorySnapshot[];
  maxDepth: number;
}

export type FormulaHistoryReason =
  | 'insert'
  | 'delete'
  | 'replace'
  | 'structure'
  | 'paste'
  | 'composition'
  | 'programmatic'
  | 'unknown';

export interface RuntimeEditorAssets {
  fontFamily?: string;
}

export interface RuntimeEditorOptions {
  initialLatex?: string;
  height?: number | string;
  autofocus?: boolean;
  readOnly?: boolean;
  assets?: Partial<RuntimeEditorAssets>;
  wrap?: 'none' | 'soft';
  maxWidth?: number | 'host';
  lineGap?: number;
  continuationIndent?: number;
  render?: {
    fontSize?: number;
    fontsize?: number;
  };
  locale?: string;
}

export interface RuntimeEditorHandle {
  root: HTMLElement;
  editor: {
    getLatex(): string;
    setLatex(latex: string, options?: FormulaDispatchOptions): void;
    getRenderHtml(): string;
    getSelection(): FormulaSelection | null;
    dispatch(command: FormulaCommand, options?: FormulaDispatchOptions): void;
    undo(): boolean;
    redo(): boolean;
    canUndo(): boolean;
    canRedo(): boolean;
    clearHistory(): void;
    focus(): void;
    destroy(): void;
  };
  ready: Promise<void>;
  getLatex(): string;
  setLatex(latex: string, options?: FormulaDispatchOptions): void;
  getRenderHtml(): string;
  getSelection(): FormulaSelection | null;
  focus(): void;
  destroy(): void;
}

export interface FormulaDispatchOptions {
  addToHistory?: boolean;
  historyReason?: FormulaHistoryReason;
  mergeWithPrevious?: boolean;
  preserveHistory?: boolean;
}

export type FormulaCommandName =
  | 'insertText'
  | 'insertLatex'
  | 'deleteBackward'
  | 'moveLeft'
  | 'moveRight'
  | 'moveUp'
  | 'moveDown'
  | 'moveToNextPlaceholder'
  | 'moveToPreviousPlaceholder'
  | 'selectAll'
  | 'insertFraction'
  | 'insertSqrt'
  | 'insertSuperscript'
  | 'insertSubscript'
  | 'undo'
  | 'redo';

export interface FormulaCommandPayloadMap {
  insertText: { text: string };
  insertLatex: { latex: string };
  deleteBackward: undefined;
  moveLeft: undefined;
  moveRight: undefined;
  moveUp: undefined;
  moveDown: undefined;
  moveToNextPlaceholder: undefined;
  moveToPreviousPlaceholder: undefined;
  selectAll: undefined;
  insertFraction: undefined;
  insertSqrt: undefined;
  insertSuperscript: undefined;
  insertSubscript: undefined;
  undo: undefined;
  redo: undefined;
}

export interface FormulaCommand<Name extends FormulaCommandName = FormulaCommandName> {
  type: Name;
  payload: FormulaCommandPayloadMap[Name];
}
