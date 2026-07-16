import { expect, test } from '@playwright/test';
test('@workspace URL restores solution', async ({ page }) => {
  await page.goto('/?v=1&r=25&x=0&z0=50&f=14.2MHz&vf=.66&stub=shunt-open&solution=B');
  await expect(page.getByRole('button', { name: 'Selected' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Solution B' })).toBeVisible();
});

test('@workspace warns and canonicalizes recoverable URL errors', async ({ page }) => {
  await page.goto('/?v=1&r=nope&x=2&z0=0&f=1MHz&vf=.66&stub=shunt-open&solution=A');
  await expect(page.getByRole('status')).toContainText('Invalid load');
  await expect(page.getByRole('status')).toContainText('Invalid characteristic impedance');
  await expect(page).toHaveURL(/r=35&x=-22&z0=50&f=1MHz/);
});
