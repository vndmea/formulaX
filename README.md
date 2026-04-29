# FormulaX

FormulaX is a modern monorepo for building a web-based math formula editing platform with a Kity-inspired interaction model and a package-oriented architecture.

The long-term goal is to publish FormulaX as a family of reusable npm packages for:

- formula document modeling and commands
- browser editing interactions
- KaTeX rendering
- host-editor integrations such as Tiptap and TinyMCE
- reusable UI building blocks such as toolbars, symbol panels, and dialogs

The current repository focuses on Phase 1: a minimal but usable foundation.

## Status

Phase 1 currently includes:

- formula node model for text, fractions, superscript/subscript, square roots, and fenced groups
- LaTeX parsing and serialization
- KaTeX rendering adapter
- Kity-style basic DOM interaction and path-based selection
- minimal Tiptap and TinyMCE integration packages
- example apps for standalone editing, Tiptap, and TinyMCE
- unit tests for parser/serializer and adapters
- DOM tests for the editor

Browser interaction tests are scaffolded with Playwright, but still require a local Chromium download.

## Monorepo Layout

```text
FormulaX/
|- apps/
|  |- playground/
|  |- tiptap-demo/
|  `- tinymce-demo/
|- packages/
|  |- core/
|  |- editor/
|  |- kity-assets/
|  |- kity-runtime/
|  |- renderer-katex/
|  |- tiptap/
|  `- tinymce/
`- .changeset/
```

## Kity Migration

FormulaX is migrating toward the real `kityformula` source model to build a toolbar, layout, and interaction model that closely matches Kity and the equation ribbon in Word/WPS.

### Migration Packages

| Package | Purpose |
|---------|---------|
| `@formulax/kity-runtime` | Runtime bridge and editor bootstrap API |
| `@formulax/kity-assets` | Static Kity assets served by workspace apps |

### Migration Status

- Runtime package: Active editor bootstrap path
- Asset package: Serves embedded Kity resources from the workspace
- Playground: Loads Kity through `@formulax/kity-runtime`
- Old adapter and toolbar experiments: Removed

## Package Overview

### `@formulax/core`

The semantic heart of FormulaX.

Responsibilities:

- AST and document model
- schema and node structure
- selection and cursor state
- command and transaction primitives
- LaTeX import/export protocol

This package is intended to remain host-agnostic.

### `@formulax/editor`

The generic browser editing layer.

Responsibilities:

- DOM rendering for formula nodes
- keyboard handling
- selection/path mapping
- Kity-style minimal interaction surface

This package should not contain Tiptap or TinyMCE-specific logic.

### `@formulax/renderer-katex`

Rendering adapter for KaTeX.

Responsibilities:

- convert FormulaX documents into KaTeX-friendly LaTeX
- provide a thin rendering bridge around `katex.renderToString`

### `@formulax/tiptap`

Thin Tiptap integration layer.

Responsibilities:

- expose a FormulaX node extension
- map host node attributes to FormulaX payloads

### `@formulax/tinymce`

Thin TinyMCE integration layer.

Responsibilities:

- generate and parse host-side formula markup
- bridge TinyMCE content with FormulaX payloads

### `@formulax/kity-runtime`

Typed runtime bridge for loading the embedded Kity editor in modern apps.

Responsibilities:

- load Kity runtime assets
- install compatibility shims
- expose editor bootstrap APIs

## Getting Started

### Requirements

- Node.js 22+
- `corepack`
- `pnpm` 9+

### Install

```bash
corepack enable
corepack prepare pnpm@9.12.3 --activate
corepack pnpm install
```

### Development

Run the standalone playground:

```bash
corepack pnpm dev
```

Run the host-editor demos:

```bash
corepack pnpm dev:tiptap
corepack pnpm dev:tinymce
```

## GitHub Pages

The repository publishes a demo hub to GitHub Pages.

Live URLs:

- `https://vndmea.github.io/formulaX/`
- `https://vndmea.github.io/formulaX/playground/`
- `https://vndmea.github.io/formulaX/tiptap/`
- `https://vndmea.github.io/formulaX/tinymce/`

The deployment is driven by [`.github/workflows/deploy-pages.yml`](/e:/Code/formulaX/.github/workflows/deploy-pages.yml:1).

## Workspace Scripts

- `corepack pnpm dev`: start the standalone FormulaX playground
- `corepack pnpm dev:tiptap`: start the Tiptap demo
- `corepack pnpm dev:tinymce`: start the TinyMCE demo
- `corepack pnpm build`: build all packages and demo apps
- `corepack pnpm build:packages`: build workspace packages only
- `corepack pnpm build:pages`: build the GitHub Pages demo hub into `.pages-dist`
- `corepack pnpm test`: run Vitest
- `corepack pnpm test:browser`: run Playwright browser tests
- `corepack pnpm lint`: run ESLint
- `corepack pnpm format`: run Prettier
- `corepack pnpm typecheck`: run TypeScript type checking

## Usage

### Standalone Playground

