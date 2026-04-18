# FormulaX

FormulaX is a modern monorepo for building a web-based math formula editing platform with a Kity-inspired interaction model and a more maintainable, package-oriented architecture.

The long-term goal is to publish FormulaX as a set of reusable npm packages for:

- formula document modeling and commands
- browser editing interactions
- KaTeX rendering
- host editor integrations such as Tiptap and TinyMCE
- reusable UI pieces such as toolbars, formula panels, and dialogs

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

At the moment, browser interaction tests are scaffolded with Playwright, but running them still requires a local Chromium download.

## Monorepo Layout

```text
FormulaX/
├─ apps/
│  ├─ playground/
│  ├─ tiptap-demo/
│  └─ tinymce-demo/
├─ packages/
│  ├─ core/
│  ├─ editor/
│  ├─ renderer-katex/
│  ├─ tiptap/
│  ├─ tinymce/
│  └─ ui/
└─ .changeset/
```

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

### `@formulax/ui`

Reusable UI components for formula editing workflows.

Responsibilities:

- toolbar actions
- formula panel content
- modal/dialog shell helpers

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

The repository includes a GitHub Actions workflow that publishes a demo hub to GitHub Pages.

Expected public URL for this repository name:

- `https://vndmea.github.io/formulaX/`

Expected demo routes:

- `https://vndmea.github.io/formulaX/playground/`
- `https://vndmea.github.io/formulaX/tiptap/`
- `https://vndmea.github.io/formulaX/tinymce/`

The Pages artifact is built from a single aggregated static output and deployed automatically from `main` through [`.github/workflows/deploy-pages.yml`](/e:/Code/formulaX/.github/workflows/deploy-pages.yml:1).

## Workspace Scripts

- `corepack pnpm dev`: start the standalone FormulaX playground
- `corepack pnpm dev:tiptap`: start the Tiptap demo
- `corepack pnpm dev:tinymce`: start the TinyMCE demo
- `corepack pnpm build`: build all packages and demo apps
- `corepack pnpm build:pages`: build the GitHub Pages demo hub locally into `.pages-dist`
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
- a small toolbar and helper panel

### Browser SDK (Vanilla JS)

For projects without a bundler, use the IIFE bundles directly:

**Core only (LaTeX parsing/serialization):**

```html
<script src="https://unpkg.com/@formulax/core/dist/browser/index.global.js"></script>
<script>
  const doc = FormulaX.parseLatex('\\frac{a}{b}');
  const latex = FormulaX.serializeLatex(doc);
</script>
```

**Full editor (with DOM interaction):**

```html
<script src="https://unpkg.com/@formulax/editor/dist/browser/index.global.js"></script>
<script>
  const editor = new FormulaX.FormulaEditor({
    root: document.getElementById('editor')
  });
</script>
```

**With KaTeX rendering:**

```html
<script src="https://unpkg.com/@formulax/renderer-katex/dist/browser/index.global.js"></script>
<script>
  const html = FormulaX.renderKatex(doc);
</script>
```

### Core Package (npm)

Example: parse and serialize LaTeX.

```ts
import { parseLatex, serializeLatex } from '@formulax/core';

const doc = parseLatex('\\frac{a}{\\sqrt{b}}');
const latex = serializeLatex(doc);

console.log(latex);
```

Example: build editor state with commands.

```ts
import { createEmptyState, insertFraction, insertText } from '@formulax/core';

let state = createEmptyState();
state = insertText('x')(state);
state = insertFraction()(state);
```

### Browser Editor Package

Example: mount a FormulaX editor into a DOM container.

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

Keyboard shortcuts in the current prototype:

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

## Examples

### `apps/playground`

Standalone FormulaX editing playground for local development.

### `apps/tiptap-demo`

Minimal host integration example showing how FormulaX can be embedded as a Tiptap node.

### `apps/tinymce-demo`

Minimal host integration example showing how FormulaX markup can be inserted into TinyMCE content.

## Deployment

GitHub Pages deployment is driven by the workflow in [`.github/workflows/deploy-pages.yml`](/e:/Code/formulaX/.github/workflows/deploy-pages.yml:1).

Local preview of the Pages artifact:

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
- `@formulax/renderer-katex`
- `@formulax/tiptap`
- `@formulax/tinymce`
- `@formulax/ui`

Before publishing, the following areas will need to be tightened further:

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

This separation is important so the formula model remains portable across editors, renderers, and products.

## TODO

- Add MathML import/export support
- Expand the AST with matrices, summations, integrals, and symbol palettes
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
