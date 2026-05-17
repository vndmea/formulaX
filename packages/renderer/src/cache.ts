export interface FormulaRenderCacheKeyInput {
  engine: string;
  latex: string;
  output?: string;
  fontSize?: number;
  displayMode?: boolean;
  className?: string;
  assetCacheKey?: string;
}

export function createFormulaRenderCacheKey(input: FormulaRenderCacheKeyInput): string {
  return JSON.stringify({
    engine: input.engine,
    latex: input.latex,
    output: input.output,
    fontSize: input.fontSize,
    displayMode: input.displayMode,
    className: input.className,
    assetCacheKey: input.assetCacheKey,
  });
}
