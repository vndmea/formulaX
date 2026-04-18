export type FormulaNode = FormulaDoc | TextNode | GroupNode | FractionNode | SupSubNode | SqrtNode | FencedNode;
export interface FormulaDoc {
    type: 'doc';
    body: FormulaNode[];
}
export interface TextNode {
    type: 'text';
    value: string;
}
export interface GroupNode {
    type: 'group';
    body: FormulaNode[];
}
export interface FractionNode {
    type: 'frac';
    numerator: FormulaNode[];
    denominator: FormulaNode[];
}
export interface SupSubNode {
    type: 'supsub';
    base: FormulaNode[];
    sup?: FormulaNode[];
    sub?: FormulaNode[];
}
export interface SqrtNode {
    type: 'sqrt';
    value: FormulaNode[];
}
export interface FencedNode {
    type: 'fenced';
    left: string;
    right: string;
    body: FormulaNode[];
}
export type FormulaPath = number[];
export declare const text: (value: string) => TextNode;
export declare const group: (body?: FormulaNode[]) => GroupNode;
export declare const doc: (body?: FormulaNode[]) => FormulaDoc;
export declare const frac: (numerator?: FormulaNode[], denominator?: FormulaNode[]) => FractionNode;
export declare const supsub: (base: FormulaNode[], sup?: FormulaNode[], sub?: FormulaNode[]) => SupSubNode;
export declare const sqrt: (value?: FormulaNode[]) => SqrtNode;
export declare const fenced: (left: string, right: string, body?: FormulaNode[]) => FencedNode;
//# sourceMappingURL=ast.d.ts.map