# FormulaX

English | [简体中文](./README.zh-CN.md)

A modern formula editor workspace with legacy KityFormula compatibility, modular runtime loading, static renderers, and editor integrations.

## What is FormulaX?

FormulaX is a modern formula editor project. The current implementation includes a compatibility runtime adapted from [KityFormula](https://github.com/BaiduFE/kityformula) / kf-editor, while progressively modularizing the legacy code for modern frontend tooling, npm packages, lazy loading, and editor integrations.

It is **not** an official KityFormula project. KityFormula-related code is kept as a legacy compatibility layer under the `@formulaxjs/kity-runtime` package.

## Features

- Formula editing based on a legacy KityFormula-compatible runtime
- LaTeX input and rendering support
- Modular package structure with lazy-loaded chunks
- SVG-based formula rendering
- PNG/JPG export support loaded on demand (lazy-loaded canvg runtime)
- Designed for future renderer and editor adapter extensions
- Editor integrations: TipTap, TinyMCE, CKEditor 5

## Packages

Some packages are experimental and not yet published to npm.

| Package | Description |
| --- | --- |
| `@formulaxjs/core` | Core data model and shared utilities |
| `@formulaxjs/renderer` | Static formula renderers for rich-text adapters |
| `@formulaxjs/editor` | Public FormulaX editor entry and shared integration helpers |
| `@formulaxjs/kity-runtime` | Low-level legacy KityFormula compatibility runtime used behind the editor entry |
| `@formulaxjs/tiptap` | TipTap integration adapter |
| `@formulaxjs/tinymce` | TinyMCE integration adapter |
| `@formulaxjs/ckeditor5` | CKEditor 5 integration adapter |

## Playground

Live demo: [https://vndmea.github.io/formulaX/playground/](https://vndmea.github.io/formulaX/playground/)

## Architecture

FormulaX exposes its application-facing editor API through `@formulaxjs/editor` while keeping the legacy KityFormula compatibility runtime isolated in `@formulaxjs/kity-runtime`. Large legacy modules are progressively split into lazy chunks:

```
FormulaX workspace
├── @formulaxjs/core (document model, LaTeX parser/serializer)
├── @formulaxjs/renderer (static formula renderers)
├── @formulaxjs/editor (public editor entry and shared integration helpers)
├── @formulaxjs/kity-runtime (legacy compatibility layer and embedded assets)
│   ├── KityFormula runtime (lazy-loaded chunk)
│   ├── Parser runtime (lazy-loaded chunk)
│   ├── Font maps, sprite position maps, and static assets
│   └── canvg export runtime (lazy-loaded, only when exporting to PNG/JPG)
├── @formulaxjs/tiptap (TipTap adapter)
├── @formulaxjs/tinymce (TinyMCE adapter)
└── @formulaxjs/ckeditor5 (CKEditor 5 adapter)
```

This architecture allows:
- Default entry remains lightweight without eagerly bundling the legacy runtime
- Lazy loading of legacy runtime only when the formula editor is used
- On-demand image export without shipping canvg in the main bundle
- Future replacement of the KityFormula runtime with a modern renderer

## Legacy KityFormula Compatibility

The current editing runtime is based on a legacy compatibility layer adapted from Baidu FEX Team's [KityFormula](https://github.com/BaiduFE/kityformula) / kf-editor ecosystem.

FormulaX keeps this code under a dedicated runtime package (`@formulaxjs/kity-runtime`) and treats it as a **compatibility backend** behind the public `@formulaxjs/editor` entry rather than the long-term public architecture.

This approach:
- Preserves existing formula rendering behavior
- Modernizes packaging and lazy loading
- Prepares for future renderer implementations
- Enables integration with modern editors and frameworks

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

### Standalone Playground

```bash
pnpm dev
```

### Standalone Editor Package

```ts
import { FormulaXEditor } from '@formulaxjs/editor';

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

### React Integration

```tsx
import { useEffect, useRef } from 'react';
import { FormulaXEditor } from '@formulaxjs/editor';

export function FormulaXReactExample() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hostRef.current) {
      return;
    }

    const editor = new FormulaXEditor({
      el: hostRef.current,
    });

    return () => {
      void editor.destroy();
    };
  }, []);

  return <div ref={hostRef} />;
}
```

### Vue 3 Integration

```ts
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { FormulaXEditor } from '@formulaxjs/editor';

const hostRef = ref<HTMLDivElement | null>(null);
let editor: FormulaXEditor | null = null;

onMounted(() => {
  if (!hostRef.value) {
    return;
  }

  editor = new FormulaXEditor({
    el: hostRef.value,
  });
});

onBeforeUnmount(() => {
  void editor?.destroy();
  editor = null;
});
</script>

<template>
  <div ref="hostRef" />
</template>
```

### TipTap Integration

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
- `pnpm dev:tiptap` - Start the TipTap demo
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

The original KityFormula project provided the foundational formula rendering engine and interaction model that powers the legacy compatibility runtime in `@formulaxjs/kity-runtime`.

KityFormula-related code in FormulaX is:
- Kept isolated in `@formulaxjs/kity-runtime` as a legacy compatibility layer
- Not the long-term architecture of FormulaX
- Intended to be replaced or significantly refactored in future versions

FormulaX is not affiliated with Baidu or the original KityFormula project.

## Publishing Direction

Before public npm publishing, the following areas need further refinement:

- Stable public APIs for each package
- Package-level changelogs and release notes
- Declaration output cleanup and export hardening
- Browser compatibility matrix
- Semver policy for document format changes

## Design Principles

- Keep semantics in `core`
- Keep the public editor entry in `editor`
- Keep the legacy runtime isolated in `kity-runtime`
- Keep rendering adapters thin
- Keep host integrations thin

## License

**Note**: Before public npm publishing, license information for FormulaX and all included third-party components should be reviewed and finalized.

KityFormula-related code and assets retain their original copyright and license notices.

## TODO

- Add MathML import/export support
- Expand the AST with matrices, summations, integrals, and richer symbol palettes
- Improve cursor movement and nested selection behavior
- Add IME-friendly text editing behavior
- Add richer command APIs for structural editing
- Add better error recovery in the LaTeX parser
- Add collaborative transaction hooks
- Complete Playwright browser test setup with downloaded browsers
- Prepare npm publishing workflow and release automation with Changesets
