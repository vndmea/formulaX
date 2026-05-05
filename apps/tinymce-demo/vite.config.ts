import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

export default defineConfig({
  resolve: {
    alias: {
      '@formulax/core': path.resolve(rootDir, 'packages/core/src/index.ts'),
      '@formulax/editor': path.resolve(rootDir, 'packages/editor/src/index.ts'),
      '@formulax/kity-assets': path.resolve(rootDir, 'packages/kity-assets/src/index.ts'),
      '@formulax/kity-runtime': path.resolve(rootDir, 'packages/kity-runtime/src/index.ts'),
      '@formulax/tinymce': path.resolve(rootDir, 'packages/tinymce/src/index.ts'),
    },
  },
});
