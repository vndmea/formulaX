# @formulaxjs/tiptap

English | [简体中文](https://github.com/vndmea/formulaX/blob/main/packages/tiptap/README.zh-CN.md)

Tiptap integration adapter for FormulaX.

`@formulaxjs/tiptap` provides a FormulaX inline node extension for Tiptap and a modal-based formula editing flow. By default it persists LaTeX and renders runtime SVG. In `output: 'image'` mode it also persists uploaded PNG metadata in node attrs.

> Status: experimental. Public APIs may change before the first stable release.

## Features

- Tiptap node extension export through `FormulaXNode`
- Extension factory export through `createFormulaXNode`
- `openFormulaX` command for toolbar buttons or programmatic opening
- Double-click editing for existing formulas
- Default SVG persistence in node attrs
- Optional `output: 'image'` PNG persistence with user-provided upload
- Runtime SVG rendering in the node view
- Default read-only rendering through `@formulaxjs/renderer-kity`
- Optional runtime preload before the first modal open
- Modal helper export through `openFormulaXTiptapModal`
- Compatible peer dependency range for Tiptap 2 and 3

## Compatibility

The package declares `@tiptap/core` as an optional peer dependency:

```json
{
  "@tiptap/core": ">=2 <4"
}
```

The workspace demo can switch between Tiptap 2 and 3 for compatibility verification.

## Install

When the package is published:

```bash
npm install @formulaxjs/tiptap @tiptap/core
```

Inside the FormulaX workspace, use the workspace package directly:

```bash
pnpm install
pnpm dev:tiptap
```

## Basic usage

Create the FormulaX node extension and add it to the Tiptap extension list:

```ts
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { createFormulaXNode } from '@formulaxjs/tiptap';

const editor = new Editor({
  element: document.querySelector('#editor')!,
  extensions: [
    StarterKit,
    createFormulaXNode(undefined, {
      editor: {
        locale: 'zh_CN', // optional, defaults to en_US
      },
    }),
  ],
  content: '<p>Click the toolbar button to insert a formula.</p>',
});
```

To open the FormulaX modal programmatically:

```ts
editor.commands.openFormulaX();
```

## Custom node names

The default Tiptap node name is `formulaX`.

If the host editor already uses that name, pass a custom `name` when creating the extension:

```ts
const editor = new Editor({
  element: document.querySelector('#editor')!,
  extensions: [
    StarterKit,
    createFormulaXNode(undefined, {
      name: 'inlineMath',
    }),
  ],
});
```

If Tiptap detects that the configured node name is already registered, the extension logs a `console.warn` message so you can rename it before the schema collides.

## Persisted data

The default Tiptap node stores only the LaTeX source:

```json
{
  "type": "formulaX",
  "attrs": {
    "latex": "\\sqrt{x}"
  }
}
```

When `output: 'image'` is enabled, the node also stores `output`, `imageUrl`, `imageWidth`, `imageHeight`, and `imageStyle`, and the rendered DOM uses an `<img>` while still preserving the source LaTeX on the wrapper element.

## PNG image output

```ts
const formulaXNode = createFormulaXNode(undefined, {
  output: 'image',
  image: {
    scale: 2,
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

      return {
        url: (await response.json()).url,
      };
    },
  },
});
```

## Custom renderer

The adapter accepts a `renderer` option. By default it uses `createKityFormulaRenderer()` from `@formulaxjs/renderer-kity`.

```ts
import { createFormulaXNode } from '@formulaxjs/tiptap';
import { createKityFormulaRenderer } from '@formulaxjs/renderer-kity';

const formulaXNode = createFormulaXNode(undefined, {
  renderer: createKityFormulaRenderer({
    fontSize: 44,
  }),
});
```

## Options

```ts
interface FormulaXTiptapOptions {
  name?: string;
  formulaClassName?: string;
  formulaAttributeName?: string;
  cursorStyle?: string;
  initialLatex?: string;
  output?: 'svg' | 'image';
  image?: FormulaXImageOptions;
  renderer?: FormulaRenderer;
  preload?: FormulaXEditorPreloadMode;
  modal?: {
    title?: string;
    insertText?: string;
    updateText?: string;
    cancelText?: string;
    closeOnBackdrop?: boolean;
  };
  editor?: {
    height?: number | string;
    autofocus?: boolean;
    locale?: FormulaXLocale;
    assets?: Partial<KityEditorAssets>;
    render?: {
      fontsize?: number;
    };
  };
}
```

| Option | Default | Description |
| --- | --- | --- |
| `name` | `formulaX` | Tiptap node name used in the document schema. |
| `formulaClassName` | `formulax-math` | CSS class used by rendered formula nodes. |
| `formulaAttributeName` | `data-formulax-latex` | Attribute used in rendered DOM for the source LaTeX. |
| `cursorStyle` | `pointer` | Cursor style applied to rendered formula nodes. |
| `initialLatex` | empty string | Initial LaTeX when inserting a new formula. |
| `output` | `svg` | Persists formulas as runtime SVG metadata or uploaded PNG metadata. |
| `image` | `undefined` | PNG upload settings used when `output` is `image`. |
| `renderer` | `createKityFormulaRenderer()` | Renderer used for read-only formula output in the node view. |
| `preload` | `idle` | Preloads the FormulaX runtime on browser idle, on host hover/focus, or never. |
| `modal` | see below | Modal labels and closing behavior. |
| `editor` | see below | Embedded FormulaX editor options. |

### Modal options

| Option | Default | Description |
| --- | --- | --- |
| `title` | `FormulaX Editor` | Modal title. |
| `insertText` | `Insert` | Submit button text when inserting. |
| `updateText` | `Update` | Submit button text when updating. |
| `cancelText` | `Cancel` | Cancel button text. |
| `closeOnBackdrop` | `true` | Whether clicking the backdrop closes the modal. |

### Editor options

| Option | Default | Description |
| --- | --- | --- |
| `height` | `100%` | Embedded editor height. |
| `autofocus` | `true` | Whether the embedded editor should autofocus. |
| `locale` | `en_US` | Localizes the modal defaults and the embedded Kity runtime UI. |
| `assets` | `{}` | Optional Kity runtime asset overrides. |
| `render.fontsize` | `40` | Formula render font size. |

## Exported API

| Export | Description |
| --- | --- |
| `FormulaXNode` | Default FormulaX Tiptap node extension. |
| `createFormulaXNode` | Creates a FormulaX node extension, optionally with custom options. |
| `resolveOptions` | Resolves user options into required defaults. |
| `openFormulaXTiptapModal` | Opens the FormulaX modal directly. |
| `FORMULAX_NODE_NAME` | Default Tiptap node name. |
| `createFormulaXPayload` | Parses LaTeX into a FormulaX document. |
| `serializeFormulaXPayload` | Serializes a FormulaX document back to LaTeX. |

## Development

From the repository root:

```bash
pnpm install
pnpm dev:tiptap
```

Build only this package:

```bash
pnpm --filter @formulaxjs/tiptap build
```

Run package tests:

```bash
pnpm --filter @formulaxjs/tiptap test
```

Run package type checking:

```bash
pnpm --filter @formulaxjs/tiptap typecheck
```

## Demo

Local demo:

```bash
pnpm dev:tiptap
```

GitHub Pages demo:

[https://vndmea.github.io/formulaX/tiptap/](https://vndmea.github.io/formulaX/tiptap/)
