export type FormulaRenderOutput = 'svg' | 'html' | 'mathml';

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
