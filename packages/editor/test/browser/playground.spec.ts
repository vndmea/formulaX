import { expect, test } from '@playwright/test';

test('playground inserts text and fraction nodes', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="playground-editor"]').click();
  await page.keyboard.type('ab');
  await page.keyboard.press('/');

  await expect(page.locator('[data-testid="latex-output"]')).toContainText('\\frac');
});
