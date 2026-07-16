import { expect, test } from '@playwright/test';
test('@export downloads standalone SVG', async ({ page }) => {
  await page.goto('/');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export SVG' }).click();
  const svgDownload = await download;
  expect(svgDownload.suggestedFilename()).toBe('smith-match.svg');
  const stream = await svgDownload.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const content = Buffer.concat(chunks).toString('utf8');
  expect(content).not.toContain('foreignObject');
  expect(content).not.toContain('marker-hit-target');
  expect(content).toContain('.solution-selection-halo{fill:none');
  expect(content).toContain('solution-b');
});

test('print worksheet retains input parameters', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('heading', { name: 'Transmission line' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Frequency' })).toBeVisible();
});
