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

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
]) {
  test(`@mobile reflows at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('group', { name: 'Interactive Smith chart' })).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.getByRole('textbox', { name: 'Resistance' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Selected|Select/ }).first()).toBeVisible();
  });
}

test('@mobile supports 200 percent text scaling', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.addInitScript(() => localStorage.setItem('smith-match:first-use-dismissed', 'true'));
  await page.goto('/');
  await page.addStyleTag({ content: 'html{font-size:200%!important}' });
  const overflow = await page.evaluate(
    () =>
      Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('textbox', { name: 'Resistance' })).toBeVisible();
  await expect(page.getByText('Chart summary', { exact: true })).toBeVisible();
});

test('@mobile DOM focus order follows selected result, controls, alternate result', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const selected = page
    .getByRole('article')
    .filter({ hasText: 'Solution A' })
    .getByRole('button', { name: 'Selected' });
  const resistance = page.getByRole('textbox', { name: 'Resistance' });
  const alternate = page
    .getByRole('article')
    .filter({ hasText: 'Solution B' })
    .getByRole('button', { name: 'Select' });
  const resistanceHandle = await resistance.elementHandle();
  const alternateHandle = await alternate.elementHandle();
  if (!resistanceHandle || !alternateHandle) throw new Error('Focus-order controls are missing.');
  expect(
    await selected.evaluate(
      (left, right) =>
        Boolean(left.compareDocumentPosition(right as Node) & Node.DOCUMENT_POSITION_FOLLOWING),
      resistanceHandle,
    ),
  ).toBe(true);
  expect(
    await resistance.evaluate(
      (left, right) =>
        Boolean(left.compareDocumentPosition(right as Node) & Node.DOCUMENT_POSITION_FOLLOWING),
      alternateHandle,
    ),
  ).toBe(true);
  await expect(page.locator('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])')).toHaveCount(0);
});

test('@mobile preserves focused control across responsive reorder', async ({ page }) => {
  await page.setViewportSize({ width: 790, height: 900 });
  await page.goto('/');
  const resistance = page.getByRole('textbox', { name: 'Resistance' });
  await resistance.focus();
  await page.setViewportSize({ width: 900, height: 900 });
  await expect(page.getByRole('textbox', { name: 'Resistance' })).toBeFocused();
});
