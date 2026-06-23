import { describe, expect, it } from 'vitest';
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
      '\\left(x+1\\right)',
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
    expect(serializeFormulaDocToLatex(result.doc)).toBe('\\sin{}');
    expect(result.selection.offset).toBe(0);
  });
});
