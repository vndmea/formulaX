import type { FormulaDoc, FormulaMatrixNode, FormulaNode, FormulaRowNode } from '../core/types';
import type {
  FormulaMetrics,
  FormulaLayoutOptions,
  FormulaWrapMode,
  LayoutBox,
  LayoutFragment,
  LayoutLine,
  LayoutResult,
  TextMetricsBox,
} from './types';
import { resolveRuntimeSymbol } from '../latex/symbols';

const DEFAULT_FONT_FAMILY = '"KF AMS MAIN", "Cambria Math", "Times New Roman", serif';
const RELATION_SYMBOLS = new Set(['=', '<', '>', '≤', '≥', '≈']);
const BINARY_SYMBOLS = new Set(['+', '-', '±', '·', '×', '÷']);
const PUNCTUATION_SYMBOLS = new Set([',', ';', ':']);

function createOptions(options: Partial<FormulaLayoutOptions>): FormulaLayoutOptions {
  return {
    fontSize: options.fontSize ?? 40,
    fontFamily: options.fontFamily ?? DEFAULT_FONT_FAMILY,
    maxWidth: options.maxWidth,
    wrap: options.wrap ?? 'none',
    continuationIndent: options.continuationIndent ?? (options.fontSize ?? 40) * 0.75,
    breakStrategy: options.breakStrategy ?? 'operator',
    scriptScale: options.scriptScale ?? 0.72,
    lineGap: options.lineGap ?? (options.fontSize ?? 40) * 0.35,
    ruleThickness: options.ruleThickness ?? 1.5,
    cellGap: options.cellGap ?? 12,
  };
}

export function layoutFormula(
  doc: FormulaDoc,
  metrics: FormulaMetrics,
  options: Partial<FormulaLayoutOptions> = {},
): LayoutResult {
  const resolvedOptions = createOptions(options);
  const nodeMap = new Map<string, LayoutBox>();
  const root = layoutRow(doc.root, metrics, resolvedOptions, nodeMap);
  const { lines, fragmentsByNodeId, width, height, baseline } = createLineLayout(root, resolvedOptions);
  return {
    root,
    width,
    height,
    baseline,
    lines,
    nodeMap,
    fragmentsByNodeId,
  };
}

function createLineLayout(
  root: LayoutBox,
  options: FormulaLayoutOptions,
): {
  lines: LayoutLine[];
  fragmentsByNodeId: Map<string, LayoutFragment[]>;
  width: number;
  height: number;
  baseline: number;
} {
  const wrapMode = resolveWrapMode(root, options);
  const lines = wrapMode === 'soft'
    ? wrapRootRow(root, options)
    : [createSingleLine(root)];
  const fragmentsByNodeId = new Map<string, LayoutFragment[]>();

  for (const line of lines) {
    for (const fragment of line.fragments) {
      const fragments = fragmentsByNodeId.get(fragment.nodeId) ?? [];
      fragments.push(fragment);
      fragmentsByNodeId.set(fragment.nodeId, fragments);
    }
  }

  return {
    lines,
    fragmentsByNodeId,
    width: Math.max(...lines.map((line) => line.width), 0),
    height: lines.length === 0
      ? root.height
      : lines[lines.length - 1].y + lines[lines.length - 1].height,
    baseline: lines[0]?.baseline ?? root.ascent,
  };
}

function resolveWrapMode(root: LayoutBox, options: FormulaLayoutOptions): FormulaWrapMode {
  if (options.wrap !== 'soft') {
    return 'none';
  }

  if (!options.maxWidth || root.children.length <= 1) {
    return 'none';
  }

  return root.width > options.maxWidth ? 'soft' : 'none';
}

function createSingleLine(root: LayoutBox): LayoutLine {
  return {
    id: `${root.id}-line-0`,
    index: 0,
    x: 0,
    y: 0,
    width: root.width,
    height: root.height,
    ascent: root.ascent,
    descent: root.descent,
    baseline: root.ascent,
    startOffset: 0,
    endOffset: root.children.length,
    fragments: root.children.map((child, childIndex) => ({
      id: `${child.id}-fragment-0`,
      nodeId: child.nodeId,
      boxId: child.id,
      lineIndex: 0,
      childIndex,
      x: child.x,
      y: 0,
      width: child.width,
      height: child.height,
      ascent: child.ascent,
      descent: child.descent,
      box: child,
    })),
  };
}

