# @formulaxjs/editor

## 0.4.0

### Minor Changes

- Improve published asset output for FormulaX runtime and host-editor adapters, and add framework demo coverage for Vue, React, and Svelte consumption.

### Patch Changes

- Updated dependencies
  - @formulaxjs/kity-runtime@0.5.0
  - @formulaxjs/renderer-kity@0.3.0

## 0.3.1

### Patch Changes

- Move shared modal copy into the editor layer so adapters resolve localized FormulaX dialog titles and actions from one place.
- Improve the hosted FormulaX modal layout so the footer stays visible and nested runtime panels have enough room in tighter viewports.
- Updated dependencies
  - @formulaxjs/kity-runtime@0.4.0
  - @formulaxjs/renderer-kity@0.2.1

## 0.3.0

### Minor Changes

- Split Kity-based read-only rendering into `@formulaxjs/renderer-kity`, route the editor adapters through the refreshed renderer stack, and ship the latest editor, modal, runtime, and rendering behavior improvements from this release cycle.

### Patch Changes

- Updated dependencies
  - @formulaxjs/kity-runtime@0.3.0
  - @formulaxjs/renderer@0.2.0
  - @formulaxjs/renderer-kity@0.2.0

## 0.2.0

### Minor Changes

- Make `FormulaXEditor` the sole public editor entry, remove the legacy `FormulaEditor` path, and rename the remaining modal editor helpers and option types to the unified `FormulaXEditor` naming.

## 0.1.1

### Patch Changes

- Updated dependencies
  - @formulaxjs/kity-runtime@0.2.0
