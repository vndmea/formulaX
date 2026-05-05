import { describe, expect, it } from 'vitest';
import { createTinyMceFormulaMarkup, parseTinyMceFormulaMarkup, serializeTinyMceFormulaMarkup } from '../src';

describe('tinymce adapter', () => {
  it('creates host markup and parses latex back', () => {
    const markup = createTinyMceFormulaMarkup('x');
    expect(markup).toContain('data-formulax-latex="x"');
    expect(markup).toContain('data-formulax="true"');
    const doc = parseTinyMceFormulaMarkup('\\frac{a}{b}');
    expect(serializeTinyMceFormulaMarkup(doc)).toContain('\\frac{a}{b}');
  });
});