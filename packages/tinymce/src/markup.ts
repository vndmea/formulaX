import { parseLatex, serializeLatex, type FormulaDoc } from '@formulaxjs/core';
import {
  DEFAULT_FORMULA_ATTRIBUTE,
  DEFAULT_FORMULA_CLASS,
  FORMULA_FLAG_ATTRIBUTE,
  createFormulaElement,
  createFormulaMarkup,
  escapeAttribute,
  escapeHtml,
  findFormulaElement,
  getFormulaLatexFromElement,
  isFormulaElement,
  replaceFormulaElement,
  type CreateFormulaMarkupOptions,
} from '@formulaxjs/renderer';

export type { CreateFormulaMarkupOptions };

export function createTinyMceFormulaMarkup(
  latex: string,
  options: CreateFormulaMarkupOptions = {},
): string {
  return createFormulaMarkup(latex, {
    ...options,
    extraAttributes: {
      ...options.extraAttributes,
      'data-mce-contenteditable': 'false',
    },
  });
}

export function parseTinyMceFormulaMarkup(latex: string): FormulaDoc {
  return parseLatex(latex);
}

export function serializeTinyMceFormulaMarkup(
  doc: FormulaDoc,
  options: CreateFormulaMarkupOptions = {},
): string {
  return createTinyMceFormulaMarkup(serializeLatex(doc), options);
}

export function createTinyMceFormulaElement(
  ownerDocument: Document,
  latex: string,
  options: CreateFormulaMarkupOptions = {},
): HTMLElement | null {
  return createFormulaElement(ownerDocument, latex, {
    ...options,
    extraAttributes: {
      ...options.extraAttributes,
      'data-mce-contenteditable': 'false',
    },
  });
}

export {
  DEFAULT_FORMULA_ATTRIBUTE,
  DEFAULT_FORMULA_CLASS,
  FORMULA_FLAG_ATTRIBUTE,
  escapeAttribute,
  escapeHtml,
  findFormulaElement,
  getFormulaLatexFromElement,
  isFormulaElement,
  replaceFormulaElement,
};
