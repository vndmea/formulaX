import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function listWorkspacePackages() {
  const packagesDir = path.join(repoRoot, 'packages');

  return fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(packagesDir, entry.name, 'package.json'))
    .filter((filePath) => fs.existsSync(filePath));
}

function readPackFileList(packageDir) {
  const output = execSync('npm pack --dry-run --json', {
    cwd: packageDir,
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

const errors = [];

for (const packageJsonPath of listWorkspacePackages()) {
  const packageDir = path.dirname(packageJsonPath);
  const manifest = readJson(packageJsonPath);

  if (manifest.private === true) {
    continue;
  }

  if (typeof manifest.name !== 'string' || !manifest.name.startsWith('@formulaxjs/')) {
    continue;
  }

  if (typeof manifest.unpkg !== 'string' || manifest.unpkg.length === 0) {
    continue;
  }

  const publishedFiles = readPackFileList(packageDir);
  const normalizedUnpkgPath = manifest.unpkg.replace(/^\.\//, '');

  if (!publishedFiles.has(normalizedUnpkgPath)) {
    errors.push({
      name: manifest.name,
      unpkg: manifest.unpkg,
      missingPath: normalizedUnpkgPath,
    });
  }
}

if (errors.length > 0) {
  console.error('Missing published unpkg files:');
  for (const error of errors) {
    console.error(`- ${error.name}`);
    console.error(`  unpkg: ${error.unpkg}`);
    console.error(`  missing: ${error.missingPath}`);
  }
  process.exit(1);
}

console.log('Verified published unpkg files.');
