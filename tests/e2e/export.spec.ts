import { expect, test } from '@playwright/test';

test('@export downloads sanitized standalone SVG with metadata', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('checkbox', { name: 'Compare both paths on chart' }).check();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export SVG' }).click();
  const svgDownload = await download;
  expect(svgDownload.suggestedFilename()).toBe('smith-match.svg');
  const stream = await svgDownload.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const content = Buffer.concat(chunks).toString('utf8');

  expect(content).toContain('xmlns="http://www.w3.org/2000/svg"');
  expect(content).toContain('width="800"');
  expect(content).toContain('height="800"');
  expect(content).toContain('<title id="smith-match-export-title">Smith Match chart</title>');
  expect(content).toContain('id="smith-match-metadata"');
  expect(content.match(/<style>/g)).toHaveLength(1);
  expect(content).toContain('.solution-selection-halo{fill:none');
  expect(content).toContain('solution-b');
  expect(content).toContain('marker-end="url(#');
  expect(content).not.toContain('foreignObject');
  expect(content).not.toContain('marker-hit-target');
  expect(content).not.toContain('data-export-chart');
  expect(content).not.toContain('data-layer');
  expect(content).not.toMatch(/\son[a-z]+=/i);
  expect(content).not.toMatch(/(?:href|xlink:href)=/i);

  const metadataText = content.match(/<metadata[^>]*>([\s\S]*?)<\/metadata>/)?.[1];
  expect(metadataText).toBeTruthy();
  const metadata = JSON.parse(metadataText!);
  expect(metadata).toMatchObject({
    schemaVersion: 1,
    application: { name: 'Smith Match', version: '1.0.0' },
    model: { kind: 'lossless-single-frequency-shunt-stub', termination: 'short' },
    chart: { displayMode: 'both', solutionView: 'overlay' },
    result: { status: 'solved', selectedSolution: 'A' },
  });
  expect(metadata.result.instructions).toHaveLength(2);
  expect(metadata.result.instructions[0]).toContain('Residual:');
  expect(metadata.result.instructions[1]).toContain('Solution B');
});

test('@export is disabled while a draft is stale', async ({ page }) => {
  await page.goto('/');
  const frequency = page.getByRole('textbox', { name: 'Frequency' });
  await frequency.fill('-');
  await frequency.blur();
  await expect(page.getByRole('button', { name: 'Export SVG' })).toBeDisabled();
});

test('print worksheet contains canonical solved calculation', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });

  const worksheet = page.getByRole('region', { name: 'Calculation worksheet' });
  await expect(worksheet).toBeVisible();
  await expect(worksheet).toContainText('Smith Match v1.0.0');
  await expect(worksheet).toContainText('35 − j22 Ω');
  await expect(worksheet).toContainText('14200000 Hz (14.200000 MHz)');
  await expect(worksheet.getByText('Solution A', { exact: true })).toBeVisible();
  await expect(worksheet.getByText('Solution B', { exact: true })).toBeVisible();
  await expect(page.locator('.smith-chart')).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(2);
  await expect(page.locator('.practical-warning')).toBeVisible();
  await expect(page.locator('.controls-panel')).toBeHidden();
  await expect(page.locator('.instrument-bar nav')).toBeHidden();
  await expect(page.getByRole('button')).toHaveCount(0);
});

test('print worksheet identifies stale and matched states truthfully', async ({ page }) => {
  await page.goto('/');
  const frequency = page.getByRole('textbox', { name: 'Frequency' });
  await frequency.fill('-');
  await frequency.blur();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.print-stale-warning')).toContainText(
    'last committed valid calculation',
  );

  await page.emulateMedia({ media: 'screen' });
  await page.goto('/?v=1&r=50&x=0&z0=50&f=14.2MHz&vf=.66&stub=shunt-short&solution=A');
  await page.emulateMedia({ media: 'print' });
  await expect(
    page
      .getByRole('region', { name: 'Calculation worksheet' })
      .getByText('matched', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('No matching stub is required')).toBeVisible();
  await expect(page.getByText('Selected solution')).toHaveCount(0);
  await expect(page.locator('.construction')).toHaveCount(0);
});
