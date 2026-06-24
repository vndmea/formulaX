import { describe, expect, it } from 'vitest';
import type { FormulaNode } from '../src/core/types';
import {
  applyFormulaCommand,
  createEmptyFormulaDoc,
  deleteBackwardAtSelection,
  insertFractionAtSelection,
  insertSqrtAtSelection,
  insertSubscriptAtSelection,
  insertSuperscriptAtSelection,
  insertTextAtSelection,
} from '../src/core/commands';
import { resetFormulaNodeIdsForTests } from '../src/core/ids';
import { layoutFormula } from '../src/layout/layout';
import { parseLatexToFormulaDoc } from '../src/latex/parse';
import { serializeFormulaDocToLatex } from '../src/latex/serialize';

const testMetrics = {
  measureText(text: string, style: { fontSize: number }) {
    return {
      width: Math.max(4, text.length * style.fontSize * 0.6),
      height: style.fontSize,
      ascent: style.fontSize * 0.8,
      descent: style.fontSize * 0.2,
    };
  },
};

const LEGACY_TOOLBAR_LATEX_SAMPLES = [
  '\\cos\\placeholder',
  '\\cos{2x}',
  '\\cot\\placeholder',
  '\\csc\\placeholder',
  '\\frac \\pi 2',
  '\\frac \\placeholder\\placeholder',
  '\\frac {\\Delta y}{\\Delta x}',
  '\\frac {-b\\pm\\sqrt{b^2-4ac}}{2a}',
  '\\frac {dy}{dx}',
  '\\iiint\\placeholder',
  '\\iiint^\\placeholder_\\placeholder\\placeholder',
  '\\iint\\placeholder',
  '\\iint^\\placeholder_\\placeholder\\placeholder',
  '\\int \\placeholder',
  '\\int^\\placeholder_\\placeholder\\placeholder',
  '\\left(\\placeholder\\right)',
  '\\left[\\placeholder\\right]',
  '\\left\\{\\placeholder\\right\\}',
  '\\left|\\placeholder\\right|',
  '\\placeholder^\\placeholder',
  '\\placeholder^\\placeholder_\\placeholder',
  '\\placeholder_\\placeholder',
  '\\sec\\placeholder',
  '\\sin\\placeholder',
  '\\sin\\theta',
  '\\sqrt [\\placeholder] \\placeholder',
  '\\sqrt [2] \\placeholder',
  '\\sqrt [3] \\placeholder',
  '\\sqrt \\placeholder',
  '\\sqrt {a^2+b^2}',
  '\\sum\\placeholder',
  '\\sum^\\placeholder_\\placeholder\\placeholder',
  '\\sum_\\placeholder\\placeholder',
  '\\tan\\placeholder',
  '\\tan\\theta=\\frac {\\sin\\theta}{\\cos\\theta}',
  '{\\left(x+a\\right)}^2=\\sum^n_{k=0}{\\left(^n_k\\right)x^ka^{n-k}}',
  '{\\placeholder/\\placeholder}',
  '{^\\placeholder_\\placeholder\\placeholder}',
  '{}^n_1Y',
  'a^2+b^2=c^2',
  'e^{-i\\omega t}',
  'x^2',
  'x=\\frac {-b\\pm\\sqrt {b^2-4ac}}{2a}',
] as const;

