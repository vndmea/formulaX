import { describe, expect, it } from 'vitest';
import {
  createStateFromDoc,
  doc,
  fenced,
  frac,
  insertFraction,
  parseLatex,
  serializeLatex,
  sqrt,
  supsub,
  text,
} from '../src';

describe('latex parser and serializer', () => {
  it('parses fraction and sqrt structures', () => {
    const parsed = parseLatex('\\frac{a}{\\sqrt{b}}');
    expect(parsed).toEqual(doc([frac([text('a')], [sqrt([text('b')])])]));
  });

  it('serializes fenced and supsub structures', () => {
    const value = doc([fenced('(', ')', [supsub([text('x')], [text('2')], [text('i')])])]);
    expect(serializeLatex(value)).toBe('\\left(x^{2}_{i}\\right)');
  });

  it('creates an empty fraction command', () => {
    const state = createStateFromDoc(doc([]));
    const next = insertFraction()(state);
    expect(next.doc).toEqual(doc([frac([], [])]));
  });

  it('parses greek letters', () => {
    const parsed = parseLatex('\\alpha+\\beta+\\pi');
    expect(parsed.body[0]).toEqual(text('\u03b1'));
    expect(parsed.body[2]).toEqual(text('\u03b2'));
    expect(parsed.body[4]).toEqual(text('\u03c0'));
  });

  it('parses binary operators', () => {
    const parsed = parseLatex('a\\cdot b\\times c\\div d');
    expect(parsed.body[0]).toEqual(text('a'));
    expect(parsed.body[1]).toEqual(text('\u00b7'));
    expect(parsed.body[3]).toEqual(text('b'));
    expect(parsed.body[4]).toEqual(text('\u00d7'));
    expect(parsed.body[6]).toEqual(text('c'));
    expect(parsed.body[7]).toEqual(text('\u00f7'));
    expect(parsed.body[9]).toEqual(text('d'));
  });

  it('parses math functions', () => {
    const parsed = parseLatex('\\sin x+\\log y');
    expect(parsed.body[0]).toEqual(text('sin'));
    expect(parsed.body[2]).toEqual(text('x'));
    expect(parsed.body[3]).toEqual(text('+'));
    expect(parsed.body[4]).toEqual(text('log'));
    expect(parsed.body[6]).toEqual(text('y'));
  });

  it('parses relations', () => {
    const parsed = parseLatex('a\\leq b\\neq c');
    expect(parsed.body[0]).toEqual(text('a'));
    expect(parsed.body[1]).toEqual(text('\u2264'));
    expect(parsed.body[3]).toEqual(text('b'));
    expect(parsed.body[4]).toEqual(text('\u2260'));
    expect(parsed.body[6]).toEqual(text('c'));
  });

  it('parses arrows and misc symbols', () => {
    const parsed = parseLatex('x\\to y\\infty');
    expect(parsed.body[0]).toEqual(text('x'));
    expect(parsed.body[1]).toEqual(text('\u2192'));
    expect(parsed.body[3]).toEqual(text('y'));
    expect(parsed.body[4]).toEqual(text('\u221e'));
  });

  it('serializes supported symbols back to latex commands', () => {
    const parsed = parseLatex('\\alpha+\\beta+\\leq+\\infty');
    expect(serializeLatex(parsed)).toBe('\\alpha +\\beta +\\leq +\\infty ');
  });
});
