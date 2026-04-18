import { doc, text } from '@formulax/core';
import { describe, expect, it, vi } from 'vitest';
import { renderKatex, toKatexLatex } from '../src';

describe('renderer-katex', () => {
  it('serializes a document for katex', () => {
    expect(toKatexLatex(doc([text('x')]))).toBe('x');
  });

  it('delegates to katex renderToString', () => {
    const renderToString = vi.fn().mockReturnValue('<span>x</span>');
    const html = renderKatex(doc([text('x')]), { katexInstance: { renderToString } });
    expect(renderToString).toHaveBeenCalledWith('x', expect.any(Object));
    expect(html).toBe('<span>x</span>');
  });
});
