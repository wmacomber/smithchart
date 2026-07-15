import { expect, test } from '@playwright/test';
test('@visual instrument shell', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium');
  await page.goto('/');
  await expect(page).toHaveScreenshot('instrument-desktop.png', {
    fullPage: true,
    animations: 'disabled',
  });
});
