import { JSDOM } from 'jsdom';
import { describe, expect, it, vi } from 'vitest';

import {
  createFormulaMarkup,
  createFormulaRenderCacheKey,
  DEFAULT_FORMULA_ATTRIBUTE,
  DEFAULT_FORMULA_CLASS,
  escapeAttribute,
  escapeHtml,
  FORMULA_FLAG_ATTRIBUTE,
  serializeSvgForInsertion,
} from '../src';

describe('renderer markup utilities', () => {
  it('escapes HTML text content without escaping quotes', () => {
    expect(escapeHtml('<span title="x">a & b</span>')).toBe(
      '&lt;span title="x"&gt;a &amp; b&lt;/span&gt;',
    );
  });

  it('escapes attribute values', () => {
    expect(escapeAttribute('<span title="x">a & b</span>')).toBe(
      '&lt;span title=&quot;x&quot;&gt;a &amp; b&lt;/span&gt;',
    );
  });

  it('creates formula markup with default attributes and escaped fallback render content', () => {
    const markup = createFormulaMarkup('x < y & z');

    expect(markup).toContain(`class="${DEFAULT_FORMULA_CLASS}"`);
    expect(markup).toContain(`${FORMULA_FLAG_ATTRIBUTE}="true"`);
    expect(markup).toContain(`${DEFAULT_FORMULA_ATTRIBUTE}="x &lt; y &amp; z"`);
    expect(markup).toContain('data-latex="x &lt; y &amp; z"');
    expect(markup).toContain('contenteditable="false"');
    expect(markup).toContain('role="button"');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain('style="cursor: pointer"');
    expect(markup).toContain('<span class="formulax-math__render">x &lt; y &amp; z</span>');
  });

  it('creates formula markup with custom classes, block mode, render HTML and extra attributes', () => {
    const markup = createFormulaMarkup('\\frac{a}{b}', {
      attributeName: 'data-fx-latex',
      className: 'fx-math',
      displayMode: true,
      renderHtml: '<svg data-test="rendered"></svg>',
      cursorStyle: 'default',
      extraAttributes: {
        'data-origin': 'unit-test',
        'data-enabled': true,
        'data-disabled': false,
        'data-empty': null,
        style: 'vertical-align: middle;',
      },
    });

    expect(markup).toContain('class="fx-math fx-math--block"');
    expect(markup).toContain('data-fx-latex="\\frac{a}{b}"');
    expect(markup).toContain('data-origin="unit-test"');
    expect(markup).toContain('data-enabled');
    expect(markup).not.toContain('data-disabled');
    expect(markup).not.toContain('data-empty');
    expect(markup).toContain('style="vertical-align: middle; cursor: default"');
    expect(markup).toContain('<svg data-test="rendered"></svg>');
  });
});

describe('renderer cache utilities', () => {
  it('creates a stable cache key from renderer inputs', () => {
    expect(
      createFormulaRenderCacheKey({
        engine: 'kity',
        latex: '\\frac{a}{b}',
        output: 'svg',
        fontSize: 40,
        displayMode: false,
        className: 'formulax-math',
        assetCacheKey: 'assets-v1',
      }),
    ).toBe(
      JSON.stringify({
        engine: 'kity',
        latex: '\\frac{a}{b}',
        output: 'svg',
        fontSize: 40,
        displayMode: false,
        className: 'formulax-math',
        assetCacheKey: 'assets-v1',
      }),
    );
  });
});

describe('SVG serialization', () => {
  it('serializes SVG for inline insertion with accessibility and sizing attributes', () => {
    const dom = new JSDOM(`<!doctype html><body></body>`);
    const document = dom.window.document;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('width', '120');
    svg.setAttribute('height', '40');
    svg.setAttribute('class', 'source-svg');
    svg.innerHTML = '<path d="M0 0H10" />';

    Object.defineProperty(svg, 'getBoundingClientRect', {
      value: () => ({
        x: 0,
        y: 0,
        width: 120,
        height: 40,
        top: 0,
        right: 120,
        bottom: 40,
        left: 0,
        toJSON: vi.fn(),
      }),
    });

    const html = serializeSvgForInsertion(svg);

    expect(html).toContain('focusable="false"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('class="source-svg formulax-math__svg"');
    expect(html).toContain('width="120"');
    expect(html).toContain('height="40"');
    expect(html).toContain('font-size:inherit');
    expect(html).toContain('width:3.75em');
    expect(html).toContain('height:1.25em');
    expect(html).toContain('<path d="M0 0H10"></path>');
  });

  it('uniquifies SVG ids and rewrites references during serialization', () => {
    const dom = new JSDOM(`<!doctype html><body></body>`);
    const document = dom.window.document;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('width', '10');
    svg.setAttribute('height', '10');
    svg.innerHTML = `
      <defs>
        <linearGradient id="gradient"><stop offset="0%" /></linearGradient>
      </defs>
      <rect id="box" fill="url(#gradient)" clip-path="url(#box)" />
    `;

    const html = serializeSvgForInsertion(svg);

    expect(html).not.toContain('id="gradient"');
    expect(html).not.toContain('id="box"');
    expect(html).toMatch(/id="fx-[a-z0-9]{3}-gradient"/);
    expect(html).toMatch(/id="fx-[a-z0-9]{3}-box"/);
    expect(html).toMatch(/fill="url\(#fx-[a-z0-9]{3}-gradient\)"/);
    expect(html).toMatch(/clip-path="url\(#fx-[a-z0-9]{3}-box\)"/);
  });
});
