import { expect, test } from '@playwright/test';

test('loads static application shell and assets', async ({ page, request }) => {
  const failedSameOriginRequests: string[] = [];

  page.on('requestfailed', (failedRequest) => {
    const requestUrl = new URL(failedRequest.url());
    if (requestUrl.origin === 'http://127.0.0.1:4173') {
      failedSameOriginRequests.push(failedRequest.url());
    }
  });

  const response = await page.goto('/');

  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle('Smith Match — Shunt Stub Instrument');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Project foundation ready' })).toBeVisible();

  const faviconHref = await page.locator('link[rel="icon"]').getAttribute('href');
  expect(faviconHref).toBeTruthy();

  const faviconResponse = await request.get(new URL(faviconHref!, page.url()).href);
  expect(faviconResponse.ok()).toBe(true);
  expect(failedSameOriginRequests).toEqual([]);
});
