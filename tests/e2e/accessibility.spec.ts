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

test('@a11y load marker exposes stable name, instructions, and live value', async ({ page }) => {
  await page.goto('/');
  const marker = page.getByRole('slider', { name: 'Load marker' });
  await expect(marker).toHaveAttribute('aria-describedby', /load-marker-instructions/);
  await expect(marker).toHaveAttribute('aria-valuetext', /resistance.*reflection magnitude/i);
  await marker.focus();
  await marker.press('ArrowRight');
  await expect(page.locator('.load-marker-focus-ring')).toHaveCSS('stroke-width', '3px');
  await expect(page.locator('.load-marker-tooltip')).toBeVisible();
  await marker.press('Escape');
  await expect(page.locator('[id^="load-marker-status-"]')).toContainText('canceled');
});