describe('runtime latex parser and serializer', () => {
  it('round-trips the supported runtime subset', () => {
    resetFormulaNodeIdsForTests();
    const samples = [
      'x',
      'x^2',
      'x_1',
      'x_1^2',
      '\\frac{a}{b}',
      '\\sqrt{x+1}',
      '\\sqrt[3]{x+1}',
      '\\left(x+1\\right)',
      '\\left\\{x+1\\right\\}',
      '\\mathcal{A}+\\mathbb{R}',
      '\\begin{matrix}a&b\\\\c&d\\end{matrix}',
      '\\begin{cases}x&1\\\\y&2\\end{cases}',
    ];

    for (const sample of samples) {
      const parsed = parseLatexToFormulaDoc(sample);
      expect(serializeFormulaDocToLatex(parsed)).toBe(sample);
    }
  });

  it('preserves unsupported commands as unsupported nodes', () => {
    const parsed = parseLatexToFormulaDoc('\\foo{x}');
    expect(parsed.root.children[0]?.type).toBe('unsupported');
    expect(serializeFormulaDocToLatex(parsed)).toBe('\\foo{x}');
  });

  it('parses styled symbols with preserved font metadata', () => {
    const parsed = parseLatexToFormulaDoc('\\mathcal{A}');
    const symbol = parsed.root.children[0];

    expect(symbol?.type).toBe('symbol');
    expect(symbol && 'fontFamily' in symbol ? symbol.fontFamily : undefined).toContain('KF AMS CAL');
    expect(serializeFormulaDocToLatex(parsed)).toBe('\\mathcal{A}');
  });

  it('parses toolbar placeholders as native placeholder nodes', () => {
    const parsed = parseLatexToFormulaDoc('\\frac{\\placeholder}{\\placeholder}');
    const fraction = parsed.root.children[0];

    expect(fraction?.type).toBe('frac');
    expect(fraction && 'numerator' in fraction ? fraction.numerator.children[0]?.type : undefined)
      .toBe('placeholder');
    expect(serializeFormulaDocToLatex(parsed)).toBe('\\frac{\\placeholder}{\\placeholder}');
  });

  it('parses the legacy kity toolbar template catalog without unsupported nodes', () => {
    for (const sample of LEGACY_TOOLBAR_LATEX_SAMPLES) {
      const doc = createEmptyFormulaDoc('');
      const inserted = applyFormulaCommand(doc, { rowId: doc.root.id, offset: 0 }, {
        type: 'insertLatex',
        payload: { latex: sample },
      });

      expect(inserted.changed, sample).toBe(true);
      expect(hasUnsupportedNode(inserted.doc.root), sample).toBe(false);
    }
  });
});

