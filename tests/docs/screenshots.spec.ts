import { expect, test } from '@playwright/test';

const calculation = '/?v=1&r=35&x=-22&z0=50&f=14.2MHz&vf=0.66&stub=shunt-short&solution=A';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'smith-match-preferences-v4',
      JSON.stringify({
        version: 4,
        theme: 'light',
        animationEnabled: false,
        firstUseDismissed: true,
      }),
    );
  });
  await page.goto(calculation);
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        caret-color: transparent !important;
        transition: none !important;
      }
    `,
  });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { name: 'Smith Match' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Solution A' })).toBeVisible();
});

test('capture desktop hero', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({
    path: 'docs/assets/smith-match-desktop.png',
    animations: 'disabled',
    scale: 'css',
  });
});

test('capture mobile chart and selected result', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo(0, 330));
  await expect(page.getByRole('heading', { name: 'Solution A' })).toBeInViewport();
  await page.screenshot({
    path: 'docs/assets/smith-match-mobile.png',
    animations: 'disabled',
    scale: 'css',
  });
});
