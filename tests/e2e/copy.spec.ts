import { expect, test } from '@playwright/test';

test('@copy copies construction instructions', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Clipboard permission coverage runs in Chromium.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page
    .getByRole('article')
    .filter({ hasText: 'Solution A' })
    .getByRole('button', { name: 'Copy instructions' })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('toward the transmitter');
});
