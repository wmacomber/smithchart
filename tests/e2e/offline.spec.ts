import { expect, test } from '@playwright/test';

test('@offline reloads a visited calculation without network', async ({
  page,
  context,
  browserName,
}) => {
  const failedSameOrigin: string[] = [];
  page.on('requestfailed', (request) => {
    if (
      request.resourceType() !== 'document' &&
      new URL(request.url()).origin === new URL(page.url()).origin
    )
      failedSameOrigin.push(request.url());
  });

  await page.goto('./?v=1&r=42&x=-30&z0=75&f=10MHz&vf=.8&stub=shunt-short&solution=B');
  await expect(page.getByRole('heading', { name: 'Solution B' })).toBeVisible();
  await expect(page.locator('footer')).toContainText('Smith Match v1.0.0');
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const registration = await navigator.serviceWorker?.ready;
        return registration?.active?.state;
      }),
    )
    .toBe('activated');

  const calculationUrl = page.url();
  await context.setOffline(true);
  try {
    if (browserName === 'webkit') {
      await page.evaluate(() => setTimeout(() => location.reload(), 0));
      await page.waitForLoadState('load');
    } else {
      await page.goto(calculationUrl, { waitUntil: 'load' });
    }
    await expect(page.getByRole('heading', { name: 'Smith Match' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Solution B' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Characteristic impedance' })).toHaveValue('75');
    await expect(page.getByRole('textbox', { name: 'Frequency' })).toHaveValue('10');
    await expect(page.locator('.smith-chart')).toBeVisible();
    await expect(page).toHaveURL(/z0=75.*f=10MHz.*solution=B/);
    expect(failedSameOrigin).toEqual([]);
  } finally {
    await context.setOffline(false);
  }
});
