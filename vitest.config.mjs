import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/*/test/**/*.test.ts'],
    environmentMatchGlobs: [['packages/editor/test/**/*.test.ts', 'jsdom']],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
