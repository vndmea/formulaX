import { Node } from '@tiptap/core';
import { parseLatex, serializeLatex, type FormulaDoc } from '@formulax/core';

export interface FormulaXNodeAttributes {
  latex: string;
}

export const FormulaXNode = Node.create({
  name: 'formulaX',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return {
      latex: {
        default: '',
      },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-formulax]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', { ...HTMLAttributes, 'data-formulax': 'true' }];
  },
});

export const createFormulaXPayload = (latex: string): FormulaDoc => parseLatex(latex);

export const serializeFormulaXPayload = (doc: FormulaDoc): string => serializeLatex(doc);
