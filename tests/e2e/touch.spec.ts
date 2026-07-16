import { expect, test } from '@playwright/test';
test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
test('touch target remains operable', async ({ page }) => {
  await page.goto('/');
  await page.addStyleTag({ content: '.smith-chart{width:320px!important}' });
  const marker = page.getByRole('slider', { name: 'Load marker' });
  const box = await marker.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await expect(marker).toHaveCSS('touch-action', 'none');
  await expect(page.locator('.smith-chart')).not.toHaveCSS('touch-action', 'none');
});

test('touch drag previews and commits the load', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'CDP touch injection is Chromium-only.');
  await page.goto('/?v=1&r=35&x=-22&z0=50&f=14.2MHz&vf=.66&stub=shunt-short&solution=A');
  const markerBox = await page.getByRole('slider', { name: 'Load marker' }).boundingBox();
  const chartBox = await page.locator('.smith-chart').boundingBox();
  if (!markerBox || !chartBox) throw new Error('Chart touch geometry is unavailable.');
  const startX = markerBox.x + markerBox.width / 2;
  const startY = markerBox.y + markerBox.height / 2;
  const targetX = chartBox.x + chartBox.width / 2;
  const targetY = chartBox.y + chartBox.height / 2;
  const session = await page.context().newCDPSession(page);

  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: startX, y: startY, id: 1, radiusX: 2, radiusY: 2, force: 1 }],
  });
  await expect(page.locator('.marker-control')).toHaveAttribute('data-active', 'true');
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: targetX, y: targetY, id: 1, radiusX: 2, radiusY: 2, force: 1 }],
  });
  await expect(page.locator('.marker-control')).toHaveAttribute('data-active', 'true');
  await expect
    .poll(async () => Number(await page.getByRole('textbox', { name: 'Resistance' }).inputValue()))
    .toBeCloseTo(50, 0);
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => Number(new URL(page.url()).searchParams.get('r'))).toBeCloseTo(50, 0);
});
