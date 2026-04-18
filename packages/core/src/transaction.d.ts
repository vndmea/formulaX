import type { FormulaDoc, FormulaNode } from './ast';
import type { FormulaSelection } from './selection';
export interface FormulaState {
    doc: FormulaDoc;
    selection: FormulaSelection;
}
export declare class FormulaTransaction {
    private doc;
    private selection;
    constructor(state: FormulaState);
    insert(node: FormulaNode): FormulaTransaction;
    deleteBackward(): FormulaTransaction;
    moveFocus(nextFocus: number[]): FormulaTransaction;
    apply(): FormulaState;
}
//# sourceMappingURL=transaction.d.ts.map