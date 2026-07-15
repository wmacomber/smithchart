import { expect, test } from '@playwright/test';
test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
test('touch target remains operable', async ({ page }) => {
  await page.goto('/');
  const marker = page.getByRole('slider');
  const box = await marker.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
});
