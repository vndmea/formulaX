import {
  ensureFormulaXModalStyles,
  formulaXModalStyles,
} from '@formulax/editor';

export const tinymceStyles = formulaXModalStyles;

export function ensureTinyMceStyles(doc: Document = document): void {
  ensureFormulaXModalStyles(doc);
}
