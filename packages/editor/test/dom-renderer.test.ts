import { doc, fenced, frac, sqrt, supsub, text } from '@formulax/core';
import { describe, expect, it } from 'vitest';
import { renderInteractiveHtml } from '../src';

describe('renderInteractiveHtml', () => {
  it('renders interactive markup for supported node types', () => {
    const html = renderInteractiveHtml(
      doc([
        text('x'),
        frac([text('a')], [text('b')]),
        supsub([text('y')], [text('2')], [text('i')]),
        sqrt([text('z')]),
        fenced('[', ']', [text('q')]),
      ]),
      [3, 0],
    );

    expect(html).toContain('fx-editor-surface');
    expect(html).toContain('fx-text');
    expect(html).toContain('fx-frac-num');
    expect(html).toContain('fx-frac-den');
    expect(html).toContain('fx-supsub-base');
    expect(html).toContain('fx-sqrt-body is-active');
    expect(html).toContain('fx-fenced-body');
    expect(html).toContain('data-path="1.0"');
    expect(html).toContain('data-path="2.1"');
  });
});
