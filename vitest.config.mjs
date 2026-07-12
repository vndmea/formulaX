import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@formulaxjs/core': fromRoot('./packages/core/src/index.ts'),
      '@formulaxjs/editor': fromRoot('./packages/editor/src/index.ts'),
      '@formulaxjs/runtime-kity/canvg-runtime': fromRoot('./packages/runtime-kity/src/canvg-runtime.ts'),
      '@formulaxjs/renderer/image': fromRoot('./packages/renderer/src/image/index.ts'),
      '@formulaxjs/renderer/kity': fromRoot('./packages/renderer/src/kity/index.ts'),
      '@formulaxjs/renderer/standard': fromRoot('./packages/renderer/src/standard/index.ts'),
      '@formulaxjs/renderer': fromRoot('./packages/renderer/src/index.ts'),
      '@formulaxjs/runtime': fromRoot('./packages/runtime/src/index.ts'),
      '@formulaxjs/tiptap': fromRoot('./packages/tiptap/src/index.ts'),
      '@formulaxjs/tinymce': fromRoot('./packages/tinymce/src/index.ts'),
      '@formulaxjs/runtime-kity': fromRoot('./packages/runtime-kity/src/index.ts'),
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
            'packages/runtime-kity/test/**/*.test.ts',
            'packages/renderer/test/**/*.test.ts',
            'packages/renderer/test/image/**/*.test.ts',
            'packages/runtime/test/**/*.test.ts',
            'packages/tiptap/test/**/*.test.ts',
          ],
          exclude: [
            'packages/runtime/test/**/*.dom.test.ts',
            'packages/renderer/test/standard/**/*.dom.test.ts',
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
            'packages/runtime/test/**/*.dom.test.ts',
            'packages/renderer/test/standard/**/*.dom.test.ts',
            'packages/tinymce/test/**/*.test.ts',
          ],
          environment: 'jsdom',
        },
      },
    ],
  },
});
