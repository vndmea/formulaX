# @formulaxjs/renderer-image

English | [简体中文](https://github.com/vndmea/formulaX/blob/main/packages/renderer-image/README.zh-CN.md)

Image-output helpers for FormulaX rich-text adapters.

`@formulaxjs/renderer-image` sits between a FormulaX SVG renderer and host-editor adapters. It turns rendered SVG markup into a PNG `Blob`, calls your upload function, and returns image HTML plus persisted metadata that adapters can store in DOM attrs or editor models.

> Status: experimental. Public APIs may change before the first stable release.

## What this package does

The package covers the `SVG -> PNG Blob -> upload -> image renderHtml` flow:

1. A FormulaX renderer returns inline SVG markup.
2. `svgMarkupToPngBlob` rasterizes that SVG into a PNG `Blob`.
3. Your `image.upload` function stores the PNG somewhere and returns a URL.
4. `renderFormulaDisplayHtml` returns image HTML and persisted metadata for the host adapter.

`output: 'image'` does not remove the source LaTeX. Adapters still preserve LaTeX metadata on the outer wrapper or editor model so double-click editing and round-tripping continue to work.

## Install

When published:

```bash
npm install @formulaxjs/renderer-image
```

Inside the FormulaX workspace:

```bash
pnpm install
pnpm --filter @formulaxjs/renderer-image build
```

## Core API

### `renderFormulaDisplayHtml`

High-level helper used by host adapters. It renders LaTeX through a FormulaX renderer, optionally uploads a PNG, and returns either SVG HTML or image HTML.

```ts
import { renderFormulaDisplayHtml } from '@formulaxjs/renderer-image';
import { createKityFormulaRenderer } from '@formulaxjs/renderer-kity';

const renderer = createKityFormulaRenderer({ fontSize: 40 });

const display = await renderFormulaDisplayHtml({
  output: 'image',
  renderer,
  latex: '\\frac{a}{b}',
  className: 'formulax-math',
  image: {
    upload: async ({ blob, filename, latex }) => {
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('latex', latex);

      const response = await fetch('http://localhost:3109/api/formula-image/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Formula image upload failed: ${response.status}`);
      }

      const payload = await response.json() as { url?: string; location?: string };

      return {
        url: payload.url ?? payload.location ?? '',
      };
    },
  },
});
```

### `svgMarkupToPngBlob`

Low-level rasterization helper. Use it when you want to handle uploading or persistence yourself.

```ts
import { svgMarkupToPngBlob } from '@formulaxjs/renderer-image';

const png = await svgMarkupToPngBlob(svgMarkup, {
  backgroundColor: '#ffffff',
});

console.log(png.width, png.height, png.displayStyle);
```

### `createFormulaImageHtml`

Creates the `<img>` HTML fragment used inside FormulaX wrappers.

```ts
import { createFormulaImageHtml } from '@formulaxjs/renderer-image';

const html = createFormulaImageHtml({
  src: 'http://localhost:3109/f/48231.png',
  latex: '\\sqrt{x}',
  className: 'formulax-math',
  width: 128,
  height: 48,
  style: 'width:2.5em; height:0.94em',
});
```

### `createFormulaDisplayAttributes`

Turns a display result into wrapper attributes such as:

- `data-formulax-output`
- `data-formulax-image-url`
- `data-formulax-image-width`
- `data-formulax-image-height`
- `data-formulax-image-style`

Adapters use these attrs to persist image metadata while still preserving LaTeX.

## Local upload demo

The workspace includes a local upload server:

```bash
pnpm dev:upload
```

Default endpoint:

```txt
http://localhost:3109/api/formula-image/upload
```

TinyMCE, Tiptap, and CKEditor 5 demos can switch to `image` mode and use that endpoint directly for local verification.

## Browser requirements and limitations

This package is intended for browser environments. PNG generation depends on browser APIs such as:

- `Blob`
- `fetch`
- `HTMLCanvasElement`
- `Image`
- `URL.createObjectURL`

Notes:

- GitHub Pages demos cannot reach your local `http://localhost:3109` upload server.
- Image mode is mainly meant for local development, integration testing, or apps with their own reachable upload API.
- Font loading and rasterization quality still depend on the browser runtime and the font assets available to the rendered SVG.

## Development

From the repository root:

```bash
pnpm --filter @formulaxjs/renderer-image test
pnpm --filter @formulaxjs/renderer-image typecheck
```
