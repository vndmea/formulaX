import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: path.resolve(__dirname, '../../packages/kity-assets/public'),
  resolve: {
    alias: {
      '@formulax/kity-runtime': path.resolve(__dirname, '../../packages/kity-runtime/src/index.ts'),
      '@formulax/kity-assets/styles': path.resolve(__dirname, '../../packages/kity-assets/public/assets/styles'),
    },
  },
});
