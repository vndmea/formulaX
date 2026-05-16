import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@formulaxjs/core': fromRoot('./packages/core/src/index.ts'),
      '@formulaxjs/editor': fromRoot('./packages/editor/src/index.ts'),
      '@formulaxjs/renderer': fromRoot('./packages/renderer/src/index.ts'),
      '@formulaxjs/renderer-kity': fromRoot('./packages/renderer-kity/src/index.ts'),
      '@formulaxjs/tiptap': fromRoot('./packages/tiptap/src/index.ts'),
      '@formulaxjs/tinymce': fromRoot('./packages/tinymce/src/index.ts'),
      '@formulaxjs/kity-runtime': fromRoot('./packages/kity-runtime/src/index.ts'),
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
            'packages/renderer/test/**/*.test.ts',
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
            'packages/ckeditor5/test/**/*.test.ts',
            'packages/editor/test/**/*.test.ts',
            'packages/tinymce/test/**/*.test.ts',
          ],
          environment: 'jsdom',
        },
      },
    ],
  },
});
