import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    __smithMetrics: { lcp: number; cls: number; longTasks: number[] };
  }
}

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium');
  await page.addInitScript(() => {
    window.__smithMetrics = { lcp: 0, cls: 0, longTasks: [] };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__smithMetrics.lcp = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<
        PerformanceEntry & { hadRecentInput?: boolean; value?: number }
      >) {
        if (!entry.hadRecentInput) window.__smithMetrics.cls += entry.value ?? 0;
      }
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      window.__smithMetrics.longTasks.push(...list.getEntries().map((entry) => entry.duration));
    }).observe({ type: 'longtask', buffered: true });
  });
});

test('@performance meets rendering and interaction budgets', async ({ page }) => {
  const samples: number[] = [];
  for (let index = 0; index < 3; index += 1) {
    await page.goto('/');
    await page.waitForTimeout(500);
    samples.push(await page.evaluate(() => window.__smithMetrics.lcp));
  }
  samples.sort((left, right) => left - right);
  expect(samples[1]).toBeLessThanOrEqual(2500);
  expect(await page.evaluate(() => window.__smithMetrics.cls)).toBeLessThanOrEqual(0.1);

  await page.evaluate(() => {
    window.__smithMetrics.longTasks = [];
  });
  const marker = page.getByRole('slider', { name: 'Load marker' });
  await marker.focus();
  for (let index = 0; index < 10; index += 1) await marker.press('ArrowRight');
  await marker.press('Escape');
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.__smithMetrics.longTasks)).toEqual([]);
});
