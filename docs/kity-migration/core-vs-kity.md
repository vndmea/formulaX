# Core vs Kity Architecture

This document explains the relationship between FormulaX core packages and the embedded Kity runtime packages.

## Current FormulaX Packages

### `@formulax/core`

The FormulaX core package provides:

- AST and document model for formula structures
- Command and transaction primitives
- LaTeX parsing and serialization protocol
- Selection and cursor state management

This package is host-agnostic and designed to be portable across different editors and renderers.

### `@formulax/editor`

The FormulaX editor package provides:

- DOM rendering for formula nodes
- Keyboard handling
- Selection/path mapping
- Kity-style minimal interaction surface

## Embedded Kity Packages

### `@formulax/kity-runtime`

Contains the modern bootstrap API, compatibility shims, and progressively migrated source modules used to start the embedded Kity editor.

### `@formulax/kity-assets`

Contains the static Kity assets that are served by workspace apps, including legacy bundles, styles, fonts, and image resources.

## Long-Term Ownership Boundaries

| Package | Ownership | Notes |
|---------|-----------|-------|
| `@formulax/core` | FormulaX | Host-agnostic formula model |
| `@formulax/kity-runtime` | FormulaX | Modern runtime bridge over embedded Kity source |
| `@formulax/kity-assets` | FormulaX | Static assets and legacy bundles |

## Migration Strategy

1. **Phase 1**: Move Kity runtime boot and shared data into workspace packages
2. **Phase 2**: Replace public source files with thin compatibility shims
3. **Phase 3**: Route playground through `@formulax/kity-runtime`
4. **Phase 4**: Continue migrating source modules from asset-side JS into typed workspace modules
5. **Phase 5**: Reduce dependence on legacy bundles and unused experiments
6. **Phase 6**: Add broader tests and package-level integrations

## Design Principles

- Core semantics remain in `@formulax/core`
- Embedded Kity runtime is surfaced through `@formulax/kity-runtime`
- Static assets remain isolated in `@formulax/kity-assets`
- Clear boundaries enable independent evolution of each layer
