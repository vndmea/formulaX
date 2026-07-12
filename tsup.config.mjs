import { defineConfig } from 'tsup';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const optionalEntries = ['index', 'standard', 'kity', 'image', 'canvg-runtime'].reduce((entries, name) => {
  const fileEntry = path.resolve(process.cwd(), 'src', `${name}.ts`);
  const directoryEntry = path.resolve(process.cwd(), 'src', name, 'index.ts');

  if (fs.existsSync(fileEntry)) {
    entries[name] = `src/${name}.ts`;
  } else if (fs.existsSync(directoryEntry)) {
    entries[name] = `src/${name}/index.ts`;
  }

  return entries;
}, {});

export default defineConfig({
  entry: optionalEntries,
  format: ['esm', 'cjs', 'iife'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
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
    '@formulaxjs/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
    '@formulaxjs/editor': path.resolve(__dirname, 'packages/editor/src/index.ts'),
    '@formulaxjs/editor/standard': path.resolve(__dirname, 'packages/editor/src/standard.ts'),
    '@formulaxjs/editor/kity': path.resolve(__dirname, 'packages/editor/src/kity.ts'),
    '@formulaxjs/renderer': path.resolve(__dirname, 'packages/renderer/src/index.ts'),
    '@formulaxjs/renderer/standard': path.resolve(__dirname, 'packages/renderer/src/standard/index.ts'),
    '@formulaxjs/renderer/kity': path.resolve(__dirname, 'packages/renderer/src/kity/index.ts'),
    '@formulaxjs/renderer/image': path.resolve(__dirname, 'packages/renderer/src/image/index.ts'),
    '@formulaxjs/runtime': path.resolve(__dirname, 'packages/runtime/src/index.ts'),
    '@formulaxjs/runtime-kity/canvg-runtime': path.resolve(__dirname, 'packages/runtime-kity/src/canvg-runtime.ts'),
    '@formulaxjs/runtime-kity': path.resolve(__dirname, 'packages/runtime-kity/src/index.ts'),
  },
});
