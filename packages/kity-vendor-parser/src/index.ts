import { parseLatex as parseFormulaLatex, serializeLatex as serializeFormulaLatex, type FormulaDoc } from '@formulax/core';

export type KityFormulaAst = FormulaDoc;

export function parseLatex(latex: string): KityFormulaAst {
  return parseFormulaLatex(latex);
}

export function serializeLatex(ast: KityFormulaAst): string {
  return serializeFormulaLatex(ast);
}
