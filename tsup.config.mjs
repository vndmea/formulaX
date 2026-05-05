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
    '@formulax/kity-assets': path.resolve(__dirname, 'packages/kity-assets/src/index.ts'),
    '@formulax/kity-runtime': path.resolve(__dirname, 'packages/kity-runtime/src/index.ts'),
  },
});
