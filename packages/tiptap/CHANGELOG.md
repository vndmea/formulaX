# @formulaxjs/tiptap

## 0.4.1

### Patch Changes

- Fix published package metadata and outputs so consumers can reliably load FormulaX packages from npm.
  - Generate and publish `dist/index.d.ts` for packages that declare a `types` entry.
  - Fix `unpkg` to point at the published IIFE bundle in `dist/index.global.js`.

- Updated dependencies
  - @formulaxjs/core@0.1.1
  - @formulaxjs/renderer@0.2.1
  - @formulaxjs/renderer-kity@0.3.1
  - @formulaxjs/editor@0.4.1

## 0.4.0

### Minor Changes

- Improve published asset output for FormulaX runtime and host-editor adapters, and add framework demo coverage for Vue, React, and Svelte consumption.

### Patch Changes

- Updated dependencies
  - @formulaxjs/renderer-kity@0.3.0
  - @formulaxjs/editor@0.4.0

## 0.3.1

### Patch Changes

- Pick up the localized FormulaX modal copy and the updated hosted runtime layout fixes through the editor stack.
- @formulaxjs/editor@0.3.1
- @formulaxjs/renderer-kity@0.2.1

## 0.3.0

### Minor Changes

- Split Kity-based read-only rendering into `@formulaxjs/renderer-kity`, route the editor adapters through the refreshed renderer stack, and ship the latest editor, modal, runtime, and rendering behavior improvements from this release cycle.

### Patch Changes

- Updated dependencies
  - @formulaxjs/editor@0.3.0
  - @formulaxjs/renderer@0.2.0
  - @formulaxjs/renderer-kity@0.2.0

## 0.2.2

### Patch Changes

- Updated dependencies
  - @formulaxjs/editor@0.2.0

## 0.2.1

### Patch Changes

- @formulaxjs/editor@0.1.1

## 0.2.0

### Minor Changes

- Add configurable schema names for the Tiptap and CKEditor 5 adapters, including duplicate-name diagnostics so host editors can register FormulaX under custom model keys without silently colliding with existing nodes or schema definitions.
