import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './packages/editor/test/browser',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
  },
  webServer: {
    command: 'corepack pnpm --filter @formulax/playground dev --host 127.0.0.1 --port 4173',
    port: 4173,
    reuseExistingServer: true,
    timeout: 120000,
  },
});
