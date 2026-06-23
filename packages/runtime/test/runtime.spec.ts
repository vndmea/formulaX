import { expect, test } from '@playwright/test';

test.describe('runtime v2 editor and renderer', () => {
  test('mounts an editor and exposes svg markup', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#runtime-editor svg')).toBeVisible();

    const latex = await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getLatex());
    const html = await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getRenderHtml());

    expect(latex).toBe('\\frac{a}{b}');
    expect(html).toContain('data-formulax-runtime="solid-svg"');
  });

  test('supports typing and undo/redo through keyboard input', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.mount(''));

    await page.locator('#runtime-editor .fx-runtime-editor__input').focus();
    await page.keyboard.type('x');
    await expect.poll(() => page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getLatex())).toBe('x');

    await page.keyboard.press('Control+Z');
    await expect.poll(() => page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getLatex())).toBe('');

    await page.keyboard.press('Control+Shift+Z');
    await expect.poll(() => page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getLatex())).toBe('x');
  });

  test('renders readonly svg through renderer-v2', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      return window.__FORMULAX_RUNTIME_TEST__!.renderLatexToSvgMarkup('\\sqrt{x+1}', {
        fontSize: 36,
      });
    });

    expect(result.engine).toBe('runtime-v2');
    expect(result.output).toBe('svg');
    expect(result.html).toContain('<svg');
    expect(result.html).toContain('data-formulax-runtime="solid-svg"');
  });

  test('wraps long formulas across multiple svg lines', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      return window.__FORMULAX_RUNTIME_TEST__!.renderLatexToSvgMarkup('a+b+c+d+e+f+g+h', {
        fontSize: 30,
        wrap: 'soft',
        maxWidth: 120,
      });
    });

    expect(result.html).toContain('data-formulax-line-index="0"');
    expect(result.html).toContain('data-formulax-line-index="1"');
  });

  test('moves the caret across wrapped lines with arrow keys', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.mount('a+b+c+d+e+f+g+h', {
      wrap: 'soft',
      maxWidth: 120,
    }));

    await page.locator('#runtime-editor .fx-runtime-editor__input').focus();
    await page.keyboard.press('End');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');

    const html = await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getRenderHtml());
    expect(html).toContain('data-formulax-role="caret"');
  });
});
