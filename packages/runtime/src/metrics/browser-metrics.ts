import type { FormulaMetrics, FormulaTextStyle, TextMetricsBox } from './types';

const SVG_NS = 'http://www.w3.org/2000/svg';

export class BrowserFormulaMetrics implements FormulaMetrics {
  private readonly canvasContext: CanvasRenderingContext2D | null;
  private readonly svgRoot: SVGSVGElement | null;
  private readonly textNode: SVGTextElement | null;

  constructor(doc: Document = document) {
    const canvas = doc.createElement('canvas');
    let context: CanvasRenderingContext2D | null = null;
    const userAgent = doc.defaultView?.navigator?.userAgent ?? '';
    if (!/jsdom/i.test(userAgent)) {
      try {
        context = canvas.getContext('2d');
      } catch {
        context = null;
      }
    }
    this.canvasContext = context;
    this.svgRoot = doc.createElementNS(SVG_NS, 'svg');
    this.svgRoot.setAttribute('width', '0');
    this.svgRoot.setAttribute('height', '0');
    this.svgRoot.style.position = 'absolute';
    this.svgRoot.style.left = '-100000px';
    this.svgRoot.style.top = '0';
    this.svgRoot.style.visibility = 'hidden';
    this.textNode = doc.createElementNS(SVG_NS, 'text');
    this.svgRoot.appendChild(this.textNode);
    doc.body.appendChild(this.svgRoot);
  }

  measureText(text: string, style: FormulaTextStyle): TextMetricsBox {
    const metrics = this.measureWithSvg(text, style) ?? this.measureWithCanvas(text, style);
    return metrics ?? {
      width: Math.max(2, text.length * style.fontSize * 0.6),
      height: style.fontSize,
      ascent: style.fontSize * 0.8,
      descent: style.fontSize * 0.2,
    };
  }

  destroy(): void {
    this.svgRoot?.remove();
  }

  private measureWithSvg(text: string, style: FormulaTextStyle): TextMetricsBox | null {
    if (!this.textNode) {
      return null;
    }

    this.textNode.textContent = text || ' ';
    this.textNode.style.fontFamily = style.fontFamily;
    this.textNode.style.fontSize = `${style.fontSize}px`;
    if (style.fontStyle) {
      this.textNode.style.fontStyle = style.fontStyle;
    }
    if (style.fontWeight) {
      this.textNode.style.fontWeight = style.fontWeight;
    }

    try {
      const box = this.textNode.getBBox();
      return {
        width: Math.max(2, box.width),
        height: Math.max(style.fontSize, box.height),
        ascent: Math.max(style.fontSize * 0.8, -box.y),
        descent: Math.max(style.fontSize * 0.2, box.height + box.y),
      };
    } catch {
      return null;
    }
  }

  private measureWithCanvas(text: string, style: FormulaTextStyle): TextMetricsBox | null {
    if (!this.canvasContext) {
      return null;
    }

    this.canvasContext.font = `${style.fontStyle ?? 'normal'} ${style.fontWeight ?? '400'} ${style.fontSize}px ${style.fontFamily}`;
    const metrics = this.canvasContext.measureText(text || ' ');
    return {
      width: Math.max(2, metrics.width),
      height: Math.max(style.fontSize, (metrics.actualBoundingBoxAscent || style.fontSize * 0.8)
        + (metrics.actualBoundingBoxDescent || style.fontSize * 0.2)),
      ascent: metrics.actualBoundingBoxAscent || style.fontSize * 0.8,
      descent: metrics.actualBoundingBoxDescent || style.fontSize * 0.2,
    };
  }
}
