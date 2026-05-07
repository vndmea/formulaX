// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { serializeSvgForInsertion } from '../src/editor-host';

const SVG_NS = 'http://www.w3.org/2000/svg';

describe('editor-host svg serialization', () => {
  it('sizes inline svg from the cropped viewport instead of the raw content box', () => {
    const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
    const group = document.createElementNS(SVG_NS, 'g');

    svg.appendChild(group);

    Object.defineProperty(svg, 'getBBox', {
      value: () => ({ x: 10, y: 20, width: 100, height: 20 }),
    });

    Object.defineProperty(svg, 'getBoundingClientRect', {
      value: () => ({ width: 200, height: 40 }),
    });

    const markup = serializeSvgForInsertion(svg);

    expect(markup).toContain('viewBox="0 0 100.5 20.5"');
    expect(markup).toContain('translate(-10 -20)');
    expect(markup).toContain('width="100.5"');
    expect(markup).toContain('height="20.5"');
    expect(markup).toContain('style="width:8.089em; height:1.65em"');
  });
});
