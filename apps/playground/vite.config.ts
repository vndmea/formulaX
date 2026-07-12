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
      '@formulaxjs/runtime-kity': path.resolve(rootDir, 'packages/runtime-kity/src/index.ts'),
      '@formulaxjs/renderer/standard': path.resolve(rootDir, 'packages/renderer/src/standard/index.ts'),
      '@formulaxjs/renderer/kity': path.resolve(rootDir, 'packages/renderer/src/kity/index.ts'),
      '@formulaxjs/renderer': path.resolve(rootDir, 'packages/renderer/src/index.ts'),
      '@formulaxjs/runtime': path.resolve(rootDir, 'packages/runtime/src/index.ts'),
    },
  },
});
