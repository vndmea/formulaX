import { describe, expect, it } from 'vitest';
import { createFormulaRendererV2, renderLatexToSvgMarkup } from '../src';

describe('renderer-next', () => {
  it('renders latex into svg markup', async () => {
    document.body.innerHTML = '';
    const result = await renderLatexToSvgMarkup('\\frac{a}{b}', {
      fontSize: 40,
    });

    expect(result.engine).toBe('runtime-v2');
    expect(result.output).toBe('svg');
    expect(result.html).toContain('<svg');
    expect(result.html).toContain('data-formulax-runtime="solid-svg"');
  });

  it('reuses cached render promises for identical requests', async () => {
    const renderer = createFormulaRendererV2({
      fontSize: 32,
    });

    const first = renderer.renderLatex('x+y');
    const second = renderer.renderLatex('x+y');

    expect(first).toBe(second);

    const [left, right] = await Promise.all([first, second]);
    expect(left.html).toBe(right.html);
  });

  it('passes wrap options through to the runtime renderer', async () => {
    const result = await renderLatexToSvgMarkup('a+b+c+d+e+f+g+h', {
      fontSize: 28,
      wrap: 'soft',
      maxWidth: 120,
    });

    expect(result.html).toContain('data-formulax-line-index="0"');
    expect(result.html).toContain('data-formulax-line-index="1"');
  });
});