The simplest way to explore the current editor is the standalone playground app:

```bash
corepack pnpm dev
```

It includes:

- the FormulaX editor surface
- a LaTeX output preview
- a KaTeX HTML preview
- a toolbar and symbol panel

### Browser SDK (Vanilla JS)

For projects without a bundler, use the browser bundles directly.

Core only:

```html
<script src="https://unpkg.com/@formulax/core/dist/browser/index.global.js"></script>
<script>
  const doc = FormulaX.parseLatex('\\frac{a}{b}');
  const latex = FormulaX.serializeLatex(doc);
</script>
```

Editor:

```html
<script src="https://unpkg.com/@formulax/editor/dist/browser/index.global.js"></script>
<script>
  const editor = new FormulaX.FormulaEditor({
    root: document.getElementById('editor'),
  });
</script>
```

KaTeX adapter:

```html
<script src="https://unpkg.com/@formulax/renderer-katex/dist/browser/index.global.js"></script>
<script>
  const html = FormulaX.renderKatex(doc);
</script>
```

### Core Package

Parse and serialize LaTeX:

```ts
import { parseLatex, serializeLatex } from '@formulax/core';

const doc = parseLatex('\\frac{a}{\\sqrt{b}}');
const latex = serializeLatex(doc);
```

Build editor state with commands:

```ts
import { createEmptyState, insertFraction, insertText } from '@formulax/core';

let state = createEmptyState();
state = insertText('x')(state);
state = insertFraction()(state);
```

### Browser Editor Package

```ts
import { FormulaEditor } from '@formulax/editor';

const root = document.getElementById('editor');

if (!root) {
  throw new Error('Editor root not found');
}

const editor = new FormulaEditor({
  root,
  onChange: (state) => {
    console.log(state.doc);
  },
});
```

Current keyboard shortcuts:

- `/`: insert fraction
- `^`: insert superscript structure
- `_`: insert subscript structure
- `(`: insert fenced group
- `Ctrl + R`: insert square root

### KaTeX Renderer

```ts
import { parseLatex } from '@formulax/core';
import { renderKatex } from '@formulax/renderer-katex';

const doc = parseLatex('\\sqrt{x}');
const html = renderKatex(doc);
```

### Tiptap Integration

```ts
import StarterKit from '@tiptap/starter-kit';
import { Editor } from '@tiptap/core';
import { FormulaXNode } from '@formulax/tiptap';

const editor = new Editor({
  element: document.querySelector('#editor'),
  extensions: [StarterKit, FormulaXNode],
});
```

### TinyMCE Integration

```ts
import tinymce from 'tinymce';
import { createTinyMceFormulaMarkup } from '@formulax/tinymce';

tinymce.init({
  target: document.querySelector('#tiny-host'),
});

const markup = createTinyMceFormulaMarkup('\\sqrt{x}');
```

## Deployment

GitHub Pages deployment is driven by [`.github/workflows/deploy-pages.yml`](/e:/Code/formulaX/.github/workflows/deploy-pages.yml:1).

Build the Pages artifact locally:

```bash
corepack pnpm build:pages
```

This generates:

- `.pages-dist/index.html`: demo hub landing page
- `.pages-dist/playground/`: standalone playground
- `.pages-dist/tiptap/`: Tiptap demo
- `.pages-dist/tinymce/`: TinyMCE demo

## Testing

The repository currently uses three test layers:

- `packages/core/test`: parser, serializer, and command tests
- `packages/editor/test`: DOM interaction tests
- `packages/editor/test/browser`: Playwright browser interaction tests

Commands:

```bash
corepack pnpm test
corepack pnpm test:browser
```

Verified in this repository:

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

## Publishing Direction

This repository is being shaped with future npm publishing in mind.

Expected publishing targets:

- `@formulax/core`
- `@formulax/editor`
- `@formulax/kity-assets`
- `@formulax/kity-runtime`
- `@formulax/renderer-katex`
- `@formulax/tiptap`
- `@formulax/tinymce`

Before publishing, the following areas still need tightening:

- stable public APIs
- package-level changelogs and release notes
- declaration output cleanup and package export hardening
- browser compatibility matrix
- semver policy for document format changes

## Design Principles

- Keep semantics in `core`
- Keep DOM interaction in `editor`
- Keep rendering adapters thin
- Keep host integrations thin
- Keep UI reusable and replaceable

This separation keeps the formula model portable across editors, renderers, and products.

## TODO

- Add MathML import/export support
- Expand the AST with matrices, summations, integrals, and richer symbol palettes
- Improve cursor movement and nested selection behavior
- Add IME-friendly text editing behavior
- Add richer command APIs for structural editing
- Add better error recovery in the LaTeX parser
- Add collaborative transaction hooks
- Improve package build output for published type declarations
- Add visual regression coverage for formula rendering
- Complete Playwright browser test setup with downloaded browsers
- Add docs for framework integrations beyond Tiptap and TinyMCE
- Prepare npm publishing workflow and release automation with Changesets

## License

MIT
