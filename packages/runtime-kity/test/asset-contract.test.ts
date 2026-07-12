import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stylesDir = path.join(packageRoot, 'public', 'assets', 'styles');
const editorCssPath = path.join(stylesDir, 'editor.css');
const expectedLocalImports = ['./base.css', './ui.css', './scrollbar.css'];

function parseImportedUrls(content: string) {
  return [...content.matchAll(/@import\s+url\((['"]?)([^'")]+)\1\)/g)].map((match) => match[2]);
}

describe('kity runtime style asset contract', () => {
  test('editor.css local imports resolve to real css files', () => {
    const content = fs.readFileSync(editorCssPath, 'utf8');
    const localCssImports = parseImportedUrls(content).filter((specifier) => specifier.startsWith('./'));

    expect(localCssImports).toEqual(expect.arrayContaining(expectedLocalImports));

    for (const specifier of localCssImports) {
      const targetPath = path.join(stylesDir, specifier.slice(2));
      expect(fs.existsSync(targetPath), `${specifier} should exist next to editor.css`).toBe(true);
    }
  });
});