describe('runtime commands and layout', () => {
  it('inserts text and structures into the active row', () => {
    const doc = createEmptyFormulaDoc('');
    const textInserted = insertTextAtSelection(doc, { rowId: doc.root.id, offset: 0 }, 'x');
    const fractionInserted = insertFractionAtSelection(textInserted.doc, textInserted.selection,);
    const sqrtInserted = insertSqrtAtSelection(fractionInserted.doc, {
      rowId: doc.root.id,
      offset: 2,
    });

    expect(serializeFormulaDocToLatex(textInserted.doc)).toBe('x');
    expect(serializeFormulaDocToLatex(fractionInserted.doc)).toBe('x\\frac{}{}');
    expect(serializeFormulaDocToLatex(sqrtInserted.doc)).toBe('x\\frac{}{}\\sqrt{}');
  });

  it('wraps the previous atom into superscript and subscript nodes', () => {
    const doc = createEmptyFormulaDoc('x');
    const sup = insertSuperscriptAtSelection(doc, { rowId: doc.root.id, offset: 1 });
    sup.doc.root.children[0] && insertTextAtSelection(sup.doc, sup.selection, '2');
    const sub = insertSubscriptAtSelection(sup.doc, { rowId: doc.root.id, offset: 1 });

    expect(serializeFormulaDocToLatex(sub.doc)).toBe('x^{}_{}');
  });

  it('parses detached scripts as empty-base scripts instead of literal caret symbols', () => {
    const doc = createEmptyFormulaDoc('\\left(^n_k\\right)');
    const fence = doc.root.children[0];

    expect(containsSymbolValue(doc.root, '^')).toBe(false);
    expect(fence?.type).toBe('fence');
    expect(fence && fence.type === 'fence' ? fence.body.children[0]?.type : undefined).toBe('script');
    expect(serializeFormulaDocToLatex(doc)).toBe('\\left({}^n_k\\right)');
  });

  it('deletes backward from the active row', () => {
    const doc = createEmptyFormulaDoc('xy');
    const deleted = deleteBackwardAtSelection(doc, { rowId: doc.root.id, offset: 2 });
    expect(serializeFormulaDocToLatex(deleted.doc)).toBe('x');
  });

  it('computes a stable box tree for rendered formulas', () => {
    const doc = createEmptyFormulaDoc('\\frac{a}{b}');
    const layout = layoutFormula(doc, testMetrics, {
      fontSize: 40,
    });

    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);
    expect(layout.root.kind).toBe('row');
    expect(layout.root.children[0]?.kind).toBe('frac');
  });

  it('lays out placeholders as virtual boxes using the KF AMS default font', () => {
    const doc = createEmptyFormulaDoc('\\placeholder');
    const layout = layoutFormula(doc, testMetrics, {
      fontSize: 40,
    });

    expect(layout.root.children[0]?.kind).toBe('placeholder');
    expect(layout.root.children[0]?.width).toBeGreaterThan(0);
    expect(layout.root.children[0]?.ascent).toBe(layout.root.children[0]?.descent);

    const symbolDoc = createEmptyFormulaDoc('x');
    const symbolLayout = layoutFormula(symbolDoc, testMetrics, { fontSize: 40 });
    expect(symbolLayout.root.children[0]?.fontFamily).toContain('KF AMS MAIN');
    expect(symbolLayout.root.children[0]?.ascent).toBe(symbolLayout.root.children[0]?.descent);
  });

  it('centers trailing placeholders beside scripted operators', () => {
    const doc = createEmptyFormulaDoc('\\int^\\placeholder_\\placeholder\\placeholder');
    const layout = layoutFormula(doc, testMetrics, {
      fontSize: 40,
    });
    const scriptBox = layout.root.children[0];
    const trailingPlaceholder = layout.root.children[1];

    expect(scriptBox?.kind).toBe('script');
    expect(trailingPlaceholder?.kind).toBe('placeholder');
    expect(trailingPlaceholder?.y + trailingPlaceholder!.height / 2)
      .toBeCloseTo(scriptBox!.y + scriptBox!.height / 2, 0);
  });

  it('centers leading equation text beside tall fractions', () => {
    const doc = createEmptyFormulaDoc('x=\\frac {-b\\pm\\sqrt {b^2-4ac}}{2a}');
    const layout = layoutFormula(doc, testMetrics, {
      fontSize: 40,
    });
    const [xBox, equalsBox, fractionBox] = layout.root.children;
    const fractionCenter = fractionBox!.y + fractionBox!.height / 2;

    expect(xBox?.text).toBe('x');
    expect(equalsBox?.text).toBe('=');
    expect(fractionBox?.kind).toBe('frac');
    expect(xBox!.y + xBox!.height / 2).toBeCloseTo(fractionCenter, 0);
    expect(equalsBox!.y + equalsBox!.height / 2).toBeCloseTo(fractionCenter, 0);
  });

  it('returns a single line layout by default', () => {
    const doc = createEmptyFormulaDoc('a+b+c+d');
    const layout = layoutFormula(doc, testMetrics, {
      fontSize: 40,
    });

    expect(layout.lines).toHaveLength(1);
    expect(layout.lines[0]?.fragments).toHaveLength(doc.root.children.length);
    expect(layout.fragmentsByNodeId.size).toBeGreaterThan(0);
  });

  it('wraps long formulas into multiple visual lines without changing latex', () => {
    const doc = createEmptyFormulaDoc('a+b+c+d+e+f+g+h');
    const layout = layoutFormula(doc, testMetrics, {
      fontSize: 40,
      wrap: 'soft',
      maxWidth: 120,
    });

    expect(layout.lines.length).toBeGreaterThan(1);
    expect(layout.lines.every((line) => line.width <= 150 || line.fragments.length === 1)).toBe(true);
    expect(serializeFormulaDocToLatex(doc)).toBe('a+b+c+d+e+f+g+h');
  });

  it('does not split indivisible structures while wrapping', () => {
    const doc = createEmptyFormulaDoc('\\frac{a}{b}+\\sqrt{x+1}');
    const layout = layoutFormula(doc, testMetrics, {
      fontSize: 40,
      wrap: 'soft',
      maxWidth: 40,
    });

    expect(layout.lines.length).toBeGreaterThan(1);
    expect(layout.lines.some((line) => line.fragments.some((fragment) => fragment.box.kind === 'frac'))).toBe(true);
    expect(layout.lines.some((line) => line.fragments.some((fragment) => fragment.box.kind === 'sqrt'))).toBe(true);
  });

  it('inserts latex snippets at the active selection', () => {
    const doc = createEmptyFormulaDoc('x');
    const result = applyFormulaCommand(doc, { rowId: doc.root.id, offset: 1 }, {
      type: 'insertLatex',
      payload: { latex: '\\frac \\placeholder\\placeholder' },
    });

    expect(result.changed).toBe(true);
    expect(serializeFormulaDocToLatex(result.doc)).toBe('x\\frac{}{}');
    expect(result.selection.rowId).toBe((result.doc.root.children[1] as { numerator: { id: string } }).numerator.id);
  });

  it('normalizes toolbar placeholders into editable rows', () => {
    const doc = createEmptyFormulaDoc('');
    const result = applyFormulaCommand(doc, { rowId: doc.root.id, offset: 0 }, {
      type: 'insertLatex',
      payload: { latex: '\\sin\\placeholder' },
    });

    expect(result.changed).toBe(true);
    expect(serializeFormulaDocToLatex(result.doc)).toBe('\\sin');
    expect(result.selection.rowId).toBe(result.doc.root.id);
    expect(result.selection.offset).toBe(1);
  });

  it('keeps fence and nth-root toolbar placeholders editable without synthetic wrapper groups', () => {
    const doc = createEmptyFormulaDoc('');
    const fenced = applyFormulaCommand(doc, { rowId: doc.root.id, offset: 0 }, {
      type: 'insertLatex',
      payload: { latex: '\\left(\\placeholder\\right)' },
    });
    const fencedTyped = insertTextAtSelection(fenced.doc, fenced.selection, 'x');

    expect(serializeFormulaDocToLatex(fencedTyped.doc)).toBe('\\left(x\\right)');

    const rooted = applyFormulaCommand(doc, { rowId: doc.root.id, offset: 0 }, {
      type: 'insertLatex',
      payload: { latex: '\\sqrt [3] \\placeholder' },
    });
    const rootedTyped = insertTextAtSelection(rooted.doc, rooted.selection, 'y');

    expect(serializeFormulaDocToLatex(rootedTyped.doc)).toBe('\\sqrt[3]{y}');
  });
});

