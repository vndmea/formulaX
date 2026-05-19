import path from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
  root: path.resolve(__dirname),
  resolve: {
    alias: {
      '@formulaxjs/core': path.resolve(__dirname, '../../core/src/index.ts'),
      '@formulaxjs/editor': path.resolve(__dirname, '../../editor/src/index.ts'),
      '@formulaxjs/kity-runtime': path.resolve(__dirname, '../../kity-runtime/src/index.ts'),
      '@formulaxjs/renderer': path.resolve(__dirname, '../../renderer/src/index.ts'),
      '@formulaxjs/renderer-kity': path.resolve(__dirname, '../src/index.ts'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 4173,
  },
});
