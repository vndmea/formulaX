import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@formulax/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@formulax/editor': path.resolve(__dirname, '../../packages/editor/src/index.ts'),
      '@formulax/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@formulax/renderer-katex': path.resolve(__dirname, '../../packages/renderer-katex/src/index.ts'),
    },
  },
});
