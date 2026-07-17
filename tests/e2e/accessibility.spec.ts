import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function expectNoWcagViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
}

for (const state of [
  {
    name: 'default solved state',
    prepare: async (page: import('@playwright/test').Page) => page.goto('/'),
  },
  {
    name: 'invalid numeric draft',
    prepare: async (page: import('@playwright/test').Page) => {
      await page.goto('/');
      await page.getByRole('textbox', { name: 'Resistance' }).fill('-');
    },
  },
  {
    name: 'matched state',
    prepare: async (page: import('@playwright/test').Page) =>
      page.goto('/?v=1&r=50&x=0&z0=50&f=14.2MHz&vf=.66&stub=shunt-short&solution=A'),
  },
  {
    name: 'no passive solution state',
    prepare: async (page: import('@playwright/test').Page) =>
      page.goto('/?v=1&r=-10&x=5&z0=50&f=14.2MHz&vf=.66&stub=shunt-short&solution=A'),
  },
  {
    name: 'Learn dialog',
    prepare: async (page: import('@playwright/test').Page) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Learn' }).click();
    },
  },
  {
    name: 'Examples dialog',
    prepare: async (page: import('@playwright/test').Page) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Examples' }).click();
    },
  },
  {
    name: 'dark theme and expanded chart summary',
    prepare: async (page: import('@playwright/test').Page) => {
      await page.goto('/');
      await page.getByText('Display and interaction', { exact: true }).click();
      await page.getByLabel('Theme').selectOption('dark');
      await page.getByText('Chart summary', { exact: true }).click();
    },
  },
] as const) {
  test(`@a11y ${state.name} has no WCAG violations`, async ({ page }) => {
    await state.prepare(page);
    await expectNoWcagViolations(page);
  });
}

test('@a11y associates numeric errors and exposes native mode semantics', async ({ page }) => {
  await page.goto('/');
  const resistance = page.getByRole('textbox', { name: 'Resistance' });
  await resistance.fill('-');
  const errorId = await resistance.getAttribute('aria-errormessage');
  expect(errorId).toBeTruthy();
  await expect(page.locator(`#${errorId}`)).toContainText('Finish entering');
  await expect(resistance).toHaveAttribute('aria-describedby', new RegExp(errorId!));
  await expect(page.getByRole('radio', { name: 'Impedance', exact: true })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Short' })).toBeChecked();
});

test('@a11y announces numeric units and unit changes once', async ({ page }) => {
  await page.goto('/');
  const frequency = page.getByRole('textbox', { name: 'Frequency' });
  const describedBy = await frequency.getAttribute('aria-describedby');
  expect(describedBy).toBeTruthy();
  await expect(page.locator(`#${describedBy!.split(' ')[0]}`)).toContainText('megahertz');
  await page.getByRole('combobox', { name: 'Frequency unit' }).selectOption('GHz');
  await expect(page.locator('[data-app-status]')).toHaveText('Frequency unit changed to GHz.');
  await expect(frequency).toHaveValue('0.0142');
});

test('@a11y skip link moves focus to workspace', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to matching workspace' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.locator('#workspace')).toBeFocused();
});

test('@a11y load marker exposes stable name, instructions, and live value', async ({ page }) => {
  await page.goto('/');
  const marker = page.getByRole('slider', { name: 'Load marker' });
  await expect(marker).toHaveAttribute('aria-describedby', /load-marker-instructions/);
  await expect(marker).toHaveAttribute('aria-valuetext', /resistance.*reflection magnitude/i);
  await marker.focus();
  await marker.press('ArrowRight');
  await expect(marker).toHaveCSS('outline-style', 'solid');
  await expect(marker).toHaveCSS('outline-width', '3px');
  await expect(page.locator('.load-marker-tooltip')).toBeVisible();
  await marker.press('Escape');
  await expect(page.locator('[id^="load-marker-status-"]')).toContainText('canceled');
});

test('@a11y matching view has textual and non-color equivalents', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#chart-description')).toContainText('Solution A');
  await expect(page.locator('#chart-description')).toContainText('Solution B');
  await expect(page.getByLabel('Matching path legend')).toContainText('Toward generator');
  await expect(page.getByText('Stop at the selected g = 1 stub junction.')).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Compare both paths on chart' }),
  ).not.toBeChecked();
  await expect(page.locator('.smith-chart')).toHaveAttribute('role', 'img');
  await expect(page.locator('.smith-chart')).not.toContainText('foreignObject');
  await expect(page.locator('.smith-chart foreignObject')).toHaveCount(0);
});
