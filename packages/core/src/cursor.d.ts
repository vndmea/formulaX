import type { FormulaPath } from './ast';
import type { FormulaSelection } from './selection';
export interface CursorState {
    path: FormulaPath;
}
export declare const createCursor: (path?: FormulaPath) => CursorState;
export declare const selectionToCursor: (selection: FormulaSelection) => CursorState;
//# sourceMappingURL=cursor.d.ts.map