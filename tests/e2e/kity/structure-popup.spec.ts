import { test, expect } from '@playwright/test';

test.describe('structure popup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('structures use dropdown popup', async ({ page }) => {
    const structureBtns = page.locator('.kity-toolbar-section:has(.kity-toolbar-section-label:text("Structures")) .kity-toolbar-btn.has-dropdown');
    if (await structureBtns.count() > 0) {
      await structureBtns.first().click();
      const popup = page.locator('.kity-toolbar-popup');
      await expect(popup).toBeVisible();
    }
  });

  test('no vertical scrollbar in structures area', async ({ page }) => {
    const structuresRow = page.locator('.kity-toolbar-section:has(.kity-toolbar-section-label:text("Structures")) .kity-toolbar-row');
    await expect(structuresRow).toBeVisible();
    const overflow = await structuresRow.evaluate((el) => el.scrollHeight > el.clientHeight);
    expect(overflow).toBe(false);
  });
});
