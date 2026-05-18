import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmCommand = process.platform === 'win32' ? 'npm' : 'npm';

const packageExpectations = [
  {
    dir: 'packages/kity-runtime',
    files: [
      'dist/editor.css',
      'dist/base.css',
      'dist/ui.css',
      'dist/scrollbar.css',
      'dist/images/toolbar/btn.png',
      'dist/images/toolbar/other.png',
    ],
  },
  {
    dir: 'packages/tiptap',
    files: [
      'dist/base.css',
      'dist/ui.css',
      'dist/scrollbar.css',
      'dist/images/toolbar/btn.png',
      'dist/images/toolbar/other.png',
    ],
  },
  {
    dir: 'packages/ckeditor5',
    files: [
      'dist/base.css',
      'dist/ui.css',
      'dist/scrollbar.css',
      'dist/images/toolbar/btn.png',
      'dist/images/toolbar/other.png',
    ],
  },
  {
    dir: 'packages/tinymce',
    files: [
      'dist/base.css',
      'dist/ui.css',
      'dist/scrollbar.css',
      'dist/images/toolbar/btn.png',
      'dist/images/toolbar/other.png',
    ],
  },
];

function readPackFileList(packageDir) {
  const output = execSync(`${npmCommand} pack --dry-run --json`, {
    cwd: path.join(repoRoot, packageDir),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const parsed = JSON.parse(output);
  const entry = Array.isArray(parsed) ? parsed[0] : parsed;

  if (!entry || !Array.isArray(entry.files)) {
    throw new Error(`Unexpected npm pack output for ${packageDir}`);
  }

  return new Set(entry.files.map((file) => file.path));
}

for (const { dir, files } of packageExpectations) {
  const publishedFiles = readPackFileList(dir);
  const missingFiles = files.filter((file) => !publishedFiles.has(file));

  if (missingFiles.length > 0) {
    throw new Error(
      `${dir} is missing publish assets:\n${missingFiles.map((file) => `- ${file}`).join('\n')}`,
    );
  }
}

console.log('Verified publish asset contents for kity runtime adapters.');
