import { expect, test } from '@playwright/test';
test('@matching switches visible solution', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('article')
    .filter({ hasText: 'Solution B' })
    .getByRole('button', { name: 'Select' })
    .click();
  await expect(page).toHaveURL(/solution=B/);
  await expect(page.locator('.solution-b')).toHaveCount(2);
});
test('@reduced-motion supports preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.solution-path')).toBeVisible();
});
