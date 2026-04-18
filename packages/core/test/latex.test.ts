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
});
