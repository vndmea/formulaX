import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: ['runtime.spec.ts'],
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:4274',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'corepack pnpm exec vite --config test/vite.config.ts --host 127.0.0.1 --port 4274',
    url: 'http://127.0.0.1:4274',
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
