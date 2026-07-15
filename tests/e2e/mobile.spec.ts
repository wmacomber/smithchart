import { expect, test } from '@playwright/test';
test.use({ viewport: { width: 390, height: 844 } });
test('@mobile keeps chart dominant', async ({ page }) => {
  await page.goto('/');
  const chart = page.getByRole('group', { name: 'Interactive Smith chart' });
  await expect(chart).toBeVisible();
  expect((await chart.boundingBox())!.width).toBeGreaterThan(340);
});
