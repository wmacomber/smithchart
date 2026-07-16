import { expect, test } from '@playwright/test';

test('@workspace synchronizes impedance, admittance, and reflection entry', async ({ page }) => {
  await page.goto('/?v=1&r=35&x=-22&z0=50&f=14.2MHz&vf=.66&stub=shunt-short&solution=A');
  await expect(page.getByRole('heading', { name: 'Solution A' })).toBeVisible();

  await page.getByRole('radio', { name: 'Admittance', exact: true }).check();
  await page.getByRole('textbox', { name: 'Conductance' }).fill('0.02');
  await page.getByRole('textbox', { name: 'Conductance' }).press('Enter');
  await page.getByRole('textbox', { name: 'Susceptance' }).fill('0');
  await page.getByRole('textbox', { name: 'Susceptance' }).press('Enter');
  await expect.poll(() => Number(new URL(page.url()).searchParams.get('r'))).toBeCloseTo(50, 12);
  expect(Number(new URL(page.url()).searchParams.get('x'))).toBe(0);

  await page.getByRole('radio', { name: 'Reflection coefficient', exact: true }).check();
  await page.getByRole('textbox', { name: 'Magnitude' }).fill('0.5');
  await page.getByRole('textbox', { name: 'Magnitude' }).press('Enter');
  await expect.poll(() => Number(new URL(page.url()).searchParams.get('r'))).toBeCloseTo(150, 12);
  expect(Number(new URL(page.url()).searchParams.get('x'))).toBeCloseTo(0, 12);
});

test('@workspace invalid draft preserves committed calculation', async ({ page }) => {
  await page.goto('/?v=1&r=35&x=-22&z0=50&f=14.2MHz&vf=.66&stub=shunt-short&solution=A');
  const resistance = page.getByRole('textbox', { name: 'Resistance' });
  await resistance.fill('-');
  await resistance.blur();
  await expect(resistance).toHaveValue('-');
  await expect(resistance).toHaveAttribute('aria-invalid', 'true');
  await expect(page).toHaveURL(/r=35&x=-22/);
  await expect(page.getByRole('heading', { name: 'Solution A' })).toBeVisible();
  await resistance.focus();
  await resistance.press('Escape');
  await expect(resistance).toHaveValue('35');
});

test('@workspace Z0 changes reflection but preserves physical load', async ({ page }) => {
  await page.goto('/?v=1&r=35&x=-22&z0=50&f=14.2MHz&vf=.66&stub=shunt-short&solution=A');
  await page.getByRole('radio', { name: 'Reflection coefficient', exact: true }).check();
  const magnitude = page.getByRole('textbox', { name: 'Magnitude' });
  const before = await magnitude.inputValue();
  const z0 = page.getByRole('textbox', { name: 'Characteristic impedance' });
  await z0.fill('75');
  await z0.press('Enter');
  await expect(magnitude).not.toHaveValue(before);
  await expect(page).toHaveURL(/r=35&x=-22&z0=75/);
});

test('@workspace unit preferences stay outside URL and history', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Frequency unit').selectOption('GHz');
  await expect(page.getByRole('textbox', { name: 'Frequency' })).toHaveValue('0.0142');
  await page.getByLabel('Length unit').selectOption('in');
  await expect(
    page.getByRole('article').filter({ hasText: 'Solution A' }).locator('.construction'),
  ).toContainText('in');
  await expect(page).toHaveURL(/f=14.2MHz/);

  await page.getByRole('radio', { name: 'Admittance grid' }).check();
  await page
    .getByRole('article')
    .filter({ hasText: 'Solution B' })
    .getByRole('button', { name: 'Select' })
    .click();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('radio', { name: 'Admittance grid' })).toBeChecked();
  await expect(page).toHaveURL(/solution=A/);

  await page.reload();
  await expect(page.getByLabel('Frequency unit')).toHaveValue('GHz');
  await expect(page.getByLabel('Length unit')).toHaveValue('in');
  await expect(page.getByRole('textbox', { name: 'Frequency' })).toHaveValue('0.0142');
});
