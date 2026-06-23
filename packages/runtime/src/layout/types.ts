export interface LayoutBox {
  id: string;
  nodeId: string;
  kind: string;
  x: number;
  y: number;
  width: number;
  height: number;
  ascent: number;
  descent: number;
  text?: string;
  fontFamily?: string;
  rowId?: string;
  children: LayoutBox[];
}

export type FormulaWrapMode = 'none' | 'soft';

export type FormulaBreakStrategy = 'operator' | 'greedy' | 'balanced';

export interface LayoutFragment {
  id: string;
  nodeId: string;
  boxId: string;
  lineIndex: number;
  childIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  ascent: number;
  descent: number;
  box: LayoutBox;
}

export interface LayoutLine {
  id: string;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  ascent: number;
  descent: number;
  baseline: number;
  startOffset: number;
  endOffset: number;
  fragments: LayoutFragment[];
}

export interface LayoutResult {
  root: LayoutBox;
  width: number;
  height: number;
  baseline: number;
  lines: LayoutLine[];
  nodeMap: Map<string, LayoutBox>;
  fragmentsByNodeId: Map<string, LayoutFragment[]>;
}

export interface FormulaLayoutOptions {
  fontSize: number;
  fontFamily?: string;
  maxWidth?: number;
  wrap?: FormulaWrapMode;
  continuationIndent?: number;
  breakStrategy?: FormulaBreakStrategy;
  scriptScale?: number;
  lineGap?: number;
  ruleThickness?: number;
  cellGap?: number;
}

export interface FormulaTextStyle {
  fontFamily: string;
  fontSize: number;
  fontStyle?: string;
  fontWeight?: string;
}

export interface TextMetricsBox {
  width: number;
  height: number;
  ascent: number;
  descent: number;
}

export interface FormulaMetrics {
  measureText(text: string, style: FormulaTextStyle): TextMetricsBox;
}
