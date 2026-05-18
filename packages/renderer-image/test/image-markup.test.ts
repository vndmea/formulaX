// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import {
  createFormulaDisplayAttributes,
  createFormulaImageHtml,
  renderFormulaDisplayHtml,
} from '../src';
import * as svgToPngModule from '../src/svg-to-png';
import type { FormulaRenderResult, FormulaRenderer } from '@formulaxjs/renderer';

describe('renderer-image markup', () => {
  it('escapes image html attributes', () => {
    const html = createFormulaImageHtml({
      src: 'https://example.com/a?x="1"&y=<2>',
      latex: '"<x>"',
      style: 'width:1em; height:2em',
    });

    expect(html).toContain('src="https://example.com/a?x=&quot;1&quot;&amp;y=&lt;2&gt;"');
    expect(html).toContain('alt="&quot;&lt;x&gt;&quot;"');
    expect(html).toContain('style="width:1em; height:2em"');
  });

  it('creates persisted image attributes from a display result', () => {
    expect(createFormulaDisplayAttributes({
      output: 'image',
      latex: '\\sqrt{x}',
      renderHtml: '<img />',
      source: {
        engine: 'test',
        output: 'svg',
        latex: '\\sqrt{x}',
        html: '<svg></svg>',
      },
      image: {
        url: 'http://localhost:3109/f/48231.png',
        width: 128,
        height: 48,
        displayStyle: 'width:2.5em; height:0.94em',
      },
    })).toEqual({
      'data-formulax-output': 'image',
      'data-formulax-image-url': 'http://localhost:3109/f/48231.png',
      'data-formulax-image-width': '128',
      'data-formulax-image-height': '48',
      'data-formulax-image-style': 'width:2.5em; height:0.94em',
    });
  });

  it('does not upload when svg output is requested', async () => {
    const upload = vi.fn();
    const renderer = createRenderer('<svg width="24" height="40.5" style="width:0.75em;height:1.25em"></svg>');

    const result = await renderFormulaDisplayHtml({
      output: 'svg',
      renderer,
      latex: 'x',
      className: 'formulax-math',
      image: {
        upload,
      },
    });

    expect(upload).not.toHaveBeenCalled();
    expect(result.output).toBe('svg');
  });

  it('uploads png output and returns image html', async () => {
    vi.spyOn(svgToPngModule, 'svgMarkupToPngBlob').mockResolvedValue({
      blob: new Blob(['png']),
      width: 24,
      height: 40.5,
      displayStyle: 'width:0.75em; height:1.25em',
    });

    const upload = vi.fn().mockResolvedValue({
      url: 'https://h.uguu.se/test.png',
    });

    const result = await renderFormulaDisplayHtml({
      output: 'image',
      renderer: createRenderer('<svg width="24" height="40.5" style="width:0.75em;height:1.25em"></svg>'),
      latex: 'x',
      className: 'formulax-math',
      image: {
        upload,
      },
    });

    expect(upload).toHaveBeenCalledOnce();
    expect(result.output).toBe('image');
    expect(result.image).toMatchObject({
      url: 'https://h.uguu.se/test.png',
      width: 24,
      height: 40.5,
      displayStyle: 'width:0.75em; height:1.25em',
    });
    expect(result.renderHtml).toContain('img');
    expect(result.renderHtml).toContain('style="width:0.75em; height:1.25em"');
  });

  it('falls back to svg when upload fails and fallback is enabled', async () => {
    vi.spyOn(svgToPngModule, 'svgMarkupToPngBlob').mockResolvedValue({
      blob: new Blob(['png']),
      width: 24,
      height: 40.5,
      displayStyle: 'width:0.75em; height:1.25em',
    });

    const result = await renderFormulaDisplayHtml({
      output: 'image',
      renderer: createRenderer('<svg width="24" height="40.5"></svg>'),
      latex: 'x',
      className: 'formulax-math',
      image: {
        upload: vi.fn().mockRejectedValue(new Error('upload failed')),
        onUploadError: 'fallback-svg',
      },
    });

    expect(result.output).toBe('svg');
    expect(result.renderHtml).toContain('<svg');
  });

  it('throws when upload fails and fallback is disabled', async () => {
    vi.spyOn(svgToPngModule, 'svgMarkupToPngBlob').mockResolvedValue({
      blob: new Blob(['png']),
      width: 24,
      height: 40.5,
      displayStyle: 'width:0.75em; height:1.25em',
    });

    await expect(renderFormulaDisplayHtml({
      output: 'image',
      renderer: createRenderer('<svg width="24" height="40.5"></svg>'),
      latex: 'x',
      className: 'formulax-math',
      image: {
        upload: vi.fn().mockRejectedValue(new Error('upload failed')),
      },
    })).rejects.toThrow('upload failed');
  });
});

function createRenderer(html: string): FormulaRenderer {
  return {
    renderLatex: vi.fn(async (latex: string): Promise<FormulaRenderResult> => ({
      engine: 'test',
      output: 'svg',
      latex,
      html,
    })),
  };
}
