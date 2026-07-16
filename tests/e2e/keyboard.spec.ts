import { expect, test } from '@playwright/test';
test('@keyboard load marker adjusts and commits', async ({ page }) => {
  await page.goto('/');
  const marker = page.getByRole('slider', { name: 'Load marker' });
  await marker.focus();
  await marker.press('ArrowRight');
  await marker.press('Enter');
  await expect(marker).toBeFocused();
  await expect(page).toHaveURL(/r=/);
});

test('@keyboard supports fine, coarse, cancel, and blur commit', async ({ page }) => {
  await page.goto('/?v=1&r=35&x=-22&z0=50&f=14.2MHz&vf=.66&stub=shunt-short&solution=A');
  await expect(page).toHaveURL(/vf=0.66/);
  const marker = page.getByRole('slider', { name: 'Load marker' });
  const initialUrl = page.url();
  const initialValue = await marker.getAttribute('aria-valuetext');

  await marker.focus();
  await marker.press('ArrowUp');
  await expect(marker).not.toHaveAttribute('aria-valuetext', initialValue!);
  expect(page.url()).toBe(initialUrl);
  await marker.press('Escape');
  await expect(marker).toHaveAttribute('aria-valuetext', initialValue!);
  expect(page.url()).toBe(initialUrl);

  await marker.press('Shift+ArrowRight');
  const coarseValue = await marker.getAttribute('aria-valuetext');
  expect(coarseValue).not.toBe(initialValue);
  await marker.press('Tab');
  await expect(page).not.toHaveURL(initialUrl);
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page).toHaveURL(/r=35&x=-22/);
});

test('@keyboard fine movement bypasses pointer snapping', async ({ page }) => {
  await page.goto('/?v=1&r=50&x=0&z0=50&f=14.2MHz&vf=.66&stub=shunt-short&solution=A');
  await page.getByText('Display and interaction', { exact: true }).click();
  await page.getByRole('checkbox', { name: /Snap pointer/ }).check();
  const marker = page.getByRole('slider', { name: 'Load marker' });
  await marker.focus();
  await marker.press('ArrowRight');
  await expect(marker).toHaveAttribute('aria-valuenow', '0.002');
  await marker.press('Enter');
});
