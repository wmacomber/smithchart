import { expect, test } from '@playwright/test';
test.use({ viewport: { width: 390, height: 844 } });
test('@mobile keeps chart dominant', async ({ page }) => {
  await page.goto('/');
  const chart = page.getByRole('group', { name: 'Interactive Smith chart' });
  await expect(chart).toBeVisible();
  expect((await chart.boundingBox())!.width).toBeGreaterThan(340);
  const selectedCard = page.getByRole('article').filter({ hasText: 'Solution A' });
  const controls = page.locator('.controls-panel');
  expect((await selectedCard.boundingBox())!.y).toBeLessThan((await controls.boundingBox())!.y);
  await expect(page.getByRole('button', { name: 'Examples' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Learn' })).toBeVisible();
  await page.locator('.more-actions > summary').click();
  await expect(page.getByRole('button', { name: 'Export SVG' })).toBeVisible();
});
