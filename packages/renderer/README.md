# @formulaxjs/renderer

Shared renderer contracts and formula markup utilities for FormulaX.

`@formulaxjs/renderer` is the renderer-common layer. It does not bind to Kity, KaTeX, or any host editor. Instead, it provides shared types, formula DOM helpers, base styles, cache helpers, and SVG post-processing utilities that concrete renderer packages and editor adapters can reuse.

> Status: experimental. Public APIs may change before the first stable release.

## Install

```bash
npm install @formulaxjs/renderer
```

## Highlights

- `FormulaRenderer`, `FormulaRenderOptions`, and `FormulaRenderResult`
- `createFormulaMarkup` and `createFormulaElement`
- `ensureFormulaXBaseStyles`
- `createFormulaRenderCacheKey`
- `readRenderedFormulaSvgBox` and `serializeSvgForInsertion`

## Example

```ts
import {
  createFormulaMarkup,
  ensureFormulaXBaseStyles,
  serializeSvgForInsertion,
} from '@formulaxjs/renderer';

ensureFormulaXBaseStyles(document);

const markup = createFormulaMarkup('\\sqrt{x}');

const svg = document.querySelector('svg');
if (svg instanceof SVGSVGElement) {
  console.log(serializeSvgForInsertion(svg));
}
```

## Package role

Use this package when you need shared renderer-facing primitives:

- host-editor adapters that need stable formula markup helpers
- concrete renderer packages such as `@formulaxjs/renderer-kity`
- export or post-processing flows that work with rendered SVG

If you need a concrete Kity-backed renderer, use `@formulaxjs/renderer-kity`.
