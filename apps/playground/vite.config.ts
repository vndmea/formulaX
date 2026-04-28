import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: path.resolve(__dirname, '../../packages/kity-assets/public'),
  resolve: {
    alias: {
      '@formulax/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@formulax/editor': path.resolve(__dirname, '../../packages/editor/src/index.ts'),
      '@formulax/kity-runtime': path.resolve(__dirname, '../../packages/kity-runtime/src/index.ts'),
      '@formulax/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@formulax/renderer-katex': path.resolve(__dirname, '../../packages/renderer-katex/src/index.ts'),
      '@formulax/kity-adapter': path.resolve(__dirname, '../../packages/kity-adapter/src/index.ts'),
      '@formulax/kity-assets': path.resolve(__dirname, '../../packages/kity-assets'),
      '@formulax/kity-toolbar': path.resolve(__dirname, '../../packages/kity-toolbar/src/index.ts'),
      '@formulax/kity-vendor-editor': path.resolve(__dirname, '../../packages/kity-vendor-editor/src/index.ts'),
      '@formulax/kity-vendor-parser': path.resolve(__dirname, '../../packages/kity-vendor-parser/src/index.ts'),
      '@formulax/kity-vendor-render': path.resolve(__dirname, '../../packages/kity-vendor-render/src/index.ts'),
    },
  },
});
