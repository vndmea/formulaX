# FormulaX

English | [简体中文](https://github.com/vndmea/formulaX/blob/main/README.zh-CN.md)

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
- Published adapter packages copy supporting CSS, images, and fonts into `dist` for bundler-friendly npm consumption
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

## Demos

- Demo hub: [https://vndmea.github.io/formulaX/](https://vndmea.github.io/formulaX/)
- Playground: [https://vndmea.github.io/formulaX/playground/](https://vndmea.github.io/formulaX/playground/)
- CKEditor 5 demo: [https://vndmea.github.io/formulaX/ckeditor5/](https://vndmea.github.io/formulaX/ckeditor5/)
- Tiptap demo: [https://vndmea.github.io/formulaX/tiptap/](https://vndmea.github.io/formulaX/tiptap/)
- TinyMCE demo: [https://vndmea.github.io/formulaX/tinymce/](https://vndmea.github.io/formulaX/tinymce/)
- Vue 3 + TinyMCE demo: [https://vndmea.github.io/formulaX/vue/](https://vndmea.github.io/formulaX/vue/)
- React + Tiptap v3 demo: [https://vndmea.github.io/formulaX/react/](https://vndmea.github.io/formulaX/react/)
- Svelte + CKEditor 5 demo: [https://vndmea.github.io/formulaX/svelte/](https://vndmea.github.io/formulaX/svelte/)

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
pnpm dev:react
pnpm dev:svelte
pnpm dev:tiptap
pnpm dev:tinymce
pnpm dev:vue
```

### Build

```bash
pnpm build
```

## Usage

APIs are experimental and may change before the first stable npm release.
Pass `locale: 'zh_CN'` when you need localized modal UI and legacy runtime labels. The default locale is `en_US`.

The examples below intentionally show more optional fields than a minimal setup so you can see the current configuration surface in one place.

### Shared Renderer Usage

```ts
import { createKityFormulaRenderer } from '@formulaxjs/renderer-kity';

const renderer = createKityFormulaRenderer({
  fontSize: 40, // default font size used by the Kity-backed renderer
  height: 320, // optional runtime workspace height when rendering
  assetCacheKey: 'formulax-cdn-v1', // optional cache namespace when asset URLs change
  assets: {
    // optional partial overrides when fonts / toolbar sprites / CSS live on your CDN
    styles: {
      editor: '/static/formulax/editor.css',
    },
  },
});

const { html } = await renderer.renderLatex('\\frac{a}{b}', {
  displayMode: false, // inline by default; set true for block-style rendering
  fontSize: 40, // per-render override
  className: 'formulax-inline', // custom wrapper class for rendered output
  throwOnError: false, // return fallback markup instead of throwing
  cache: true, // enable renderer-level caching
});
```

### Modal Editing UI

```ts
import {
  ensureFormulaXModalStyles,
  mountFormulaXEditor,
} from '@formulaxjs/editor';

ensureFormulaXModalStyles(document); // injects modal + base formula styles once

const mounted = mountFormulaXEditor(document.querySelector('#host') as HTMLElement, {
  initialLatex: '\\sqrt{x}', // optional initial formula
  height: 320, // modal editor body height
  autofocus: true, // focus editor after mount
  locale: 'zh_CN', // optional, defaults to en_US
  assets: {
    // optional partial asset override passed through to the Kity runtime
    styles: {
      editor: '/static/formulax/editor.css',
    },
  },
  render: {
    fontsize: 40, // font size used when generating preview HTML
  },
});

const latex = await mounted.getLatex();
const state = await mounted.getState();
const renderHtml = await mounted.getRenderHtml();

mounted.destroy();
```

### Low-Level Kity Runtime Entry

```ts
import { FormulaXEditor } from '@formulaxjs/kity-runtime';

const editor = new FormulaXEditor({
  el: '#app', // HTMLElement or selector
  initialLatex: '\\int_0^1 x^2 dx', // optional starting content
  height: 320, // runtime workspace height
  autofocus: true, // focus after mount
  assets: {
    // optional partial asset override
    styles: {
      editor: '/static/formulax/editor.css',
    },
  },
  render: {
    fontsize: 40, // preview / export font size
  },
});

await editor.execCommand('render', '\\frac{a}{b}'); // replace current formula content
await editor.focus();
await editor.destroy();
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
import { createFormulaXNode } from '@formulaxjs/tiptap';
import { createKityFormulaRenderer } from '@formulaxjs/renderer-kity';

const formulaNode = createFormulaXNode(undefined, {
  name: 'formulaX', // custom node name when avoiding schema collisions
  formulaClassName: 'formulax-math', // wrapper class written to DOM
  formulaAttributeName: 'data-formulax-latex', // where LaTeX is stored in the DOM
  cursorStyle: 'pointer', // cursor for inline formula widgets
  initialLatex: '\\placeholder ', // default content for newly inserted formulas
  preload: 'idle', // 'idle' | 'hover' | false
  renderer: createKityFormulaRenderer({
    fontSize: 40,
  }), // optional custom renderer
  modal: {
    title: 'FormulaX Editor',
    insertText: 'Insert',
    updateText: 'Update',
    cancelText: 'Cancel',
    closeOnBackdrop: true,
  },
  editor: {
    height: 320,
    autofocus: true,
    locale: 'zh_CN',
    assets: {},
    render: {
      fontsize: 40,
    },
  },
});

const editor = new Editor({
  element: document.querySelector('#editor'),
  extensions: [StarterKit, formulaNode],
  content: '<p>Click the FormulaX toolbar button to insert a formula.</p>',
});

editor.commands.openFormulaX();
```

### TinyMCE Integration

```ts
import tinymce from 'tinymce';
import 'tinymce/icons/default';
import 'tinymce/models/dom';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/skin';
import 'tinymce/skins/content/default/content';
import {
  createTinyMceFormulaMarkup,
  registerFormulaXTinyMcePlugin,
} from '@formulaxjs/tinymce';

registerFormulaXTinyMcePlugin(tinymce, {
  pluginName: 'formulax', // TinyMCE plugin id used in the plugins list
  buttonName: 'formulax', // toolbar button id used in the toolbar string
  menuItemName: 'formulax', // menu item id when adding the command to menus
  toolbarText: 'FormulaX',
  tooltip: 'Insert or edit formula',
  cursorStyle: 'pointer',
  formulaClassName: 'formulax-math',
  formulaAttributeName: 'data-formulax-latex',
  initialLatex: '\\sqrt{x}',
  preload: 'idle', // 'idle' | 'hover' | false
  modal: {
    title: 'FormulaX Editor',
    insertText: 'Insert',
    updateText: 'Update',
    cancelText: 'Cancel',
    width: '1100px',
    height: 'auto',
    closeOnBackdrop: true,
  },
  editor: {
    height: 320,
    autofocus: true,
    locale: 'zh_CN',
    assets: {},
    render: {
      fontsize: 40,
    },
  },
});

await tinymce.init({
  target: document.querySelector('#tiny-host'),
  plugins: 'formulax', // must match pluginName unless you customize both sides
  toolbar: 'undo redo | formulax',
  menubar: false,
  license_key: 'gpl',
});

const html = createTinyMceFormulaMarkup('\\sqrt{x}'); // optional content-level helper
```

### CKEditor 5 Integration

```ts
import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';
import { FormulaX } from '@formulaxjs/ckeditor5';

await ClassicEditor.create(document.querySelector('#editor')!, {
  licenseKey: 'GPL',
  plugins: [Essentials, Paragraph, FormulaX],
  toolbar: ['formulaX'], // must include buttonName when customized
  formulaX: {
    name: 'formulaX', // custom model name when avoiding schema collisions
    buttonName: 'formulaX',
    toolbarText: 'FormulaX',
    tooltip: 'Insert or edit formula',
    cursorStyle: 'pointer',
    formulaClassName: 'formulax-math',
    formulaAttributeName: 'data-formulax-latex',
    preload: 'idle', // 'idle' | 'hover' | false
    modal: {
      title: 'FormulaX Editor',
      insertText: 'Insert',
      updateText: 'Update',
      cancelText: 'Cancel',
      closeOnBackdrop: true,
    },
    editor: {
      height: 320,
      autofocus: true,
      locale: 'zh_CN',
      assets: {},
      render: {
        fontsize: 40,
      },
    },
  },
});
```

### Framework Demo References

- `apps/vue-demo` shows Vue 3 + TinyMCE v7 using the published `@formulaxjs/tinymce` package directly
- `apps/react-demo` shows React + Tiptap v3 using `@formulaxjs/tiptap`
- `apps/svelte-demo` shows Svelte + CKEditor 5 using `@formulaxjs/ckeditor5`

## Workspace Scripts

- `pnpm dev` - Start the standalone FormulaX playground
- `pnpm dev:ckeditor5` - Start the CKEditor 5 demo
- `pnpm dev:react` - Start the React + Tiptap v3 demo
- `pnpm dev:svelte` - Start the Svelte + CKEditor 5 demo
- `pnpm dev:tiptap` - Start the Tiptap demo
- `pnpm dev:tinymce` - Start the TinyMCE demo
- `pnpm dev:vue` - Start the Vue 3 + TinyMCE v7 demo
- `pnpm build` - Build all packages and demo apps
- `pnpm build:packages` - Build workspace packages only
- `pnpm build:pages` - Build GitHub Pages demo hub
- `pnpm changeset` - Create a changeset for package release notes and version intent
- `pnpm changeset:version` - Apply pending changesets and update package versions/changelogs
- `pnpm changeset:publish` - Publish versioned packages to npm
- `pnpm release` - Build packages and publish via Changesets
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm test` - Run Vitest unit tests
- `pnpm test:browser` - Run Playwright browser tests

## Acknowledgements / Attribution

FormulaX contains code adapted from Baidu FEX Team's [KityFormula](https://github.com/BaiduFE/kityformula) / kf-editor ecosystem.

KityFormula-related code and assets retain their original copyright and license notices.
