import { expect, test } from '@playwright/test';

test.describe('runtime standard editor and renderer', () => {
  test('mounts an editor and exposes svg markup', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#runtime-editor svg')).toBeVisible();

    const latex = await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getLatex());
    const html = await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getRenderHtml());

    expect(latex).toBe('\\frac{a}{b}');
    expect(html).toContain('data-formulax-runtime="solid-svg"');
  });

  test('supports click-to-edit typing and undo/redo through keyboard input', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.mount(''));

    await page.locator('#runtime-editor .fx-runtime-editor__surface').click();
    await page.keyboard.type('x');
    await expect.poll(() => page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getLatex())).toBe('x');

    await page.keyboard.press('Control+Z');
    await expect.poll(() => page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getLatex())).toBe('');

    await page.keyboard.press('Control+Shift+Z');
    await expect.poll(() => page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getLatex())).toBe('x');
  });

  test('uses Tab to move across semantic placeholders after structure insertion', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.mount(''));

    await page.locator('#runtime-editor .fx-runtime-editor__surface').click();
    await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.dispatch({
      type: 'insertFraction',
      payload: undefined,
    }));

    await page.keyboard.type('x');
    await page.keyboard.press('Tab');
    await page.keyboard.type('y');

    await expect.poll(() => page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getLatex()))
      .toBe('\\frac{x}{y}');
  });

  test('renders readonly svg through renderer-standard', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      return window.__FORMULAX_RUNTIME_TEST__!.renderLatexToSvgMarkup('\\sqrt{x+1}', {
        fontSize: 36,
      });
    });

    expect(result.engine).toBe('standard');
    expect(result.output).toBe('svg');
    expect(result.html).toContain('<svg');
    expect(result.html).toContain('data-formulax-runtime="solid-svg"');
  });

  test('aligns indexed root radical and overbar', async ({ page }) => {
    await page.goto('/');

    const alignment = await page.evaluate(async () => {
      const result = await window.__FORMULAX_RUNTIME_TEST__!.renderLatexToSvgMarkup('\\sqrt [3] \\placeholder', {
        cache: false,
        fontSize: 40,
      });
      const host = document.createElement('div');
      host.innerHTML = result.html;
      const sqrt = host.querySelector('[data-formulax-box-kind="sqrt"]');
      if (!sqrt) {
        throw new Error('sqrt box not rendered');
      }
      const radical = Array.from(sqrt.children).find((child) => {
        return child.getAttribute('data-formulax-box-kind') === 'sqrt-radical';
      });
      const rule = sqrt.querySelector('line[data-formulax-role="sqrt-rule"]');
      const parseTranslateY = (element: Element): number => {
        const transform = element.getAttribute('transform') ?? '';
        const match = /translate\(\s*[-\d.]+\s*,\s*([-\d.]+)\s*\)/.exec(transform);
        if (!match) {
          throw new Error(`missing translate y: ${transform}`);
        }
        return Number(match[1]);
      };

      if (!radical || !rule) {
        throw new Error('indexed sqrt radical or rule not rendered');
      }

      return {
        radicalY: parseTranslateY(radical),
        ruleY: Number(rule.getAttribute('y1')),
      };
    });

    expect(alignment.radicalY).toBeGreaterThan(0);
    expect(alignment.ruleY).toBeCloseTo(alignment.radicalY + 1, 3);
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

  test('supports select-all replacement from the keyboard', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.mount('abc'));

    await page.locator('#runtime-editor .fx-runtime-editor__input').focus();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('z');

    await expect.poll(() => page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getLatex())).toBe('z');
    const html = await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getRenderHtml());
    expect(html).not.toContain('data-formulax-role="range-selection"');
  });

  test('supports drag range selection and replacement', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.mount('abcd'));

    const symbols = page.locator(
      '#runtime-editor g[data-formulax-line-index="0"] > g[data-formulax-box-kind="symbol"]',
    );
    const first = await symbols.nth(0).boundingBox();
    const third = await symbols.nth(2).boundingBox();
    if (!first || !third) {
      throw new Error('failed to resolve symbol bounds');
    }

    await page.mouse.move(first.x + first.width * 0.35, first.y + first.height / 2);
    await page.mouse.down();
    await page.mouse.move(third.x + third.width * 0.7, third.y + third.height / 2, { steps: 8 });
    await page.mouse.up();

    const selection = await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getSelection());
    expect(selection?.kind).toBe('range');
    expect(selection && 'startOffset' in selection ? selection.startOffset : null).toBe(0);
    expect(selection && 'endOffset' in selection ? selection.endOffset : null).toBe(3);

    const htmlBeforeReplace = await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getRenderHtml());
    expect(htmlBeforeReplace).toContain('data-formulax-role="range-selection"');

    await page.locator('#runtime-editor .fx-runtime-editor__input').focus();
    await page.keyboard.type('x');
    await expect.poll(() => page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getLatex())).toBe('xd');
  });

  test('supports double-click node selection for structures', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.mount('\\\u0066rac{a}{b}+x'));

    const fraction = page.locator('#runtime-editor g[data-formulax-box-kind="frac"]').first();
    const box = await fraction.boundingBox();
    if (!box) {
      throw new Error('failed to resolve fraction bounds');
    }
    await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);

    const selection = await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getSelection());
    expect(selection?.kind).toBe('node');
    const html = await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getRenderHtml());
    expect(html).toContain('data-formulax-role="node-selection"');

    await page.locator('#runtime-editor .fx-runtime-editor__input').focus();
    await page.keyboard.press('Backspace');
    await expect.poll(() => page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getLatex())).toBe('+x');
  });

  test('navigates structurally between fraction numerator and denominator', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.mount('\\\u0066rac{ab}{cd}'));

    const numeratorSecond = page.locator(
      '#runtime-editor g[data-formulax-row-id] g[data-formulax-box-kind="symbol"]',
    ).nth(1);
    await numeratorSecond.click();

    const before = await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getSelection());
    expect(before?.rowId).not.toBeNull();

    await page.locator('#runtime-editor .fx-runtime-editor__input').focus();
    await page.keyboard.press('ArrowDown');
    const afterDown = await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getSelection());
    await page.keyboard.press('ArrowUp');
    const afterUp = await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getSelection());

    expect(afterDown?.rowId).not.toBe(before?.rowId);
    expect(afterUp?.rowId).toBe(before?.rowId);
  });

  test('mounts the standard toolbar popover and inserts legacy-style templates', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.mountModal('x'));

    const modal = page.locator('#runtime-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveClass(/fx-formula-runtime-host/);

    await modal.locator('[data-formulax-toolbar-button="radicals"]').click();
    await expect(modal.locator('.fx-runtime-toolbar__popover-card')).toBeVisible();
    await expect(modal.locator('.fx-formula-runtime-shell')).toHaveCSS('overflow', 'visible');
    const rootPreview = modal.locator(
      '[data-formulax-toolbar-latex="\\\\sqrt [3] \\\\placeholder"] '
      + '.fx-runtime-toolbar__item-preview',
    );
    await expect(rootPreview.locator('svg[data-formulax-runtime="solid-svg"]')).toBeVisible();
    await expect(rootPreview).not.toHaveCSS('background-image', /url/);

    await modal.locator('[data-formulax-toolbar-latex="\\\\sqrt [3] \\\\placeholder"]').click();
    await expect.poll(() => page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.getModalLatex())).toBe('x\\sqrt[3]{}');

    await modal.locator('[data-formulax-toolbar-button="brackets"]').click();
    await expect(modal.locator('.fx-runtime-toolbar__popover-card')).toBeVisible();

    await page.mouse.click(8, 8);
    await expect(modal.locator('.fx-runtime-toolbar__popover')).toHaveClass(/is-hidden/);

    await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.destroyModal());
  });

  test('standard modal toolbar keeps labels visible and shows non-area popovers without scrollbars', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.mountModal('x'));

    const modal = page.locator('#runtime-modal');
    await expect(modal).toBeVisible();
    await expect(
      modal.locator('[data-formulax-toolbar-control="scripts"] .fx-runtime-toolbar__button-icon svg'),
    ).toBeVisible();

    const labelMetrics = await modal.evaluate((node) => {
      const ids = ['fraction', 'integrals', 'large-ops', 'functions'];

      return ids.map((id) => {
        const button = node.querySelector<HTMLElement>(`[data-formulax-toolbar-control="${id}"]`);
        const label = button?.querySelector<HTMLElement>('.fx-runtime-toolbar__button-label');
        const buttonRect = button?.getBoundingClientRect();
        const labelRect = label?.getBoundingClientRect();

        return {
          id,
          hasButton: Boolean(buttonRect),
          hasLabel: Boolean(labelRect),
          leftInset: buttonRect && labelRect ? Math.round(labelRect.left - buttonRect.left) : null,
          rightOverflow: buttonRect && labelRect ? Math.round(labelRect.right - buttonRect.right) : null,
          bottomOverflow: buttonRect && labelRect ? Math.round(labelRect.bottom - buttonRect.bottom) : null,
        };
      });
    });

    for (const metric of labelMetrics) {
      expect(metric.hasButton).toBe(true);
      expect(metric.hasLabel).toBe(true);
      expect(metric.leftInset).toBeGreaterThanOrEqual(0);
      expect(metric.rightOverflow).toBeLessThanOrEqual(0);
      expect(metric.bottomOverflow).toBeLessThanOrEqual(0);
    }

    const popoverButtons = ['presets', 'fraction', 'scripts', 'radicals', 'integrals', 'large-ops', 'brackets', 'functions'];
    for (const id of popoverButtons) {
      await modal.locator(`[data-formulax-toolbar-button="${id}"]`).click();
      const popup = modal.locator('.fx-runtime-toolbar__popover:not(.is-hidden)').first();
      await expect(popup).toBeVisible();

      const metrics = await popup.evaluate((node) => {
        const body = node.querySelector<HTMLElement>('.fx-runtime-toolbar__popover-body') ?? node;
        const presetPreview = node.querySelector<HTMLElement>(
          '.fx-runtime-toolbar__item--presets .fx-runtime-toolbar__item-preview--template',
        );
        const presetText = presetPreview?.querySelector<SVGTextElement>('text');
        const presetSvg = presetPreview?.querySelector<SVGSVGElement>('svg');
        const lineGroup = presetSvg?.querySelector('g[data-formulax-line-index="0"]');
        const rootChildren = lineGroup
          ? Array.from(lineGroup.children)
          : [];
        const numeratorRow = presetSvg?.querySelector('g[data-formulax-box-kind="frac"] > g[data-formulax-box-kind="row"]');
        const numeratorChildren = numeratorRow
          ? Array.from(numeratorRow.children).filter((item) => item instanceof SVGGElement)
          : [];
        const measureGaps = (items: Element[]) => {
          const sorted = items
            .map((item) => ({
              left: item.getBoundingClientRect().left,
              right: item.getBoundingClientRect().right,
            }))
            .sort((a, b) => a.left - b.left);
          return sorted.slice(1).map((item, index) => item.left - sorted[index].right);
        };

        return {
          overflowY: getComputedStyle(body).overflowY,
          presetAlignItems: presetPreview ? getComputedStyle(presetPreview).alignItems : null,
          presetTextBaseline: presetText?.getAttribute('dominant-baseline') ?? null,
          presetRootMinGap: rootChildren.length > 1 ? Math.min(...measureGaps(rootChildren)) : null,
          presetNumeratorMinGap: numeratorChildren.length > 1 ? Math.min(...measureGaps(numeratorChildren)) : null,
        };
      });

      expect(metrics.overflowY).not.toBe('auto');
      if (id === 'presets') {
        expect(metrics.presetAlignItems).toBe('flex-start');
        expect(metrics.presetTextBaseline).toBe('middle');
        expect(metrics.presetRootMinGap).not.toBeNull();
        expect(metrics.presetNumeratorMinGap).not.toBeNull();
        expect(metrics.presetRootMinGap!).toBeGreaterThanOrEqual(0);
        expect(metrics.presetNumeratorMinGap!).toBeGreaterThanOrEqual(0);
      }

      await page.mouse.click(8, 8);
    }

    await modal.locator('[data-formulax-toolbar-button="integrals"]').click();
    const overflowMetrics = await modal.evaluate((node) => {
      const shell = node.querySelector<HTMLElement>('.fx-formula-runtime-shell');
      const popup = node.querySelector<HTMLElement>('.fx-runtime-toolbar__popover:not(.is-hidden)');
      const shellRect = shell?.getBoundingClientRect();
      const popupRect = popup?.getBoundingClientRect();

      return {
        shellBottom: shellRect ? Math.round(shellRect.bottom) : null,
        popupBottom: popupRect ? Math.round(popupRect.bottom) : null,
      };
    });

    expect(overflowMetrics.shellBottom).not.toBeNull();
    expect(overflowMetrics.popupBottom).not.toBeNull();
    expect((overflowMetrics.popupBottom ?? 0) > (overflowMetrics.shellBottom ?? 0)).toBe(true);

    await page.evaluate(() => window.__FORMULAX_RUNTIME_TEST__!.destroyModal());
  });
});
