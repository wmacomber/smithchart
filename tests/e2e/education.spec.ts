import { expect, test } from '@playwright/test';
test('@education includes core topics', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Learn the match' })).toBeVisible();
  await expect(page.getByText('Why admittance')).toBeVisible();
});
