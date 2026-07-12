import { describe, expect, it } from 'vitest';
import { createStandardFormulaRenderer, renderLatexToSvgMarkup } from '../../src/standard';

describe('renderer-standard', () => {
  it('renders latex into svg markup', async () => {
    document.body.innerHTML = '';
    const result = await renderLatexToSvgMarkup('\\frac{a}{b}', {
      fontSize: 40,
    });

    expect(result.engine).toBe('standard');
    expect(result.output).toBe('svg');
    expect(result.html).toContain('<svg');
    expect(result.html).toContain('data-formulax-runtime="solid-svg"');
    expect(result.html.toLowerCase()).not.toContain('kf-');
    expect(result.html.toLowerCase()).not.toContain('kity');
  });

  it('renders native dashed placeholders with the KF AMS default font', async () => {
    const result = await renderLatexToSvgMarkup('\\frac{\\placeholder}{x}', {
      fontSize: 40,
      cache: false,
    });

    expect(result.html).toContain('data-formulax-role="placeholder"');
    expect(result.html).toContain('stroke-dasharray="5 5"');
    expect(result.html).toContain('KF AMS MAIN');
    expect(result.html).not.toContain('□');
  });

  it('centers text glyphs and connects sqrt rules to the radical shoulder', async () => {
    const result = await renderLatexToSvgMarkup('x=\\frac {-b\\pm\\sqrt {b^2-4ac}}{2a}', {
      fontSize: 40,
      cache: false,
    });
    const host = document.createElement('div');
    host.innerHTML = result.html;
    const textNodes = Array.from(host.querySelectorAll('text'));
    const sqrt = host.querySelector('[data-formulax-box-kind="sqrt"]');
    const sqrtRule = sqrt?.querySelector('line');
    const sqrtRows = Array.from(sqrt?.querySelectorAll('[data-formulax-box-kind="row"]') ?? []);
    const valueRow = sqrtRows[sqrtRows.length - 1];
    const valueTransform = valueRow?.getAttribute('transform') ?? '';
    const valueX = Number(valueTransform.match(/translate\(([^,]+)/)?.[1] ?? 0);
    const ruleX = Number(sqrtRule?.getAttribute('x1') ?? valueX);

    expect(textNodes.every((node) => node.getAttribute('dominant-baseline') === 'middle')).toBe(true);
    expect(textNodes.every((node) => node.getAttribute('dy') === '0.12em')).toBe(true);
    expect(sqrt?.querySelector('[data-formulax-box-kind="sqrt-radical"] path')).not.toBeNull();
    expect(ruleX).toBeLessThan(valueX);
  });

  it('renders legacy binomial templates without literal detached caret glyphs', async () => {
    const result = await renderLatexToSvgMarkup(
      '{\\left(x+a\\right)}^2=\\sum^n_{k=0}{\\left(^n_k\\right)x^ka^{n-k}}',
      {
        fontSize: 40,
        cache: false,
      },
    );
    const host = document.createElement('div');
    host.innerHTML = result.html;
    const literalTexts = Array.from(host.querySelectorAll('text')).map((node) => node.textContent);

    expect(literalTexts).not.toContain('^');
  });

  it('reuses cached render promises for identical requests', async () => {
    const renderer = createStandardFormulaRenderer({
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
