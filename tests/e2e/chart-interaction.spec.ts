import { expect, test, type Page } from '@playwright/test';

async function dragMarker(page: Page, chartX: number, chartY: number, release = true) {
  const marker = page.getByRole('slider', { name: 'Load marker' });
  await marker.hover();
  const chartBox = await page.locator('.smith-chart').boundingBox();
  if (!chartBox) throw new Error('Chart has no bounding box.');
  const scale = Math.min(chartBox.width, chartBox.height) / 400;
  const targetX = chartBox.x + (chartBox.width - 400 * scale) / 2 + chartX * scale;
  const targetY = chartBox.y + (chartBox.height - 400 * scale) / 2 + chartY * scale;
  await page.mouse.down();
  await page.mouse.move(targetX, targetY, { steps: 4 });
  if (release) {
    await expect(marker).toHaveAttribute('data-active', 'true');
    await page.mouse.up();
    await expect(marker).not.toHaveAttribute('data-active', 'true');
  }
}

test('@interaction mouse preview synchronizes tooltip and fields, then commits once', async ({
  page,
}) => {
  await page.goto('/?v=1&r=35&x=-22&z0=50&f=14.2MHz&vf=.66&stub=shunt-short&solution=A');
  await expect(page).toHaveURL(/vf=0.66/);
  const initialUrl = page.url();
  await dragMarker(page, 200, 200, false);
  const resistance = page.getByRole('textbox', { name: 'Resistance' });
  const reactance = page.getByRole('textbox', { name: 'Reactance' });
  await expect.poll(async () => Number(await resistance.inputValue())).toBeCloseTo(50, 2);
  await expect.poll(async () => Number(await reactance.inputValue())).toBeCloseTo(0, 0);
  await expect(page.locator('.load-marker-tooltip')).toBeVisible();
  expect(page.url()).toBe(initialUrl);
  await page.mouse.up();
  await expect.poll(() => Number(new URL(page.url()).searchParams.get('r'))).toBeCloseTo(50, 2);
  await expect.poll(() => Number(new URL(page.url()).searchParams.get('x'))).toBeCloseTo(0, 0);
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page).toHaveURL(/r=35&x=-22/);
});

test('@interaction pointer capture commits release outside chart boundary', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/v=1/);
  const initialUrl = page.url();
  // Leave the 400-unit SVG without approaching the browser viewport edge in controls-first layout.
  await dragMarker(page, 450, 200);
  await expect(page.getByRole('slider', { name: 'Load marker' })).toHaveAttribute(
    'aria-valuenow',
    '1',
  );
  await expect.poll(() => page.url()).not.toBe(initialUrl);
  await expect
    .poll(() => {
      const search = new URL(page.url()).searchParams;
      return search.get('load') === 'open' ? 0 : Number(search.get('r'));
    })
    .toBeCloseTo(0, 2);
});

test('@interaction Escape cancels captured drag and ignores later pointer-up', async ({ page }) => {
  await page.goto('/?v=1&r=35&x=-22&z0=50&f=14.2MHz&vf=.66&stub=shunt-short&solution=A');
  await expect(page).toHaveURL(/vf=0.66/);
  const initialUrl = page.url();
  await dragMarker(page, 200, 200, false);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  expect(page.url()).toBe(initialUrl);
  await expect(page.getByRole('textbox', { name: 'Resistance' })).toHaveValue('35');
  await expect(page.locator('[id^="load-marker-status-"]')).toContainText('canceled');
});

test('@interaction optional pointer snapping quantizes reflection coordinates', async ({
  page,
}) => {
  await page.goto('/?v=1&r=35&x=-22&z0=50&f=14.2MHz&vf=.66&stub=shunt-short&solution=A');
  await page.getByText('Display and interaction', { exact: true }).click();
  await page.getByRole('checkbox', { name: /Snap pointer/ }).check();
  const marker = page.getByRole('slider', { name: 'Load marker' });
  await dragMarker(page, 200 + 0.311 * 184, 200 + 0.409 * 184, false);
  await expect(marker).toHaveAttribute('aria-valuenow', '0.5122');
  await page.mouse.up();
  await expect(marker).toHaveAttribute('aria-valuenow', '0.5122');
});
