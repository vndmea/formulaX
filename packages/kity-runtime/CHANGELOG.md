# @formulaxjs/kity-runtime

## 0.3.0

### Minor Changes

- Split Kity-based read-only rendering into `@formulaxjs/renderer-kity`, route the editor adapters through the refreshed renderer stack, and ship the latest editor, modal, runtime, and rendering behavior improvements from this release cycle.

## 0.2.0

### Minor Changes

- Merge the legacy Kity asset package into `@formulaxjs/kity-runtime` so the runtime now ships its embedded styles, toolbar images, and font resources directly from a single package.

  This removes the separate `@formulaxjs/kity-assets` dependency from the runtime integration path and adds public runtime subpath exports for bundled styles, images, themes, and resource files.
