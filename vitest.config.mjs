import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@formulax/core': fromRoot('./packages/core/src/index.ts'),
      '@formulax/editor': fromRoot('./packages/editor/src/index.ts'),
      '@formulax/renderer-katex': fromRoot('./packages/renderer-katex/src/index.ts'),
      '@formulax/tiptap': fromRoot('./packages/tiptap/src/index.ts'),
      '@formulax/tinymce': fromRoot('./packages/tinymce/src/index.ts'),
      '@formulax/ui': fromRoot('./packages/ui/src/index.ts'),
      '@formulax/kity-adapter': fromRoot('./packages/kity-adapter/src/index.ts'),
      '@formulax/kity-toolbar': fromRoot('./packages/kity-toolbar/src/index.ts'),
      '@formulax/kity-vendor-editor': fromRoot('./packages/kity-vendor-editor/src/index.ts'),
      '@formulax/kity-vendor-parser': fromRoot('./packages/kity-vendor-parser/src/index.ts'),
      '@formulax/kity-vendor-render': fromRoot('./packages/kity-vendor-render/src/index.ts'),
    },
  },
  test: {
    include: ['packages/*/test/**/*.test.ts'],
    environmentMatchGlobs: [['packages/editor/test/**/*.test.ts', 'jsdom']],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
