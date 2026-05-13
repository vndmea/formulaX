import { defineConfig } from 'tsup';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  dts: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  outName: 'index',
  globalName: 'FormulaX',
  minify: false,
  loader: {
    '.png': 'file',
    '.woff': 'file',
    '.css': 'file',
  },
  alias: {
    '@formulaxjs/kity-assets': path.resolve(__dirname, 'packages/kity-assets/src/index.ts'),
    '@formulaxjs/editor': path.resolve(__dirname, 'packages/editor/src/index.ts'),
    '@formulaxjs/renderer': path.resolve(__dirname, 'packages/renderer/src/index.ts'),
    '@formulaxjs/kity-runtime': path.resolve(__dirname, 'packages/kity-runtime/src/index.ts'),
  },
});
