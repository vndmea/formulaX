import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@formulax/core': fromRoot('./packages/core/src/index.ts'),
      '@formulax/editor': fromRoot('./packages/editor/src/index.ts'),
      '@formulax/kity-assets': fromRoot('./packages/kity-assets/src/index.ts'),
      '@formulax/renderer-katex': fromRoot('./packages/renderer-katex/src/index.ts'),
      '@formulax/tiptap': fromRoot('./packages/tiptap/src/index.ts'),
      '@formulax/tinymce': fromRoot('./packages/tinymce/src/index.ts'),
      '@formulax/kity-runtime': fromRoot('./packages/kity-runtime/src/index.ts'),
    },
  },
  test: {
    coverage: {
      reporter: ['text', 'html'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          include: [
            'packages/core/test/**/*.test.ts',
            'packages/renderer-katex/test/**/*.test.ts',
            'packages/tiptap/test/**/*.test.ts',
          ],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'jsdom',
          include: [
            'packages/editor/test/**/*.test.ts',
            'packages/tinymce/test/**/*.test.ts',
          ],
          environment: 'jsdom',
        },
      },
    ],
  },
});
