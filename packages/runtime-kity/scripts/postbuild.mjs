import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const distDir = path.join(packageRoot, 'dist');
const stylesDir = path.join(packageRoot, 'public', 'assets', 'styles');
const imagesDir = path.join(packageRoot, 'public', 'assets', 'images');

const supportStyleFiles = ['base.css', 'ui.css', 'scrollbar.css'];

function rewriteCssAssetPaths(content) {
  return content
    .replaceAll('../images/', './images/')
    .replaceAll('../../assets/images/', './images/');
}

fs.cpSync(imagesDir, path.join(distDir, 'images'), { recursive: true });

for (const fileName of supportStyleFiles) {
  const sourcePath = path.join(stylesDir, fileName);
  const targetPath = path.join(distDir, fileName);
  const content = fs.readFileSync(sourcePath, 'utf8');

  fs.writeFileSync(targetPath, rewriteCssAssetPaths(content), 'utf8');
}
