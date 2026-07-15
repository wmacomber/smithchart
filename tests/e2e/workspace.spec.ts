import { expect, test } from '@playwright/test';
test('@workspace synchronizes input and results', async ({ page }) => {
  await page.goto('/?v=1&r=35&x=-22&z0=50&f=14.2MHz&vf=.66&stub=shunt-short&solution=A');
  await expect(page.getByRole('heading', { name: 'Solution A' })).toBeVisible();
  const resistance = page.getByRole('textbox', { name: 'Resistance' });
  await resistance.fill('25');
  await resistance.press('Enter');
  await expect(page).toHaveURL(/r=25/);
});
