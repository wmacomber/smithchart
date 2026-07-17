import { expect, test } from '@playwright/test';

test('browser calculation and accessibility workflow', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Solution A' })).toBeVisible();
  const resistance = page.getByRole('textbox', { name: 'Resistance' });
  await resistance.fill('42');
  await resistance.press('Enter');
  await expect(page).toHaveURL(/r=42/);

  const marker = page.getByRole('slider', { name: 'Load marker' });
  await marker.focus();
  await marker.press('ArrowRight');
  await marker.press('Escape');
  await expect(page.locator('[id^="load-marker-status-"]')).toContainText('canceled');

  await page
    .getByRole('article')
    .filter({ hasText: 'Solution B' })
    .getByRole('button', { name: 'Select' })
    .click();
  await expect(page.locator('[data-app-status]')).toHaveText('Solution B selected.');

  await page.getByText('Chart summary', { exact: true }).click();
  await expect(page.locator('#chart-description')).toContainText('normalized impedance');
  await expect(page.locator('.smith-chart foreignObject')).toHaveCount(0);
  const ids = await page
    .locator('.smith-chart [id]')
    .evaluateAll((nodes) => nodes.map((node) => node.id));
  expect(new Set(ids).size).toBe(ids.length);

  const learn = page.getByRole('button', { name: 'Learn' });
  await learn.click();
  await expect(page.getByRole('dialog', { name: 'Learn the match' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(learn).toBeFocused();

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.print-worksheet-summary')).toBeVisible();
  expect(errors).toEqual([]);
});

test('fatal render error has focused recovery UI', async ({ page }) => {
  await page.goto('/?test-error=render');
  const heading = page.getByRole('heading', { name: 'Instrument stopped safely' });
  await expect(page.getByRole('alert')).toContainText('URL still contains');
  await expect(heading).toBeFocused();
  await expect(page.getByRole('button', { name: 'Reload' })).toBeVisible();
});
