# @formulaxjs/renderer

## 0.2.1

### Patch Changes

- Fix published package metadata and outputs so consumers can reliably load FormulaX packages from npm.
  - Generate and publish `dist/index.d.ts` for packages that declare a `types` entry.
  - Fix `unpkg` to point at the published IIFE bundle in `dist/index.global.js`.

## 0.2.0

### Minor Changes

- Split Kity-based read-only rendering into `@formulaxjs/renderer-kity`, route the editor adapters through the refreshed renderer stack, and ship the latest editor, modal, runtime, and rendering behavior improvements from this release cycle.
