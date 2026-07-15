import { expect, test } from '@playwright/test';
test('@workspace URL restores solution', async ({ page }) => {
  await page.goto('/?v=1&r=25&x=0&z0=50&f=14.2MHz&vf=.66&stub=shunt-open&solution=B');
  await expect(page.getByRole('button', { name: 'Selected' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Solution B' })).toBeVisible();
});
