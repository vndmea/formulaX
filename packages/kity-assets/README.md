# @formulax/kity-assets

Static KityFormula-compatible assets for FormulaX.

`@formulax/kity-assets` publishes the fonts, toolbar sprites, theme files, and style entrypoints used by the legacy Kity runtime integration.

> Status: experimental. Public APIs may change before the first stable release.

## Install

```bash
pnpm add @formulax/kity-assets
```

## Highlights

- `kityAssetManifest` for a single object containing font, toolbar, and style URLs
- `kityFontAssets`, `kityToolbarAssets`, and `kityStyleAssets` for direct asset access
- Published subpath exports for legacy styles, theme files, images, and font resources

## Example

```ts
import { kityAssetManifest } from '@formulax/kity-assets';

console.log(kityAssetManifest.styles.editor);
console.log(kityAssetManifest.fonts.KF_AMS_MAIN);
```

## Package role

Use this package when you need stable asset URLs for the Kity-based runtime or when bundling FormulaX legacy resources into another application.
