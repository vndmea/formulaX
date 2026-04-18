import type { FormulaDoc, FormulaNode, FormulaPath } from './ast';
type ContainerKey = 'body' | 'numerator' | 'denominator' | 'base' | 'sup' | 'sub' | 'value';
export declare const cloneNode: <T extends FormulaNode>(node: T) => T;
export declare const cloneDoc: (node: FormulaDoc) => FormulaDoc;
export interface ResolvedParent {
    container: FormulaNode[];
    index: number;
}
export declare const resolveParent: (root: FormulaDoc, path: FormulaPath) => ResolvedParent;
export declare const insertAtPath: (root: FormulaDoc, path: FormulaPath, node: FormulaNode) => FormulaDoc;
export declare const removeAtPath: (root: FormulaDoc, path: FormulaPath) => FormulaDoc;
export declare const getNodeAtPath: (root: FormulaDoc, path: FormulaPath) => FormulaNode | null;
export declare const containerKeyForBranch: (node: FormulaNode, branch: number) => ContainerKey;
export {};
//# sourceMappingURL=traversal.d.ts.map