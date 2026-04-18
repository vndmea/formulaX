import type { FormulaDoc, FormulaNode } from './ast';
import type { FormulaSelection } from './selection';
import { insertAtPath, removeAtPath } from './traversal';

export interface FormulaState {
  doc: FormulaDoc;
  selection: FormulaSelection;
}

export class FormulaTransaction {
  private doc: FormulaDoc;
  private selection: FormulaSelection;

  constructor(state: FormulaState) {
    this.doc = structuredClone(state.doc);
    this.selection = structuredClone(state.selection);
  }

  insert(node: FormulaNode): FormulaTransaction {
    this.doc = insertAtPath(this.doc, this.selection.focus, node);
    this.selection = {
      anchor: [...this.selection.focus],
      focus: [...this.selection.focus.slice(0, -1), (this.selection.focus.at(-1) ?? 0) + 1],
    };
    return this;
  }

  deleteBackward(): FormulaTransaction {
    this.doc = removeAtPath(this.doc, this.selection.focus);
    this.selection = {
      anchor: [...this.selection.focus.slice(0, -1), Math.max((this.selection.focus.at(-1) ?? 0) - 1, 0)],
      focus: [...this.selection.focus.slice(0, -1), Math.max((this.selection.focus.at(-1) ?? 0) - 1, 0)],
    };
    return this;
  }

  moveFocus(nextFocus: number[]): FormulaTransaction {
    this.selection = {
      anchor: [...nextFocus],
      focus: [...nextFocus],
    };
    return this;
  }

  apply(): FormulaState {
    return {
      doc: this.doc,
      selection: this.selection,
    };
  }
}
