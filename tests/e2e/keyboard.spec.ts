import { expect, test } from '@playwright/test';
test('@keyboard load marker adjusts and commits', async ({ page }) => {
  await page.goto('/');
  const marker = page.getByRole('slider', { name: /Load reflection coefficient/ });
  await marker.focus();
  await marker.press('ArrowRight');
  await marker.press('Enter');
  await expect(marker).toBeFocused();
  await expect(page).toHaveURL(/r=/);
});
