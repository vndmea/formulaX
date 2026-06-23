import type { FormulaDoc, FormulaHistorySnapshot, FormulaSelection } from './types';

export function cloneFormulaDoc(doc: FormulaDoc): FormulaDoc {
  return structuredClone(doc);
}

export function cloneFormulaSelection(selection: FormulaSelection | null): FormulaSelection | null {
  return selection ? { ...selection } : null;
}

export function createHistorySnapshot(
  doc: FormulaDoc,
  selection: FormulaSelection | null,
): FormulaHistorySnapshot {
  return {
    doc: cloneFormulaDoc(doc),
    selection: cloneFormulaSelection(selection),
  };
}
