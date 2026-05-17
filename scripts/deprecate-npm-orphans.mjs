import { spawnSync } from 'node:child_process';

import {
  DEFAULT_DEPRECATION_MESSAGE,
  collectNpmOrphanReport,
  writeNpmOrphanReport,
} from './lib/npm-orphan-packages.mjs';

const confirmDeprecate = process.env.CONFIRM_DEPRECATE === '1';
const forceDeprecate = process.env.FORCE_DEPRECATE === '1';
const deprecationMessage = process.env.DEPRECATION_MESSAGE || DEFAULT_DEPRECATION_MESSAGE;

const report = await collectNpmOrphanReport({
  deprecationMessage,
});
const paths = writeNpmOrphanReport(report);

const targets = report.orphanPackages.filter((entry) => forceDeprecate || !entry.isDeprecated);

console.log(`Markdown report: ${paths.markdownPath}`);
console.log(`JSON report: ${paths.jsonPath}`);

if (!confirmDeprecate) {
  console.log('\nDry run only. Set CONFIRM_DEPRECATE=1 to execute npm deprecations.');
  if (targets.length === 0) {
    console.log('No orphan packages require deprecation.');
  } else {
    console.log('Packages that would be deprecated:');
    for (const entry of targets) {
      console.log(`- ${entry.recommendedDeprecateCommand}`);
    }
  }
  process.exit(0);
}

if (targets.length === 0) {
  console.log('No orphan packages require deprecation.');
  process.exit(0);
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

for (const entry of targets) {
  console.log(`\nDeprecating ${entry.packageName}...`);
  const result = spawnSync(
    npmCommand,
    ['deprecate', `${entry.packageName}@*`, deprecationMessage],
    {
      stdio: 'inherit',
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('\nCompleted npm deprecations for orphan packages.');
