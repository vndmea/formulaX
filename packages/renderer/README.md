# @formulax/renderer

Static rendering helpers for FormulaX rich-text integrations.

`@formulax/renderer` contains DOM-level helpers for working with rendered SVG formulas, including reading the rendered box and serializing SVG for inline insertion.

> Status: experimental. Public APIs may change before the first stable release.

## Install

```bash
pnpm add @formulax/renderer
```

## Highlights

- `readRenderedFormulaSvgBox` for measuring rendered formula bounds
- `serializeSvgForInsertion` for producing inline-safe SVG markup
- `FormulaRenderMode` type for renderer mode selection

## Example

```ts
import { readRenderedFormulaSvgBox, serializeSvgForInsertion } from '@formulax/renderer';

const svg = document.querySelector('svg');

if (svg instanceof SVGSVGElement) {
  console.log(readRenderedFormulaSvgBox(svg));
  console.log(serializeSvgForInsertion(svg));
}
```

## Package role

Use this package in rich-text editor adapters or export pipelines that need to post-process FormulaX-generated SVG output.