function wrapRootRow(root: LayoutBox, options: FormulaLayoutOptions): LayoutLine[] {
  const lines: LayoutLine[] = [];
  const maxWidth = Math.max(options.maxWidth ?? root.width, options.fontSize);
  const continuationIndent = options.continuationIndent ?? 0;
  let lineBoxes: Array<{ box: LayoutBox; childIndex: number }> = [];
  let lineWidth = 0;
  let lineStartOffset = 0;
  let cursorY = 0;

  const flush = (lineIndex: number): void => {
    if (lineBoxes.length === 0) {
      return;
    }

    const ascent = Math.max(...lineBoxes.map(({ box }) => box.ascent));
    const descent = Math.max(...lineBoxes.map(({ box }) => box.descent));
    const height = ascent + descent;
    let cursorX = lineIndex === 0 ? 0 : continuationIndent;
    const fragments: LayoutFragment[] = lineBoxes.map(({ box, childIndex }) => {
      const fragment: LayoutFragment = {
        id: `${box.id}-fragment-${lineIndex}`,
        nodeId: box.nodeId,
        boxId: box.id,
        lineIndex,
        childIndex,
        x: cursorX,
        y: 0,
        width: box.width,
        height: box.height,
        ascent: box.ascent,
        descent: box.descent,
        box,
      };
      cursorX += box.width;
      return fragment;
    });

    lines.push({
      id: `${root.id}-line-${lineIndex}`,
      index: lineIndex,
      x: 0,
      y: cursorY,
      width: fragments.length === 0
        ? 0
        : fragments[fragments.length - 1].x + fragments[fragments.length - 1].width,
      height,
      ascent,
      descent,
      baseline: ascent,
      startOffset: lineStartOffset,
      endOffset: lineStartOffset + lineBoxes.length,
      fragments,
    });

    cursorY += height + (options.lineGap ?? 0);
    lineStartOffset += lineBoxes.length;
    lineBoxes = [];
    lineWidth = 0;
  };

  root.children.forEach((child, childIndex) => {
    const projectedWidth = lineBoxes.length === 0
      ? child.width + (lines.length > 0 ? continuationIndent : 0)
      : lineWidth + child.width;
    const shouldBreak = lineBoxes.length > 0
      && projectedWidth > maxWidth
      && canBreakBeforeChild(lineBoxes, child, options);

    if (shouldBreak) {
      flush(lines.length);
    }

    lineBoxes.push({ box: child, childIndex });
    lineWidth = (lineBoxes.length === 1 && lines.length > 0 ? continuationIndent : 0)
      + lineBoxes.reduce((sum, item) => sum + item.box.width, 0);
  });

  flush(lines.length);
  return lines.length === 0 ? [createSingleLine(root)] : lines;
}

function canBreakBeforeChild(
  currentLine: Array<{ box: LayoutBox; childIndex: number }>,
  nextChild: LayoutBox,
  options: FormulaLayoutOptions,
): boolean {
  if (options.breakStrategy === 'greedy') {
    return true;
  }

  const previous = currentLine[currentLine.length - 1]?.box;
  if (!previous) {
    return false;
  }

  const previousPriority = getBreakPriority(previous);
  const nextPriority = getBreakPriority(nextChild);
  return previousPriority > 0 || nextPriority > 0;
}

function getBreakPriority(box: LayoutBox): number {
  if (box.kind !== 'symbol' || !box.text) {
    return 0;
  }

  if (RELATION_SYMBOLS.has(box.text)) {
    return 3;
  }

  if (BINARY_SYMBOLS.has(box.text)) {
    return 2;
  }

  if (PUNCTUATION_SYMBOLS.has(box.text)) {
    return 1;
  }

  return 0;
}

