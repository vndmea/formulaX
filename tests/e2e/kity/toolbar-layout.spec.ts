import { test, expect } from '@playwright/test';

test.describe('kity toolbar layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('left side shows only Equation button', async ({ page }) => {
    const equationBtn = page.locator('.kity-toolbar-equation-btn');
    await expect(equationBtn).toBeVisible();
    await expect(equationBtn).toHaveText('Equation');
  });

  test('symbols section has vertical tabs', async ({ page }) => {
    const tabs = page.locator('.kity-toolbar-symbol-tab');
    await expect(tabs.first()).toBeVisible();
  });

  test('visible symbol count is capped', async ({ page }) => {
    const symbolBtns = page.locator('.kity-toolbar-row .kity-toolbar-btn');
    const count = await symbolBtns.count();
    expect(count).toBeLessThanOrEqual(7);
  });
});
