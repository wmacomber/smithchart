import { expect, test } from '@playwright/test';
test('@smoke loads instrument shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Smith Match' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Interactive Smith chart' })).toBeVisible();
});
