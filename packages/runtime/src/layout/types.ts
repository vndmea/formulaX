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
  rowId?: string;
  children: LayoutBox[];
}

export interface LayoutResult {
  root: LayoutBox;
  width: number;
  height: number;
  baseline: number;
  nodeMap: Map<string, LayoutBox>;
}

export interface FormulaLayoutOptions {
  fontSize: number;
  fontFamily?: string;
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
