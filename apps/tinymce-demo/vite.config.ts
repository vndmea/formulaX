import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

export default defineConfig({
  resolve: {
    alias: {
      '@formulaxjs/core': path.resolve(rootDir, 'packages/core/src/index.ts'),
      '@formulaxjs/editor': path.resolve(rootDir, 'packages/editor/src/index.ts'),
      '@formulaxjs/kity-assets': path.resolve(rootDir, 'packages/kity-assets/src/index.ts'),
      '@formulaxjs/kity-runtime': path.resolve(rootDir, 'packages/kity-runtime/src/index.ts'),
      '@formulaxjs/renderer': path.resolve(rootDir, 'packages/renderer/src/index.ts'),
      '@formulaxjs/tinymce': path.resolve(rootDir, 'packages/tinymce/src/index.ts'),
    },
  },
});
