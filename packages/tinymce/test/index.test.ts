import { describe, expect, it } from 'vitest';
import {
  createTinyMceFormulaMarkup,
  parseTinyMceFormulaMarkup,
  serializeTinyMceFormulaMarkup,
} from '../src';
import { createTinyMceFormulaElement } from '../src/markup';

describe('tinymce adapter', () => {
  it('creates host markup and parses latex back', () => {
    const markup = createTinyMceFormulaMarkup('x');
    expect(markup).toContain('data-formulax-latex="x"');
    expect(markup).toContain('data-formulax="true"');
    const doc = parseTinyMceFormulaMarkup('\\frac{a}{b}');
    expect(serializeTinyMceFormulaMarkup(doc)).toContain('\\frac{a}{b}');
  });

  it('creates a DOM formula element without dropping root svg attributes', () => {
    const element = createTinyMceFormulaElement(document, 'x', {
      renderHtml: '<svg viewBox="0 0 10 4" preserveAspectRatio="xMinYMin meet" width="10" height="4"></svg>',
    });

    const svg = element?.querySelector('svg');

    expect(svg?.getAttribute('viewBox')).toBe('0 0 10 4');
    expect(svg?.getAttribute('preserveAspectRatio')).toBe('xMinYMin meet');
    expect(svg?.getAttribute('width')).toBe('10');
    expect(svg?.getAttribute('height')).toBe('4');
  });
});