function layoutRow(
  row: FormulaRowNode,
  metrics: FormulaMetrics,
  options: FormulaLayoutOptions,
  nodeMap: Map<string, LayoutBox>,
): LayoutBox {
  const children = row.children.map((child) => layoutNode(child, metrics, options, nodeMap));
  const ascent = children.length ? Math.max(...children.map((child) => child.ascent)) : options.fontSize * 0.8;
  const descent = children.length ? Math.max(...children.map((child) => child.descent)) : options.fontSize * 0.3;
  let cursorX = 0;
  const placedChildren = children.map((child) => {
    const nextChild = {
      ...child,
      x: cursorX,
      y: ascent - child.ascent,
    };
    cursorX += child.width;
    return nextChild;
  });
  const box: LayoutBox = {
    id: row.id,
    nodeId: row.id,
    kind: 'row',
    rowId: row.id,
    x: 0,
    y: 0,
    width: Math.max(cursorX, options.fontSize * 0.3),
    height: ascent + descent,
    ascent,
    descent,
    children: placedChildren,
  };
  nodeMap.set(box.nodeId, box);
  return box;
}

function layoutNode(
  node: FormulaNode,
  metrics: FormulaMetrics,
  options: FormulaLayoutOptions,
  nodeMap: Map<string, LayoutBox>,
): LayoutBox {
  switch (node.type) {
    case 'row':
      return layoutRow(node, metrics, options, nodeMap);
    case 'symbol': {
      const fontFamily = node.fontFamily ?? options.fontFamily ?? DEFAULT_FONT_FAMILY;
      return layoutTextBox(node.id, node.id, 'symbol', node.value, metrics.measureText(node.value, {
        fontFamily,
        fontSize: options.fontSize,
      }), nodeMap, fontFamily);
    }
    case 'placeholder':
      return layoutPlaceholder(node.id, options, nodeMap);
    case 'unsupported':
      return layoutTextBox(node.id, node.id, 'unsupported', node.rawLatex, metrics.measureText(node.rawLatex, {
        fontFamily: options.fontFamily ?? DEFAULT_FONT_FAMILY,
        fontSize: options.fontSize * 0.8,
      }), nodeMap, options.fontFamily ?? DEFAULT_FONT_FAMILY);
    case 'frac':
      return layoutFraction(node, metrics, options, nodeMap);
    case 'sqrt':
      return layoutSqrt(node, metrics, options, nodeMap);
    case 'script':
      return layoutScript(node, metrics, options, nodeMap);
    case 'fence':
      return layoutFence(node, metrics, options, nodeMap);
    case 'matrix':
      return layoutMatrix(node, metrics, options, nodeMap);
  }
}

function layoutPlaceholder(
  nodeId: string,
  options: FormulaLayoutOptions,
  nodeMap: Map<string, LayoutBox>,
): LayoutBox {
  const width = options.fontSize * 0.875;
  const height = options.fontSize * 1.25;
  const ascent = height * 0.5;
  const box: LayoutBox = {
    id: nodeId,
    nodeId,
    kind: 'placeholder',
    x: 0,
    y: 0,
    width,
    height,
    ascent,
    descent: height - ascent,
    children: [],
  };
  nodeMap.set(nodeId, box);
  return box;
}

function layoutTextBox(
  id: string,
  nodeId: string,
  kind: string,
  text: string,
  metrics: TextMetricsBox,
  nodeMap: Map<string, LayoutBox>,
  fontFamily?: string,
): LayoutBox {
  const ascent = metrics.height * 0.5;
  const box: LayoutBox = {
    id,
    nodeId,
    kind,
    x: 0,
    y: 0,
    width: Math.max(metrics.width, 2),
    height: metrics.height,
    ascent,
    descent: metrics.height - ascent,
    text,
    fontFamily,
    children: [],
  };
  nodeMap.set(nodeId, box);
  return box;
}

