# @formulaxjs/core

## 0.1.1

### Patch Changes

- Fix published package metadata and outputs so consumers can reliably load FormulaX packages from npm.
  - Generate and publish `dist/index.d.ts` for packages that declare a `types` entry.
  - Fix `unpkg` to point at the published IIFE bundle in `dist/index.global.js`.
