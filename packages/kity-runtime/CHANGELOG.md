# @formulaxjs/kity-runtime

## 0.2.0

### Minor Changes

- Merge the legacy Kity asset package into `@formulaxjs/kity-runtime` so the runtime now ships its embedded styles, toolbar images, and font resources directly from a single package.

  This removes the separate `@formulaxjs/kity-assets` dependency from the runtime integration path and adds public runtime subpath exports for bundled styles, images, themes, and resource files.
