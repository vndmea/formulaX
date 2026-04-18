import type { FormulaPath } from './ast';
import type { FormulaSelection } from './selection';

export interface CursorState {
  path: FormulaPath;
}

export const createCursor = (path: FormulaPath = []): CursorState => ({ path: [...path] });

export const selectionToCursor = (selection: FormulaSelection): CursorState => ({
  path: [...selection.focus],
});
