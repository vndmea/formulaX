# @formulaxjs/renderer-kity

English | [简体中文](https://github.com/vndmea/formulaX/blob/main/packages/renderer-kity/README.zh-CN.md)

Kity-based read-only renderer for FormulaX.

`@formulaxjs/renderer-kity` turns LaTeX into inline SVG markup by using the legacy Kity runtime behind the shared `@formulaxjs/renderer` contract. It is the current concrete renderer package for adapters that want runtime SVG output without depending on editor UI helpers.

> Status: experimental. Public APIs may change before the first stable release.

## Install

```bash
npm install @formulaxjs/renderer-kity
```

## Highlights

- `createKityFormulaRenderer`
- `renderLatexToSvgMarkup`
- `serializeKityFormulaFromRoot`
- `waitForKityFormulaSvgLayout`
- cache-safe asset overrides through `assetCacheKey`

## Example

```ts
import { createKityFormulaRenderer } from '@formulaxjs/renderer-kity';

const renderer = createKityFormulaRenderer({
  fontSize: 40,
});

const result = await renderer.renderLatex('\\frac{a}{b}');

console.log(result.engine); // kity
console.log(result.html);   // inline SVG markup
```

If you pass custom runtime asset overrides and want caching to stay enabled, also pass an `assetCacheKey` string so different asset sets do not share the same cache entry.

## Package role

Use this package when you want a concrete FormulaX renderer implementation today.

- It depends on `@formulaxjs/renderer` for shared renderer contracts and SVG helpers.
- It depends on `@formulaxjs/kity-runtime` for the legacy Kity backend.
- It does not depend on `@formulaxjs/editor`.
