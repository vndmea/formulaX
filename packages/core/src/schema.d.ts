import type { FormulaNode } from './ast';
export declare const schema: {
    readonly doc: readonly ["body"];
    readonly group: readonly ["body"];
    readonly text: readonly [];
    readonly frac: readonly ["numerator", "denominator"];
    readonly supsub: readonly ["base", "sup", "sub"];
    readonly sqrt: readonly ["value"];
    readonly fenced: readonly ["body"];
};
export type FormulaNodeType = keyof typeof schema;
export declare const isContainerNode: (node: FormulaNode) => boolean;
//# sourceMappingURL=schema.d.ts.map