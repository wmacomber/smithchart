import { expect, test } from '@playwright/test';
test('@matching switches visible solution', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('article')
    .filter({ hasText: 'Solution B' })
    .getByRole('button', { name: 'Select' })
    .click();
  await expect(page).toHaveURL(/solution=B/);
  await expect(page.locator('.matching-solution.solution-b.is-selected')).toHaveCount(2);
  await expect(page.locator('.solution-path')).toHaveCount(1);
});
test('@matching compares both paths without changing selected URL solution', async ({ page }) => {
  await page.goto('/?v=1&r=35&x=-22&z0=50&f=14.2MHz&vf=.66&stub=shunt-short&solution=B');
  await page.getByRole('checkbox', { name: 'Compare both paths on chart' }).check();
  await expect(page.locator('.solution-path')).toHaveCount(2);
  await expect(page.locator('.stub-path')).toHaveCount(2);
  await expect(page).toHaveURL(/solution=B/);
  await expect(page).not.toHaveURL(/overlay/);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('smith-match-preferences-v4') ?? ''))
    .toContain('overlay');
  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'Compare both paths on chart' })).toBeChecked();
});
test('@reduced-motion supports preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.solution-path')).toBeVisible();
  await expect(page.locator('.center-match-marker')).toBeVisible();
});
