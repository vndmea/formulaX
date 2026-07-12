import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '@formulaxjs/ckeditor5': path.resolve(rootDir, 'packages/ckeditor5/src/index.ts'),
      '@formulaxjs/core': path.resolve(rootDir, 'packages/core/src/index.ts'),
      '@formulaxjs/editor': path.resolve(rootDir, 'packages/editor/src/index.ts'),
      '@formulaxjs/runtime-kity/canvg-runtime': path.resolve(rootDir, 'packages/runtime-kity/src/canvg-runtime.ts'),
      '@formulaxjs/runtime-kity': path.resolve(rootDir, 'packages/runtime-kity/src/index.ts'),
      '@formulaxjs/renderer/image': path.resolve(rootDir, 'packages/renderer/src/image/index.ts'),
      '@formulaxjs/renderer/standard': path.resolve(rootDir, 'packages/renderer/src/standard/index.ts'),
      '@formulaxjs/renderer/kity': path.resolve(rootDir, 'packages/renderer/src/kity/index.ts'),
      '@formulaxjs/renderer': path.resolve(rootDir, 'packages/renderer/src/index.ts'),
      '@formulaxjs/runtime': path.resolve(rootDir, 'packages/runtime/src/index.ts'),
    },
  },
});
