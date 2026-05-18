import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(repoRoot, 'packages', 'kity-runtime', 'dist');
const editorCssPath = path.join(distDir, 'editor.css');
const requiredFiles = [
  'editor.css',
  'base.css',
  'ui.css',
  'scrollbar.css',
  'images/toolbar/btn.png',
  'images/toolbar/other.png',
];
const expectedLocalImports = ['./base.css', './ui.css', './scrollbar.css'];

function parseImportedUrls(content) {
  return [...content.matchAll(/@import\s+url\((['"]?)([^'")]+)\1\)/g)].map((match) => match[2]);
}

function assertFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required dist asset: ${path.relative(repoRoot, filePath)}`);
  }
}

for (const relativePath of requiredFiles) {
  assertFileExists(path.join(distDir, relativePath));
}

const editorCssContent = fs.readFileSync(editorCssPath, 'utf8');
const localCssImports = parseImportedUrls(editorCssContent).filter((specifier) => specifier.startsWith('./'));

for (const specifier of expectedLocalImports) {
  if (!localCssImports.includes(specifier)) {
    throw new Error(`dist/editor.css is missing required import: ${specifier}`);
  }
}

for (const specifier of localCssImports) {
  assertFileExists(path.join(distDir, specifier.slice(2)));
}

console.log('Verified kity-runtime dist assets.');
