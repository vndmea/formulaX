# FormulaX

English | [简体中文](./README.zh-CN.md)

A modern formula editor workspace with legacy KityFormula compatibility, modular runtime loading, shared rendering protocols, and rich-text editor integrations.

## What is FormulaX?

FormulaX is a modern formula editor project. The current implementation keeps a compatibility runtime adapted from [KityFormula](https://github.com/BaiduFE/kityformula) / kf-editor, while progressively separating core model logic, renderer contracts, read-only rendering, and host-editor adapters into clearer packages.

It is **not** an official KityFormula project. KityFormula-related code is treated as a legacy compatibility backend under `@formulaxjs/kity-runtime`.

## Features

- Formula editing backed by a legacy KityFormula-compatible runtime
- Shared renderer protocol for future engine swapping
- Kity-based read-only SVG rendering through a dedicated renderer package
- Modular package structure with lazy-loaded runtime chunks
- Optional idle or hover preloading to reduce the first editor-open delay
- PNG/JPG export support loaded on demand
- Rich-text editor integrations for Tiptap, TinyMCE, and CKEditor 5

## Packages

Some packages are experimental and not yet published to npm.

| Package | Description |
| --- | --- |
| `@formulaxjs/core` | Core data model, LaTeX parsing, and shared pure logic |
| `@formulaxjs/renderer` | Shared renderer contracts, formula markup helpers, base styles, cache helpers, and SVG utilities |
| `@formulaxjs/renderer-kity` | Kity-based read-only renderer that turns LaTeX into inline SVG markup |
| `@formulaxjs/editor` | Modal-oriented FormulaX editor UI helpers built on top of the runtime |
| `@formulaxjs/kity-runtime` | Legacy KityFormula compatibility runtime, embedded assets, and low-level editor factory |
| `@formulaxjs/tiptap` | Tiptap integration adapter |
| `@formulaxjs/tinymce` | TinyMCE integration adapter |
| `@formulaxjs/ckeditor5` | CKEditor 5 integration adapter |

## Playground

Live demo: [https://vndmea.github.io/formulaX/playground/](https://vndmea.github.io/formulaX/playground/)

## Architecture

FormulaX now separates shared rendering concerns from the Kity-specific read-only renderer and from the modal editing UI:

```txt
FormulaX workspace
├── @formulaxjs/core (document model, LaTeX parser/serializer)
├── @formulaxjs/renderer (renderer protocol, markup, styles, svg helpers)
├── @formulaxjs/renderer-kity (Kity-based LaTeX -> inline SVG renderer)
├── @formulaxjs/editor (modal UI and embedded editor orchestration)
├── @formulaxjs/kity-runtime (legacy compatibility runtime and embedded assets)
│   ├── KityFormula runtime (lazy-loaded chunk)
│   ├── Parser runtime (lazy-loaded chunk)
│   ├── Font maps, sprite position maps, and static assets
│   └── canvg export runtime (lazy-loaded, only when exporting PNG/JPG)
├── @formulaxjs/tiptap (Tiptap adapter)
├── @formulaxjs/tinymce (TinyMCE adapter)
└── @formulaxjs/ckeditor5 (CKEditor 5 adapter)
```

This architecture allows:

- Reusing one renderer contract across adapters
- Keeping Kity-specific rendering isolated behind `@formulaxjs/renderer-kity`
- Keeping modal editing behavior isolated from read-only rendering
- Preparing for future engines such as `renderer-katex` without reworking adapters

## Legacy KityFormula Compatibility

The current editing runtime is still based on a legacy compatibility layer adapted from Baidu FEX Team's [KityFormula](https://github.com/BaiduFE/kityformula) / kf-editor ecosystem.

FormulaX keeps this code in a dedicated runtime package (`@formulaxjs/kity-runtime`) and treats it as a compatibility backend rather than the long-term public architecture.

This approach:

- Preserves existing editing and rendering behavior
- Modernizes packaging and lazy loading
- Allows host adapters to preload the runtime before the first modal open
- Keeps host adapters decoupled from direct Kity runtime usage
- Prepares for future renderer implementations

## Getting Started

### Requirements

- Node.js 22+
- `corepack`
- `pnpm` 9+

### Install

```bash
corepack enable
corepack prepare pnpm@9.12.3 --activate
pnpm install
```

### Development

Run the standalone playground:

```bash
pnpm dev
```

Run editor integration demos:

```bash
pnpm dev:ckeditor5
pnpm dev:tiptap
pnpm dev:tinymce
```

### Build

```bash
pnpm build
```

## Usage

APIs are experimental and may change before the first stable npm release.

### Shared Renderer Usage

```ts
import { createKityFormulaRenderer } from '@formulaxjs/renderer-kity';

const renderer = createKityFormulaRenderer({
  fontSize: 40,
});

const { html } = await renderer.renderLatex('\\frac{a}{b}');
```

### Modal Editing UI

```ts
import {
  ensureFormulaXModalStyles,
  mountFormulaXEditor,
} from '@formulaxjs/editor';

ensureFormulaXModalStyles(document);

const mounted = mountFormulaXEditor(document.querySelector('#host') as HTMLElement, {
  initialLatex: '\\sqrt{x}',
});

const latex = await mounted.getLatex();
```

### Low-Level Kity Runtime Entry

```ts
import { FormulaXEditor } from '@formulaxjs/kity-runtime';

const editor = new FormulaXEditor({
  el: '#app',
});
```

### Core Package

```ts
import { parseLatex, serializeLatex } from '@formulaxjs/core';

const doc = parseLatex('\\frac{a}{\\sqrt{b}}');
const latex = serializeLatex(doc);
```

### Tiptap Integration

```ts
import StarterKit from '@tiptap/starter-kit';
import { Editor } from '@tiptap/core';
import { FormulaXNode } from '@formulaxjs/tiptap';

const editor = new Editor({
  element: document.querySelector('#editor'),
  extensions: [StarterKit, FormulaXNode],
});
```

### TinyMCE Integration

```ts
import tinymce from 'tinymce';
import { createTinyMceFormulaMarkup } from '@formulaxjs/tinymce';

tinymce.init({
  target: document.querySelector('#tiny-host'),
});

const markup = createTinyMceFormulaMarkup('\\sqrt{x}');
```

### CKEditor 5 Integration

```ts
import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';
import { FormulaX } from '@formulaxjs/ckeditor5';

ClassicEditor.create(document.querySelector('#editor'), {
  plugins: [Essentials, Paragraph, FormulaX],
  toolbar: ['formulaX'],
});
```

## Workspace Scripts

- `pnpm dev` - Start the standalone FormulaX playground
- `pnpm dev:ckeditor5` - Start the CKEditor 5 demo
- `pnpm dev:tiptap` - Start the Tiptap demo
- `pnpm dev:tinymce` - Start the TinyMCE demo
- `pnpm build` - Build all packages and demo apps
- `pnpm build:packages` - Build workspace packages only
- `pnpm build:pages` - Build GitHub Pages demo hub
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm test` - Run Vitest unit tests
- `pnpm test:browser` - Run Playwright browser tests

## Acknowledgements / Attribution

FormulaX contains code adapted from Baidu FEX Team's [KityFormula](https://github.com/BaiduFE/kityformula) / kf-editor ecosystem.

KityFormula-related code and assets retain their original copyright and license notices.
