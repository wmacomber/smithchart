import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
test('@a11y has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')),
  ).toEqual([]);
});

test('@a11y associates numeric errors and exposes native mode semantics', async ({ page }) => {
  await page.goto('/');
  const resistance = page.getByRole('textbox', { name: 'Resistance' });
  await resistance.fill('-');
  const errorId = await resistance.getAttribute('aria-errormessage');
  expect(errorId).toBeTruthy();
  await expect(page.locator(`#${errorId}`)).toContainText('Finish entering');
  await expect(page.getByRole('radio', { name: 'Impedance', exact: true })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Short' })).toBeChecked();
});
