export type FormulaNode =
  | FormulaDoc
  | TextNode
  | GroupNode
  | FractionNode
  | SupSubNode
  | SqrtNode
  | FencedNode;

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

export const text = (value: string): TextNode => ({ type: 'text', value });

export const group = (body: FormulaNode[] = []): GroupNode => ({ type: 'group', body });

export const doc = (body: FormulaNode[] = []): FormulaDoc => ({ type: 'doc', body });

export const frac = (numerator: FormulaNode[] = [], denominator: FormulaNode[] = []): FractionNode => ({
  type: 'frac',
  numerator,
  denominator,
});

export const supsub = (base: FormulaNode[], sup?: FormulaNode[], sub?: FormulaNode[]): SupSubNode => ({
  type: 'supsub',
  base,
  sup,
  sub,
});

export const sqrt = (value: FormulaNode[] = []): SqrtNode => ({ type: 'sqrt', value });

export const fenced = (left: string, right: string, body: FormulaNode[] = []): FencedNode => ({
  type: 'fenced',
  left,
  right,
  body,
});
