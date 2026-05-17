import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');
const packagesDir = path.join(rootDir, 'packages');
const reportDir = path.join(rootDir, '.reports');

export const DEFAULT_SCOPE = '@formulaxjs';
export const DEFAULT_REGISTRY_BASE_URL = 'https://registry.npmjs.org';
export const DEFAULT_DEPRECATION_MESSAGE =
  'This package has been removed from the FormulaX monorepo and is no longer maintained. Please migrate to a supported @formulaxjs package.';

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function getWorkspacePackages() {
  const packages = [];

  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageJsonPath = path.join(packagesDir, entry.name, 'package.json');

    try {
      const pkg = readJson(packageJsonPath);
      if (typeof pkg.name === 'string') {
        packages.push({
          dirName: entry.name,
          name: pkg.name,
          packageJsonPath,
          version: pkg.version ?? null,
        });
      }
    } catch {
      // Ignore directories without package.json files.
    }
  }

  return packages.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getRegistryScopedPackageNames(scope = DEFAULT_SCOPE) {
  const names = new Set();
  let from = 0;
  const size = 50;
  const searchText = `${scope}/`;

  while (true) {
    const searchUrl = new URL('/-/v1/search', DEFAULT_REGISTRY_BASE_URL);
    searchUrl.searchParams.set('text', searchText);
    searchUrl.searchParams.set('size', String(size));
    searchUrl.searchParams.set('from', String(from));

    const payload = await fetchJson(searchUrl);
    const objects = Array.isArray(payload.objects) ? payload.objects : [];
    const countBeforePage = names.size;

    for (const entry of objects) {
      const packageName = entry?.package?.name;
      if (typeof packageName === 'string' && packageName.startsWith(`${scope}/`)) {
        names.add(packageName);
      }
    }

    if (objects.length < size || names.size === countBeforePage) {
      break;
    }

    from += size;
  }

  return [...names].sort((a, b) => a.localeCompare(b));
}

export async function getRegistryPackageSnapshot(packageName) {
  const packageUrl = `${DEFAULT_REGISTRY_BASE_URL}/${encodeURIComponent(packageName)}`;
  const packument = await fetchJson(packageUrl);
  const latestVersion = packument?.['dist-tags']?.latest ?? null;
  const latestManifest = latestVersion ? packument?.versions?.[latestVersion] ?? null : null;
  const deprecatedMessage =
    typeof latestManifest?.deprecated === 'string' ? latestManifest.deprecated.trim() : '';

  return {
    packageName,
    latestVersion,
    deprecatedMessage,
    isDeprecated: deprecatedMessage.length > 0,
  };
}

export function buildDeprecationCommand(packageName, message = DEFAULT_DEPRECATION_MESSAGE) {
  return `npm deprecate "${packageName}@*" "${message}"`;
}

function getRecommendedAction({ localExists, isDeprecated }) {
  if (localExists) {
    return 'Keep published; package still exists in the monorepo.';
  }

  if (isDeprecated) {
    return 'No immediate action; orphan package is already deprecated on npm.';
  }

  return 'Deprecate on npm with a migration notice because the package no longer exists in the monorepo.';
}

export async function collectNpmOrphanReport({
  scope = DEFAULT_SCOPE,
  deprecationMessage = DEFAULT_DEPRECATION_MESSAGE,
} = {}) {
  const workspacePackages = getWorkspacePackages();
  const workspacePackageNames = new Set(workspacePackages.map((pkg) => pkg.name));
  const registryPackageNames = await getRegistryScopedPackageNames(scope);

  const entries = [];

  for (const packageName of registryPackageNames) {
    const registrySnapshot = await getRegistryPackageSnapshot(packageName);
    const localExists = workspacePackageNames.has(packageName);

    entries.push({
      packageName,
      latestVersion: registrySnapshot.latestVersion,
      isDeprecated: registrySnapshot.isDeprecated,
      deprecatedMessage: registrySnapshot.deprecatedMessage,
      localExists,
      isOrphan: !localExists,
      recommendedAction: getRecommendedAction({
        localExists,
        isDeprecated: registrySnapshot.isDeprecated,
      }),
      recommendedDeprecateCommand: localExists
        ? ''
        : buildDeprecationCommand(packageName, deprecationMessage),
    });
  }

  const orphanPackages = entries.filter((entry) => entry.isOrphan);
  const deprecatedOrphans = orphanPackages.filter((entry) => entry.isDeprecated);
  const activeOrphans = orphanPackages.filter((entry) => !entry.isDeprecated);

  return {
    scope,
    generatedAt: new Date().toISOString(),
    summary: {
      workspacePackageCount: workspacePackages.length,
      registryPackageCount: entries.length,
      orphanPackageCount: orphanPackages.length,
      activeOrphanPackageCount: activeOrphans.length,
      deprecatedOrphanPackageCount: deprecatedOrphans.length,
    },
    workspacePackages,
    packages: entries,
    orphanPackages,
  };
}

function formatBoolean(value) {
  return value ? 'yes' : 'no';
}

function formatTable(entries) {
  const header = [
    '| Package | Latest | Deprecated | Local Exists | Recommended Action | Recommended `npm deprecate` |',
    '| --- | --- | --- | --- | --- | --- |',
  ];

  const rows = entries.map((entry) => {
    const command = entry.recommendedDeprecateCommand || '-';
    return [
      entry.packageName,
      entry.latestVersion ?? '-',
      formatBoolean(entry.isDeprecated),
      formatBoolean(entry.localExists),
      entry.recommendedAction,
      command.replace(/\|/g, '\\|'),
    ];
  });

  return header
    .concat(rows.map((columns) => `| ${columns.join(' | ')} |`))
    .join('\n');
}

export function renderMarkdownReport(report) {
  const orphanSection = report.orphanPackages.length
    ? formatTable(report.orphanPackages)
    : 'No orphan packages detected.';

  const allPackagesSection = report.packages.length
    ? formatTable(report.packages)
    : 'No scoped packages found on npm.';

  return [
    '# FormulaX npm orphan package report',
    '',
    `Generated at: ${report.generatedAt}`,
    `Scope: \`${report.scope}\``,
    '',
    '## Summary',
    '',
    `- Workspace packages: ${report.summary.workspacePackageCount}`,
    `- npm scoped packages: ${report.summary.registryPackageCount}`,
    `- Orphan packages: ${report.summary.orphanPackageCount}`,
    `- Active orphan packages: ${report.summary.activeOrphanPackageCount}`,
    `- Already deprecated orphan packages: ${report.summary.deprecatedOrphanPackageCount}`,
    '',
    '## Orphan packages',
    '',
    orphanSection,
    '',
    '## All scoped packages',
    '',
    allPackagesSection,
    '',
  ].join('\n');
}

export function writeNpmOrphanReport(report) {
  mkdirSync(reportDir, { recursive: true });

  const jsonPath = path.join(reportDir, 'npm-orphan-packages.json');
  const markdownPath = path.join(reportDir, 'npm-orphan-packages.md');

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(markdownPath, renderMarkdownReport(report), 'utf8');

  return {
    jsonPath,
    markdownPath,
  };
}
