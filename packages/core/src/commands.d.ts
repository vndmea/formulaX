import { type FormulaDoc } from './ast';
import type { FormulaState } from './transaction';
export type FormulaCommand = (state: FormulaState) => FormulaState;
export declare const insertText: (value: string) => FormulaCommand;
export declare const insertFraction: () => FormulaCommand;
export declare const insertSuperscript: () => FormulaCommand;
export declare const insertSubscript: () => FormulaCommand;
export declare const insertSqrt: () => FormulaCommand;
export declare const insertFenced: (left?: string, right?: string) => FormulaCommand;
export declare const backspace: () => FormulaCommand;
export declare const createEmptyState: () => FormulaState;
export declare const applyCommand: (state: FormulaState, command: FormulaCommand) => FormulaState;
export declare const createStateFromDoc: (doc: FormulaDoc) => FormulaState;
//# sourceMappingURL=commands.d.ts.map