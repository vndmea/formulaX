import type { FormulaPath } from './ast';
export interface FormulaSelection {
    anchor: FormulaPath;
    focus: FormulaPath;
}
export declare const createSelection: (path?: FormulaPath) => FormulaSelection;
export declare const isCollapsed: (selection: FormulaSelection) => boolean;
//# sourceMappingURL=selection.d.ts.map