import { fenced, frac, sqrt, supsub, text, type FormulaDoc } from './ast';
import type { FormulaState } from './transaction';
import { FormulaTransaction } from './transaction';

export type FormulaCommand = (state: FormulaState) => FormulaState;

export const insertText = (value: string): FormulaCommand => (state) =>
  new FormulaTransaction(state).insert(text(value)).apply();

export const insertFraction = (): FormulaCommand => (state) =>
  new FormulaTransaction(state).insert(frac([], [])).apply();

export const insertSuperscript = (): FormulaCommand => (state) =>
  new FormulaTransaction(state).insert(supsub([text('x')], [text('2')])).apply();

export const insertSubscript = (): FormulaCommand => (state) =>
  new FormulaTransaction(state).insert(supsub([text('x')], undefined, [text('i')])).apply();

export const insertSqrt = (): FormulaCommand => (state) =>
  new FormulaTransaction(state).insert(sqrt([])).apply();

export const insertFenced = (left = '(', right = ')'): FormulaCommand => (state) =>
  new FormulaTransaction(state).insert(fenced(left, right, [])).apply();

export const backspace = (): FormulaCommand => (state) => new FormulaTransaction(state).deleteBackward().apply();

export const createEmptyState = (): FormulaState => ({
  doc: { type: 'doc', body: [] },
  selection: { anchor: [0], focus: [0] },
});

export const applyCommand = (state: FormulaState, command: FormulaCommand): FormulaState => command(state);

export const createStateFromDoc = (doc: FormulaDoc): FormulaState => ({
  doc,
  selection: { anchor: [doc.body.length], focus: [doc.body.length] },
});
