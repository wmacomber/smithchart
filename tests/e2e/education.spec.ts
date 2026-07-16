import { expect, test } from '@playwright/test';

test('@education first-use prompt, dismissal, and restart persist correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('New to this workflow?')).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByText('New to this workflow?')).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('smith-match-preferences-v4') ?? ''))
    .toContain('firstUseDismissed');
  await page.reload();
  await expect(page.getByText('New to this workflow?')).toBeHidden();
  await page.getByRole('button', { name: 'Learn' }).click();
  await page.getByRole('button', { name: 'Restart guided tour' }).click();
  await expect(page.getByText('Step 1 of 4')).toBeVisible();
});

test('@education guided tour supports back, next, and finish', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Take guided tour' }).click();
  await expect(page.getByText('Set the load', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Follow the path', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByText('Set the load', { exact: true })).toBeVisible();
  for (let step = 0; step < 3; step += 1) await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.locator('.guided-tour')).toBeHidden();
});

test('@education examples show context before explicit application', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Examples' }).click();
  const dialog = page.getByRole('dialog', { name: 'Examples' });
  await expect(
    dialog.getByText('See normalization in a non-50-ohm reference system.'),
  ).toBeVisible();
  await dialog
    .getByRole('article')
    .filter({ hasText: '75 Ω system' })
    .getByRole('button', { name: 'Load example' })
    .click();
  await expect(page).toHaveURL(/z0=75/);
  await expect(page.getByRole('textbox', { name: /Characteristic impedance/ })).toHaveValue('75');
});

test('@education learn topics show typed chart explanations without URL drift', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\?v=1/);
  const originalUrl = page.url();
  await page.getByRole('button', { name: 'Learn' }).click();
  const dialog = page.getByRole('dialog', { name: 'Learn the match' });
  await expect(dialog.getByText('Why shunt matching uses admittance')).toBeVisible();
  const topic = dialog
    .locator('.learn-category > details')
    .filter({ hasText: 'Moving toward the generator' });
  await topic.getByText('Moving toward the generator', { exact: true }).click();
  await topic.getByRole('button', { name: 'Show this on the chart' }).click();
  await expect(page.locator('[data-education-target="feedline-rotation"]')).toBeVisible();
  await expect(page.locator('[data-education-chart]')).toBeFocused();
  expect(page.url()).toBe(originalUrl);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-education-target]')).toHaveCount(0);
});

test('@education contextual help works with focus, click, and Escape', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Help: Velocity factor' });
  await trigger.focus();
  await expect(page.getByRole('tooltip')).toContainText('manufacturer data');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
});

test('@education every Learn topic maps to a chart target', async ({ page }) => {
  const topics = [
    ['What the Smith chart shows', 'chart-overview'],
    ['Normalized impedance', 'normalization'],
    ['Reflection coefficient (Γ)', 'reflection'],
    ['Moving toward the generator', 'feedline-rotation'],
    ['Why shunt matching uses admittance', 'unit-conductance'],
    ['Open and short stubs', 'stub-path'],
    ['Electrical length', 'electrical-length'],
    ['Electrical versus physical length', 'physical-length'],
    ['Velocity factor', 'velocity-factor'],
    ['Why trimming is required', 'stub-path'],
    ['Model assumptions and limits', 'matched-center'],
  ] as const;
  await page.goto('/');
  for (const [title, target] of topics) {
    await page.getByRole('button', { name: 'Learn', exact: true }).click();
    const topic = page.locator('.learn-category > details').filter({ hasText: title });
    await topic.getByText(title, { exact: true }).click();
    await topic.getByRole('button', { name: 'Show this on the chart' }).click();
    await expect(page.locator(`[data-education-target="${target}"]`)).toBeVisible();
    await page.getByRole('button', { name: 'Clear chart explanation' }).click();
  }
});
