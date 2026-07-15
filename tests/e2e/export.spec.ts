import { expect, test } from '@playwright/test';
test('@export downloads standalone SVG', async ({ page }) => {
  await page.goto('/');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export SVG' }).click();
  expect((await download).suggestedFilename()).toBe('smith-match.svg');
});

test('print worksheet retains input parameters', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('heading', { name: 'Transmission line' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Frequency' })).toBeVisible();
});
