import {
  collectNpmOrphanReport,
  writeNpmOrphanReport,
} from './lib/npm-orphan-packages.mjs';

const report = await collectNpmOrphanReport();
const paths = writeNpmOrphanReport(report);

console.log(`Generated npm orphan package report for ${report.scope}.`);
console.log(`Workspace packages: ${report.summary.workspacePackageCount}`);
console.log(`npm scoped packages: ${report.summary.registryPackageCount}`);
console.log(`Orphan packages: ${report.summary.orphanPackageCount}`);
console.log(`Active orphan packages: ${report.summary.activeOrphanPackageCount}`);
console.log(`Already deprecated orphan packages: ${report.summary.deprecatedOrphanPackageCount}`);
console.log(`Markdown report: ${paths.markdownPath}`);
console.log(`JSON report: ${paths.jsonPath}`);

if (report.orphanPackages.length > 0) {
  console.log('\nOrphan packages:');
  for (const entry of report.orphanPackages) {
    console.log(
      `- ${entry.packageName}@${entry.latestVersion ?? 'unknown'} | deprecated=${entry.isDeprecated ? 'yes' : 'no'} | ${entry.recommendedAction}`,
    );
  }
}