function hasUnsupportedNode(node: FormulaNode): boolean {
  if (node.type === 'unsupported') {
    return true;
  }

  if (node.type === 'row') {
    return node.children.some((child) => hasUnsupportedNode(child));
  }

  if (node.type === 'frac') {
    return hasUnsupportedNode(node.numerator) || hasUnsupportedNode(node.denominator);
  }

  if (node.type === 'sqrt') {
    return Boolean(node.index && hasUnsupportedNode(node.index)) || hasUnsupportedNode(node.value);
  }

  if (node.type === 'script') {
    return hasUnsupportedNode(node.base)
      || Boolean(node.sup && hasUnsupportedNode(node.sup))
      || Boolean(node.sub && hasUnsupportedNode(node.sub));
  }

  if (node.type === 'fence') {
    return hasUnsupportedNode(node.body);
  }

  if (node.type === 'matrix') {
    return node.rows.some((row) => row.some((cell) => hasUnsupportedNode(cell)));
  }

  return false;
}

function containsSymbolValue(node: FormulaNode, value: string): boolean {
  if (node.type === 'symbol') {
    return node.value === value;
  }

  if (node.type === 'row') {
    return node.children.some((child) => containsSymbolValue(child, value));
  }

  if (node.type === 'frac') {
    return containsSymbolValue(node.numerator, value) || containsSymbolValue(node.denominator, value);
  }

  if (node.type === 'sqrt') {
    return Boolean(node.index && containsSymbolValue(node.index, value)) || containsSymbolValue(node.value, value);
  }

  if (node.type === 'script') {
    return containsSymbolValue(node.base, value)
      || Boolean(node.sup && containsSymbolValue(node.sup, value))
      || Boolean(node.sub && containsSymbolValue(node.sub, value));
  }

  if (node.type === 'fence') {
    return containsSymbolValue(node.body, value);
  }

  if (node.type === 'matrix') {
    return node.rows.some((row) => row.some((cell) => containsSymbolValue(cell, value)));
  }

  return false;
}
