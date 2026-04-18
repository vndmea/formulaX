import { describe, expect, it } from 'vitest';
import { createTinyMceFormulaMarkup, parseTinyMceFormulaMarkup, serializeTinyMceFormulaMarkup } from '../src';

describe('tinymce adapter', () => {
  it('creates host markup and parses latex back', () => {
    expect(createTinyMceFormulaMarkup('x')).toContain('data-formulax="x"');
    const doc = parseTinyMceFormulaMarkup('\\frac{a}{b}');
    expect(serializeTinyMceFormulaMarkup(doc)).toContain('\\frac{a}{b}');
  });
});
