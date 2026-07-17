import { defineConfig, devices } from '@playwright/test';

for (const key of ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY']) {
  if (process.env[key] === '') delete process.env[key];
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['html', { open: 'never' }], ['list']],
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: {
    command: 'E2E_TEST_HOOKS=1 bun run build && bun run preview -- --host 127.0.0.1',
    port: 4173,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: [/mobile\.spec\.ts/, /touch\.spec\.ts/],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: [/mobile\.spec\.ts/, /touch\.spec\.ts/],
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testIgnore: [/mobile\.spec\.ts/, /touch\.spec\.ts/],
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chromium',
      testMatch: [
        /mobile\.spec\.ts/,
        /touch\.spec\.ts/,
        /accessibility\.spec\.ts/,
        /browsers\.spec\.ts/,
      ],
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-webkit',
      testMatch: [
        /mobile\.spec\.ts/,
        /touch\.spec\.ts/,
        /accessibility\.spec\.ts/,
        /browsers\.spec\.ts/,
      ],
      use: { ...devices['iPhone 13'] },
    },
  ],
});
