# Core vs Kity Architecture

This document explains the relationship between FormulaX core packages and the imported Kity packages.

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

## Imported Kity Packages

### `@formulax/kity-vendor-editor`

Contains the imported `kf-editor` source - the core Kity formula editor implementation.

### `@formulax/kity-vendor-parser`

Contains the imported `kf-parser` source - the Kity LaTeX parser.

### `@formulax/kity-vendor-render`

Contains the imported `kf-render` source - the Kity formula rendering engine.

## Long-Term Ownership Boundaries

| Package | Ownership | Notes |
|---------|-----------|-------|
| `@formulax/core` | FormulaX | Host-agnostic formula model |
| `@formulax/kity-adapter` | FormulaX | Wraps vendor packages |
| `@formulax/kity-toolbar` | FormulaX | Toolbar UI layer |
| `@formulax/kity-vendor-*` | External | Imported source, minimal modifications |

## Migration Strategy

1. **Phase 1**: Import vendor source into workspace packages
2. **Phase 2**: Build adapter layer with modern TypeScript interfaces
3. **Phase 3**: Implement new toolbar on top of adapter
4. **Phase 4**: Rewire playground to use new toolbar
5. **Phase 5**: Deprecate old UI paths
6. **Phase 6**: Add comprehensive tests
7. **Phase 7**: Documentation and CI improvements
8. **Phase 8**: Cleanup old code paths

## Design Principles

- Core semantics remain in `@formulax/core`
- Vendor code remains isolated in `kity-vendor-*` packages
- Adapter provides stable modern API over vendor internals
- Toolbar provides UI layer that can be replaced independently
- Clear boundaries enable independent evolution of each layer
