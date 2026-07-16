import { expect, test } from '@playwright/test';

test('@copy copies construction instructions', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Clipboard permission coverage runs in Chromium.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page
    .getByRole('article')
    .filter({ hasText: 'Solution A' })
    .getByRole('button', { name: 'Copy construction instructions' })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('toward the transmitter');
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('Residual:');
});

test('@copy exposes selected fallback text when clipboard fails', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('denied')) },
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Copy construction instructions' }).click();
  const fallback = page.getByRole('textbox', { name: 'Copyable construction instructions' });
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveValue(/Solution A[\s\S]*Residual:/);
  await expect(fallback).toBeFocused();
});
