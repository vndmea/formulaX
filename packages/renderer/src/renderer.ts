import type { FormulaRenderer, FormulaRenderResult } from './types';

export function createFormulaRenderer(): FormulaRenderer {
  return {
    async renderLatex(latex: string): Promise<FormulaRenderResult> {
      return {
        engine: 'latex',
        output: 'latex',
        latex: latex.trim(),
        html: '',
      };
    },
  };
}

export const createLatexFormulaRenderer = createFormulaRenderer;
