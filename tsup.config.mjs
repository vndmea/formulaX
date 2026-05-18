import { defineConfig } from 'tsup';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  outName: 'index',
  globalName: 'FormulaX',
  minify: false,
  loader: {
    '.png': 'copy',
    '.woff': 'copy',
    '.css': 'copy',
  },
  esbuildOptions(options) {
    options.assetNames = '[name]';
  },
  alias: {
    '@formulaxjs/editor': path.resolve(__dirname, 'packages/editor/src/index.ts'),
    '@formulaxjs/renderer': path.resolve(__dirname, 'packages/renderer/src/index.ts'),
    '@formulaxjs/renderer-image': path.resolve(__dirname, 'packages/renderer-image/src/index.ts'),
    '@formulaxjs/renderer-kity': path.resolve(__dirname, 'packages/renderer-kity/src/index.ts'),
    '@formulaxjs/kity-runtime': path.resolve(__dirname, 'packages/kity-runtime/src/index.ts'),
  },
});
