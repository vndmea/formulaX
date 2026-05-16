// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import {
  createFormulaMarkup,
  readRenderedFormulaSvgBox,
  serializeSvgForInsertion,
} from '../src';

const SVG_NS = 'http://www.w3.org/2000/svg';

function createMatrix(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
) {
  return { a, b, c, d, e, f };
}

describe('renderer svg', () => {
  it('creates a formula node with shared semantics and caller extra attributes', () => {
    const markup = createFormulaMarkup('\\sqrt{x}', {
      extraAttributes: {
        'data-mce-contenteditable': 'false',
      },
    });

    expect(markup).toContain('class="formulax-math"');
    expect(markup).toContain('data-formulax="true"');
    expect(markup).toContain('data-formulax-latex="\\sqrt{x}"');
    expect(markup).toContain('data-mce-contenteditable="false"');
    expect(markup).toContain('role="button"');
    expect(markup).toContain('style="cursor: pointer"');
    expect(markup).toContain('tabindex="0"');
  });

  it('reads the rendered formula box from the content group when available', () => {
    const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
    const content = document.createElementNS(SVG_NS, 'g');
    content.setAttribute('data-type', 'kf-editor-exp-content-box');
    content.appendChild(document.createElementNS(SVG_NS, 'text'));
    svg.appendChild(content);

    Object.defineProperty(content, 'getBBox', {
      value: () => ({ x: 1, y: 2, width: 10, height: 6 }),
    });

    Object.defineProperty(content, 'getCTM', {
      value: () => createMatrix(1, 0, 0, 1, 5, 7),
    });

    Object.defineProperty(svg, 'getCTM', {
      value: () => createMatrix(1, 0, 0, 1, 0, 0),
    });

    expect(readRenderedFormulaSvgBox(svg)).toEqual({
      x: 6,
      y: 9,
      width: 10,
      height: 6,
    });
  });

  it('flattens the transformed formula content box into the inline svg viewport', () => {
    const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
    const defs = document.createElementNS(SVG_NS, 'defs');
    defs.setAttribute('id', 'defs-root');

    const outer = document.createElementNS(SVG_NS, 'g');
    outer.setAttribute('id', 'outer-wrap');

    const container = document.createElementNS(SVG_NS, 'g');
    container.setAttribute('data-type', 'kf-container');

    const root = document.createElementNS(SVG_NS, 'g');
    root.setAttribute('data-root', 'true');

    const content = document.createElementNS(SVG_NS, 'g');
    content.setAttribute('data-type', 'kf-editor-exp-content-box');

    const text = document.createElementNS(SVG_NS, 'text');
    text.textContent = 'x';
    content.appendChild(text);
    root.appendChild(content);
    container.appendChild(root);
    outer.appendChild(container);
    svg.append(defs, outer);

    Object.defineProperty(content, 'getBBox', {
      value: () => ({ x: 0, y: 0, width: 286.671875, height: 84 }),
    });

    Object.defineProperty(content, 'getCTM', {
      value: () => createMatrix(0.8, 0, 0, 0.8, 315.33125364780426, 50.39999794960022),
    });

    Object.defineProperty(svg, 'getCTM', {
      value: () => createMatrix(1, 0, 0, 1, 430, 84),
    });

    Object.defineProperty(svg, 'getBoundingClientRect', {
      value: () => ({ width: 860, height: 168 }),
    });

    const markup = serializeSvgForInsertion(svg);

    expect(markup).toContain('viewBox="0 0 229.838 67.7"');
    expect(markup).toContain('translate(114.919 33.85)');
    expect(markup).toContain('matrix(0.8 0 0 0.8 -114.669 -33.6)');
    expect(markup).toContain('width="229.838"');
    expect(markup).toContain('height="67.7"');
    expect(markup).toContain('style="font-size:inherit; width:5.602em; height:1.65em"');
    expect(markup).not.toContain('outer-wrap');
    expect(markup).not.toContain('data-type="kf-container"');
  });

  it('falls back to sizing the original svg when no formula content box is present', () => {
    const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
    svg.setAttribute('viewBox', '0 0 100 20');
    svg.appendChild(document.createElementNS(SVG_NS, 'g'));

    Object.defineProperty(svg, 'getBoundingClientRect', {
      value: () => ({ width: 200, height: 40 }),
    });

    const markup = serializeSvgForInsertion(svg);

    expect(markup).toContain('viewBox="0 0 100 20"');
    expect(markup).toContain('width="100"');
    expect(markup).toContain('height="20"');
    expect(markup).toContain('style="font-size:inherit; width:6.25em; height:1.25em"');
  });

  it('uses the base inline em height for simple formulas and removes root font-size', () => {
    const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
    svg.setAttribute('viewBox', '0 0 24 40.5');
    svg.setAttribute('font-size', '50');
    svg.appendChild(document.createElementNS(SVG_NS, 'g'));

    Object.defineProperty(svg, 'getBoundingClientRect', {
      value: () => ({ width: 48, height: 81 }),
    });

    const markup = serializeSvgForInsertion(svg);

    expect(markup).toContain('width="24"');
    expect(markup).toContain('height="40.5"');
    expect(markup).toContain('style="font-size:inherit; width:0.75em; height:1.25em"');
    expect(markup).not.toContain('font-size="50"');
  });

  it('caps complex formulas at the maximum inline em height', () => {
    const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
    svg.setAttribute('viewBox', '0 0 300 400');
    svg.appendChild(document.createElementNS(SVG_NS, 'g'));

    Object.defineProperty(svg, 'getBoundingClientRect', {
      value: () => ({ width: 600, height: 800 }),
    });

    const markup = serializeSvgForInsertion(svg);

    expect(markup).toContain('width="300"');
    expect(markup).toContain('height="400"');
    expect(markup).toContain('style="font-size:inherit; width:1.237em; height:1.65em"');
  });
});
