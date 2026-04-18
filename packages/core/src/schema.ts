import type { FormulaNode } from './ast';

export const schema = {
  doc: ['body'],
  group: ['body'],
  text: [],
  frac: ['numerator', 'denominator'],
  supsub: ['base', 'sup', 'sub'],
  sqrt: ['value'],
  fenced: ['body'],
} as const;

export type FormulaNodeType = keyof typeof schema;

export const isContainerNode = (node: FormulaNode): boolean => schema[node.type].length > 0;
