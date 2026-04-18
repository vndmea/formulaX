import type { FormulaPath } from './ast';

export interface FormulaSelection {
  anchor: FormulaPath;
  focus: FormulaPath;
}

export const createSelection = (path: FormulaPath = []): FormulaSelection => ({
  anchor: [...path],
  focus: [...path],
});

export const isCollapsed = (selection: FormulaSelection): boolean =>
  selection.anchor.join('.') === selection.focus.join('.');
