import {
  ensureFormulaXModalStyles,
  formulaXModalStyles,
} from '@formulaxjs/editor';

export const tinymceStyles = formulaXModalStyles;

export function ensureTinyMceStyles(doc: Document = document): void {
  ensureFormulaXModalStyles(doc);
}
