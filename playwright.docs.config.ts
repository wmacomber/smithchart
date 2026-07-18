import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/docs',
  outputDir: 'test-results/docs-screenshots',
  reporter: [['list']],
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    ...devices['Desktop Chrome'],
    deviceScaleFactor: 1,
    colorScheme: 'light',
  },
  webServer: {
    command: 'bun run build && bun run preview -- --host 127.0.0.1',
    port: 4173,
    reuseExistingServer: false,
  },
});
