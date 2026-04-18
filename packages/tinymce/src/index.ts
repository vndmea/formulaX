import { parseLatex, serializeLatex, type FormulaDoc } from '@formulax/core';

export interface TinyMceFormulaXOptions {
  attributeName?: string;
}

export const createTinyMceFormulaMarkup = (latex: string, options: TinyMceFormulaXOptions = {}): string => {
  const attributeName = options.attributeName ?? 'data-formulax';
  return `<span ${attributeName}="${latex}"></span>`;
};

export const parseTinyMceFormulaMarkup = (latex: string): FormulaDoc => parseLatex(latex);

export const serializeTinyMceFormulaMarkup = (doc: FormulaDoc, options: TinyMceFormulaXOptions = {}): string => {
  return createTinyMceFormulaMarkup(serializeLatex(doc), options);
};
