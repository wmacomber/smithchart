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

test('@visual print worksheet', async ({ page }) => {
  await page.emulateMedia({ media: 'print' });
  await expect(page).toHaveScreenshot('print-worksheet.png', {
    fullPage: true,
    animations: 'disabled',
  });
});

test('@visual both-solution matching overlay', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Compare both paths on chart' }).check();
  await expect(page.locator('.smith-chart-frame')).toHaveScreenshot('matching-overlay-light.png', {
    animations: 'disabled',
  });
});

test('@visual solution B selected', async ({ page }) => {
  await page
    .getByRole('article')
    .filter({ hasText: 'Solution B' })
    .getByRole('button', { name: 'Select' })
    .click();
  await expect(page.locator('.smith-chart-frame')).toHaveScreenshot('matching-solution-b.png', {
    animations: 'disabled',
  });
});

test('@visual open-stub comparison', async ({ page }) => {
  await page.getByRole('radio', { name: 'Open' }).check();
  await page.getByRole('checkbox', { name: 'Compare both paths on chart' }).check();
  await expect(page.locator('.smith-chart-frame')).toHaveScreenshot('matching-open-overlay.png', {
    animations: 'disabled',
  });
});

test('@visual already-matched state', async ({ page }) => {
  await page.goto('/?v=1&r=50&x=0&z0=50&f=14.2MHz&vf=.66&stub=shunt-short&solution=A');
  await expect(page.locator('.smith-chart-frame')).toHaveScreenshot(
    'matching-already-matched.png',
    {
      animations: 'disabled',
    },
  );
});

test('@visual reduced-motion final frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('.smith-chart-frame')).toHaveScreenshot('matching-reduced-motion.png', {
    animations: 'disabled',
  });
});

test('@visual mobile matching cards', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page).toHaveScreenshot('matching-mobile.png', {
    fullPage: true,
    animations: 'disabled',
  });
});

test('@visual forced-color matching identities', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.getByRole('checkbox', { name: 'Compare both paths on chart' }).check();
  await expect(page.locator('.smith-chart-frame')).toHaveScreenshot('matching-forced-colors.png', {
    animations: 'disabled',
  });
});

test('@visual desktop Learn dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Learn' }).click();
  await expect(page.getByRole('dialog', { name: 'Learn the match' })).toHaveScreenshot(
    'education-learn-desktop.png',
    { animations: 'disabled' },
  );
});

test('@visual mobile onboarding prompt', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.first-use-prompt')).toHaveScreenshot(
    'education-onboarding-mobile.png',
    { animations: 'disabled' },
  );
});

test('@visual chart education highlight', async ({ page }) => {
  await page.getByRole('button', { name: 'Learn' }).click();
  const topic = page
    .locator('.learn-category > details')
    .filter({ hasText: 'Moving toward the generator' });
  await topic.getByText('Moving toward the generator', { exact: true }).click();
  await topic.getByRole('button', { name: 'Show this on the chart' }).click();
  await expect(page.locator('.smith-chart-frame')).toHaveScreenshot(
    'education-chart-highlight.png',
    { animations: 'disabled' },
  );
});

test('@visual responsive advanced panel', async ({ page }) => {
  await page.getByText('Advanced RF details', { exact: true }).click();
  await expect(page.locator('.advanced-results')).toHaveScreenshot(
    'education-advanced-results.png',
    { animations: 'disabled' },
  );
});
