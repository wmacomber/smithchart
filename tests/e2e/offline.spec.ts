import { expect, test } from '@playwright/test';
test('offline build registers worker', async ({ page }) => {
  await page.goto('/');
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker?.ready.then(() => true)))
    .toBe(true);
});