function layoutFraction(
  node: Extract<FormulaNode, { type: 'frac' }>,
  metrics: FormulaMetrics,
  options: FormulaLayoutOptions,
  nodeMap: Map<string, LayoutBox>,
): LayoutBox {
  const numerator = layoutRow(node.numerator, metrics, options, nodeMap);
  const denominator = layoutRow(node.denominator, metrics, options, nodeMap);
  const width = Math.max(numerator.width, denominator.width) + options.fontSize * 0.4;
  const ascent = numerator.height + (options.lineGap ?? 0) + (options.ruleThickness ?? 0);
  const descent = denominator.height + (options.lineGap ?? 0);
  const box: LayoutBox = {
    id: node.id,
    nodeId: node.id,
    kind: 'frac',
    x: 0,
    y: 0,
    width,
    height: ascent + descent,
    ascent,
    descent,
    children: [
      {
        ...numerator,
        x: (width - numerator.width) / 2,
        y: 0,
      },
      {
        ...denominator,
        x: (width - denominator.width) / 2,
        y: ascent + (options.lineGap ?? 0),
      },
    ],
  };
  nodeMap.set(node.id, box);
  return box;
}

function layoutSqrt(
  node: Extract<FormulaNode, { type: 'sqrt' }>,
  metrics: FormulaMetrics,
  options: FormulaLayoutOptions,
  nodeMap: Map<string, LayoutBox>,
): LayoutBox {
  const radical = metrics.measureText('√', {
    fontFamily: options.fontFamily ?? DEFAULT_FONT_FAMILY,
    fontSize: options.fontSize,
  });
  const radicalBox = layoutTextBox(
    `${node.id}-radical`,
    node.id,
    'sqrt-radical',
    '√',
    radical,
    nodeMap,
    options.fontFamily ?? DEFAULT_FONT_FAMILY,
  );
  const indexOptions = {
    ...options,
    fontSize: options.fontSize * options.scriptScale!,
  };
  const index = node.index ? layoutRow(node.index, metrics, indexOptions, nodeMap) : null;
  const value = layoutRow(node.value, metrics, options, nodeMap);
  const radicalOffsetX = index ? index.width * 0.55 : 0;
  const ascent = Math.max(
    radicalBox.ascent,
    value.ascent + (options.ruleThickness ?? 0),
    index ? index.height + options.fontSize * 0.1 : 0,
  );
  const descent = Math.max(radicalBox.descent, value.descent);
  const box: LayoutBox = {
    id: node.id,
    nodeId: node.id,
    kind: 'sqrt',
    x: 0,
    y: 0,
    width: radicalOffsetX + radicalBox.width + value.width + options.fontSize * 0.15,
    height: ascent + descent,
    ascent,
    descent,
    children: [
      ...(index ? [{
        ...index,
        x: 0,
        y: 0,
      }] : []),
      {
        ...radicalBox,
        x: radicalOffsetX,
        y: ascent - radicalBox.ascent,
      },
      {
        ...value,
        x: radicalOffsetX + radicalBox.width + options.fontSize * 0.15,
        y: ascent - value.ascent,
      },
    ],
  };
  nodeMap.set(node.id, box);
  return box;
}

function layoutScript(
  node: Extract<FormulaNode, { type: 'script' }>,
  metrics: FormulaMetrics,
  options: FormulaLayoutOptions,
  nodeMap: Map<string, LayoutBox>,
): LayoutBox {
  const base = layoutNode(node.base, metrics, options, nodeMap);
  const scriptOptions = {
    ...options,
    fontSize: options.fontSize * options.scriptScale!,
  };
  const sup = node.sup ? layoutRow(node.sup, metrics, scriptOptions, nodeMap) : null;
  const sub = node.sub ? layoutRow(node.sub, metrics, scriptOptions, nodeMap) : null;
  const stackWidth = Math.max(sup?.width ?? 0, sub?.width ?? 0);
  const ascent = base.ascent + (sup ? sup.height * 0.65 : 0);
  const descent = base.descent + (sub ? sub.height * 0.65 : 0);
  const box: LayoutBox = {
    id: node.id,
    nodeId: node.id,
    kind: 'script',
    x: 0,
    y: 0,
    width: base.width + stackWidth,
    height: ascent + descent,
    ascent,
    descent,
    children: [
      {
        ...base,
        x: 0,
        y: ascent - base.ascent,
      },
      ...(sup ? [{
        ...sup,
        x: base.width,
        y: 0,
      }] : []),
      ...(sub ? [{
        ...sub,
        x: base.width,
        y: ascent + base.descent * 0.35,
      }] : []),
    ],
  };
  nodeMap.set(node.id, box);
  return box;
}

