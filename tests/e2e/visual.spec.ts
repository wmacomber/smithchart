import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium');
  await page.goto('/');
});

async function setChartMode(page: import('@playwright/test').Page, mode: 'Z' | 'Y' | 'Both') {
  const accessibleName =
    mode === 'Z' ? 'Impedance grid' : mode === 'Y' ? 'Admittance grid' : 'Both';
  await page
    .getByRole('group', { name: 'Chart grid' })
    .getByRole('radio', { name: accessibleName, exact: true })
    .check();
}

async function setTheme(page: import('@playwright/test').Page, theme: 'light' | 'dark') {
  await page.getByText('Display and interaction', { exact: true }).click();
  await page.getByLabel('Theme').selectOption(theme);
}

async function forceChartWidth(page: import('@playwright/test').Page, width: number) {
  await page.addStyleTag({ content: `.smith-chart{width:${width}px!important}` });
}

test('@visual instrument shell', async ({ page }) => {
  await expect(page).toHaveScreenshot('instrument-desktop.png', {
    fullPage: true,
    animations: 'disabled',
  });
});

test('@visual dense light impedance chart', async ({ page }) => {
  await setTheme(page, 'light');
  await setChartMode(page, 'Z');
  await expect(page.locator('.smith-chart')).toHaveAttribute('data-density', 'dense');
  await expect(page.locator('.smith-chart')).toHaveScreenshot('chart-dense-light-impedance.png', {
    animations: 'disabled',
  });
});

test('@visual dense dark admittance chart', async ({ page }) => {
  await setTheme(page, 'dark');
  await setChartMode(page, 'Y');
  await expect(page.locator('.smith-chart')).toHaveAttribute('data-density', 'dense');
  await expect(page.locator('.smith-chart')).toHaveScreenshot('chart-dense-dark-admittance.png', {
    animations: 'disabled',
  });
});

test('@visual regular dark combined chart', async ({ page }) => {
  await setTheme(page, 'dark');
  await setChartMode(page, 'Both');
  await forceChartWidth(page, 520);
  await expect(page.locator('.smith-chart')).toHaveAttribute('data-density', 'regular');
  await expect(page.locator('.smith-chart')).toHaveScreenshot('chart-regular-dark-combined.png', {
    animations: 'disabled',
  });
});

test('@visual compact light combined chart', async ({ page }) => {
  await setTheme(page, 'light');
  await setChartMode(page, 'Both');
  await forceChartWidth(page, 350);
  await expect(page.locator('.smith-chart')).toHaveAttribute('data-density', 'compact');
  await expect(page.locator('.smith-chart')).toHaveScreenshot('chart-compact-light-combined.png', {
    animations: 'disabled',
  });
});

test('@visual monochrome print chart', async ({ page }) => {
  await setChartMode(page, 'Both');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.smith-chart')).toHaveScreenshot('chart-print-monochrome.png', {
    animations: 'disabled',
  });
});
