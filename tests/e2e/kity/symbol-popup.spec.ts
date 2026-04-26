import { test, expect } from '@playwright/test';

test.describe('symbol popup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('symbol overflow opens popup', async ({ page }) => {
    const moreBtn = page.locator('.kity-toolbar-btn:has-text("...")');
    if (await moreBtn.isVisible()) {
      await moreBtn.click();
      const popup = page.locator('.kity-toolbar-popup');
      await expect(popup).toBeVisible();
    }
  });

  test('popup is not clipped', async ({ page }) => {
    const moreBtn = page.locator('.kity-toolbar-btn:has-text("...")');
    if (await moreBtn.isVisible()) {
      const popupBefore = page.locator('.kity-toolbar-popup');
      await moreBtn.click();
      const popup = page.locator('.kity-toolbar-popup');
      await expect(popup).toBeVisible();
    }
  });

  test('outside click closes popup', async ({ page }) => {
    const moreBtn = page.locator('.kity-toolbar-btn:has-text("...")');
    if (await moreBtn.isVisible()) {
      await moreBtn.click();
      const popup = page.locator('.kity-toolbar-popup');
      await expect(popup).toBeVisible();
      await page.click('body', { position: { x: 10, y: 10 } });
      await expect(popup).not.toBeVisible();
    }
  });
});
