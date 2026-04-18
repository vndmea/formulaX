import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: false,
    sourcemap: true,
    clean: true,
  },
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    dts: false,
    sourcemap: true,
    clean: false,
    outDir: 'dist/browser',
    globalName: 'FormulaX',
    minify: true,
  },
]);
