export type FormulaRenderOutput = 'latex' | 'svg' | 'html' | 'mathml';

export type FormulaMarkupOutput = 'latex' | 'svg' | 'image';

export interface FormulaRenderOptions {
  displayMode?: boolean;
  fontSize?: number;
  className?: string;
  throwOnError?: boolean;
  cache?: boolean;
}

export interface FormulaRenderResult {
  engine: string;
  output: FormulaRenderOutput;
  latex: string;
  html: string;
}

export interface FormulaRenderer {
  renderLatex(latex: string, options?: FormulaRenderOptions): Promise<FormulaRenderResult>;
}

export interface ParsedFormulaElement {
  latex: string;
  output: FormulaMarkupOutput;
  displayMode: boolean;
}
