import { expect, test } from '@playwright/test';
test('browser calculation workflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Solution A' })).toBeVisible();
});
