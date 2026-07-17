import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';

const base = process.env.BASE_PATH ?? '/';
if (!/^\/(?:[A-Za-z0-9._~-]+\/)*$/.test(base)) {
  throw new Error(`BASE_PATH must be an absolute path with a trailing "/": received "${base}"`);
}

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { readonly version: string };

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifest: false,
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{html,js,css,svg,ico,png,webp,woff2}'],
        runtimeCaching: [],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __E2E_TEST_HOOKS__: JSON.stringify(process.env.E2E_TEST_HOOKS === '1'),
  },
});
