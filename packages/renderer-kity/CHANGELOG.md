# @formulaxjs/renderer-kity

## 0.3.1

### Patch Changes

- Fix published package metadata and outputs so consumers can reliably load FormulaX packages from npm.
  - Generate and publish `dist/index.d.ts` for packages that declare a `types` entry.
  - Fix `unpkg` to point at the published IIFE bundle in `dist/index.global.js`.

- Updated dependencies
  - @formulaxjs/renderer@0.2.1
  - @formulaxjs/kity-runtime@0.5.1

## 0.3.0

### Minor Changes

- Improve published asset output for FormulaX runtime and host-editor adapters, and add framework demo coverage for Vue, React, and Svelte consumption.

### Patch Changes

- Updated dependencies
  - @formulaxjs/kity-runtime@0.5.0

## 0.2.1

### Patch Changes

- Pick up the refreshed `@formulaxjs/kity-runtime` browser runtime behavior, including the localized legacy UI fixes used by hosted editors.
- Updated dependencies
  - @formulaxjs/kity-runtime@0.4.0

## 0.2.0

### Minor Changes

- Split Kity-based read-only rendering into `@formulaxjs/renderer-kity`, route the editor adapters through the refreshed renderer stack, and ship the latest editor, modal, runtime, and rendering behavior improvements from this release cycle.

### Patch Changes

- Updated dependencies
  - @formulaxjs/kity-runtime@0.3.0
  - @formulaxjs/renderer@0.2.0
