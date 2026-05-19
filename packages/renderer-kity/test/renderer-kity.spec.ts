import { expect, test } from '@playwright/test';

test.describe('renderer-kity browser rendering', () => {
  test('renders latex into inline SVG markup', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const api = window.__FORMULAX_RENDERER_KITY_TEST__;

      if (!api) {
        throw new Error('renderer-kity test API not available');
      }

      return api.renderLatexToSvgMarkup('\\\\frac{a}{b}', {
        fontSize: 40,
      });
    });

    expect(result.engine).toBe('kity');
    expect(result.output).toBe('svg');
    expect(result.latex).toBe('\\frac{a}{b}');
    expect(result.html).toContain('<svg');
    expect(result.html).toContain('formulax-math__svg');
    expect(result.html).toContain('aria-hidden="true"');
  });

  test('reuses cached render promise for identical latex and options', async ({ page }) => {
    await page.goto('/');

    const cacheResult = await page.evaluate(async () => {
      const api = window.__FORMULAX_RENDERER_KITY_TEST__;

      if (!api) {
        throw new Error('renderer-kity test API not available');
      }

      const first = api.renderLatexToSvgMarkup('x+y', {
        fontSize: 32,
      });

      const second = api.renderLatexToSvgMarkup('x+y', {
        fontSize: 32,
      });

      const samePromise = first === second;
      const [firstResult, secondResult] = await Promise.all([first, second]);

      return {
        samePromise,
        sameHtml: firstResult.html === secondResult.html,
        firstEngine: firstResult.engine,
        secondEngine: secondResult.engine,
      };
    });

    expect(cacheResult.samePromise).toBe(true);
    expect(cacheResult.sameHtml).toBe(true);
    expect(cacheResult.firstEngine).toBe('kity');
    expect(cacheResult.secondEngine).toBe('kity');
  });
});