function layoutFence(
  node: Extract<FormulaNode, { type: 'fence' }>,
  metrics: FormulaMetrics,
  options: FormulaLayoutOptions,
  nodeMap: Map<string, LayoutBox>,
): LayoutBox {
  const leftDelimiter = resolveDelimiterText(node.left);
  const rightDelimiter = resolveDelimiterText(node.right);
  const left = layoutTextBox(`${node.id}-left`, `${node.id}-left`, 'fence-delimiter', leftDelimiter, metrics.measureText(leftDelimiter, {
    fontFamily: options.fontFamily ?? DEFAULT_FONT_FAMILY,
    fontSize: options.fontSize,
  }), nodeMap, options.fontFamily ?? DEFAULT_FONT_FAMILY);
  const right = layoutTextBox(`${node.id}-right`, `${node.id}-right`, 'fence-delimiter', rightDelimiter, metrics.measureText(rightDelimiter, {
    fontFamily: options.fontFamily ?? DEFAULT_FONT_FAMILY,
    fontSize: options.fontSize,
  }), nodeMap, options.fontFamily ?? DEFAULT_FONT_FAMILY);
  const body = layoutRow(node.body, metrics, options, nodeMap);
  const ascent = Math.max(left.ascent, body.ascent, right.ascent);
  const descent = Math.max(left.descent, body.descent, right.descent);
  const box: LayoutBox = {
    id: node.id,
    nodeId: node.id,
    kind: 'fence',
    x: 0,
    y: 0,
    width: left.width + body.width + right.width,
    height: ascent + descent,
    ascent,
    descent,
    children: [
      { ...left, x: 0, y: ascent - left.ascent },
      { ...body, x: left.width, y: ascent - body.ascent },
      { ...right, x: left.width + body.width, y: ascent - right.ascent },
    ],
  };
  nodeMap.set(node.id, box);
  return box;
}

function resolveDelimiterText(delimiter: string): string {
  const resolved = resolveRuntimeSymbol(delimiter);
  if (resolved) {
    return resolved.char;
  }

  if (delimiter === '\\{') {
    return '{';
  }

  if (delimiter === '\\}') {
    return '}';
  }

  if (delimiter === '\\|') {
    return '|';
  }

  return delimiter;
}

function layoutMatrix(
  node: FormulaMatrixNode,
  metrics: FormulaMetrics,
  options: FormulaLayoutOptions,
  nodeMap: Map<string, LayoutBox>,
): LayoutBox {
  const rows = node.rows.map((rowGroup) => rowGroup.map((row) => layoutRow(row, metrics, options, nodeMap)));
  const columnCount = Math.max(...rows.map((rowGroup) => rowGroup.length), 0);
  const columnWidths = Array.from({ length: columnCount }, (_, columnIndex) => Math.max(
    0,
    ...rows.map((rowGroup) => rowGroup[columnIndex]?.width ?? 0),
  ));
  const rowHeights = rows.map((rowGroup) => Math.max(...rowGroup.map((row) => row.height), options.fontSize));

  let cursorY = 0;
  const children: LayoutBox[] = [];
  rows.forEach((rowGroup, rowIndex) => {
    let cursorX = 0;
    rowGroup.forEach((row, columnIndex) => {
      children.push({
        ...row,
        x: cursorX + (columnWidths[columnIndex] - row.width) / 2,
        y: cursorY + (rowHeights[rowIndex] - row.height) / 2,
      });
      cursorX += columnWidths[columnIndex] + (options.cellGap ?? 0);
    });
    cursorY += rowHeights[rowIndex] + (options.lineGap ?? 0);
  });

  const width = columnWidths.reduce((total, value) => total + value, 0)
    + Math.max(0, columnWidths.length - 1) * (options.cellGap ?? 0);
  const height = rowHeights.reduce((total, value) => total + value, 0)
    + Math.max(0, rowHeights.length - 1) * (options.lineGap ?? 0);
  const ascent = height * 0.55;
  const box: LayoutBox = {
    id: node.id,
    nodeId: node.id,
    kind: node.environment,
    x: 0,
    y: 0,
    width,
    height,
    ascent,
    descent: height - ascent,
    children,
  };
  nodeMap.set(node.id, box);
  return box;
}
