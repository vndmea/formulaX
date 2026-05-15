# Core vs Kity Architecture

This document explains the relationship between FormulaX core packages and the embedded Kity runtime packages.

## Current FormulaX Packages

### `@formulaxjs/core`

The FormulaX core package provides:

- AST and document model for formula structures
- Command and transaction primitives
- LaTeX parsing and serialization protocol
- Selection and cursor state management

This package is host-agnostic and designed to be portable across different editors and renderers.

### `@formulaxjs/editor`

The FormulaX editor package provides:

- DOM rendering for formula nodes
- Keyboard handling
- Selection/path mapping
- Kity-style minimal interaction surface

## Embedded Kity Packages

### `@formulaxjs/kity-runtime`

Contains the modern bootstrap API, compatibility shims, progressively migrated source modules, and the embedded legacy assets used to start the Kity editor.

## Long-Term Ownership Boundaries

| Package | Ownership | Notes |
|---------|-----------|-------|
| `@formulaxjs/core` | FormulaX | Host-agnostic formula model |
| `@formulaxjs/kity-runtime` | FormulaX | Modern runtime bridge over embedded Kity source and assets |

## Migration Strategy

1. **Phase 1**: Move Kity runtime boot and shared data into workspace packages
2. **Phase 2**: Replace public source files with thin compatibility shims
3. **Phase 3**: Route playground through `@formulaxjs/kity-runtime`
4. **Phase 4**: Continue migrating source modules from asset-side JS into typed workspace modules
5. **Phase 5**: Reduce dependence on legacy bundles and unused experiments
6. **Phase 6**: Add broader tests and package-level integrations

## Design Principles

- Core semantics remain in `@formulaxjs/core`
- Embedded Kity runtime is surfaced through `@formulaxjs/kity-runtime`
- Static assets are embedded and exported through `@formulaxjs/kity-runtime`
- Clear boundaries enable independent evolution of each layer
