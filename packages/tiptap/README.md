# @formulaxjs/tiptap

English | [简体中文](./README.zh-CN.md)

Tiptap integration adapter for FormulaX.

`@formulaxjs/tiptap` provides a FormulaX inline node extension for Tiptap and a modal-based formula editing flow. The extension persists only LaTeX in the document model and renders formula output at runtime.

> Status: experimental. Public APIs may change before the first stable release.

## Features

- Tiptap node extension export through `FormulaXNode`
- Extension factory export through `createFormulaXNode`
- `openFormulaX` command for toolbar buttons or programmatic opening
- Double-click editing for existing formulas
- Persist only LaTeX in node attrs
- Runtime SVG rendering in the node view
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
pnpm add @formulaxjs/tiptap
pnpm add @tiptap/core
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
    createFormulaXNode(),
  ],
  content: '<p>Click the toolbar button to insert a formula.</p>',
});
```

To open the FormulaX modal programmatically:

```ts
editor.commands.openFormulaX();
```

## Persisted data

The Tiptap node stores only the LaTeX source:

```json
{
  "type": "formulaX",
  "attrs": {
    "latex": "\\sqrt{x}"
  }
}
```

The node view renders formula SVG at runtime from the stored LaTeX. Generated DOM markup includes `data-formulax="true"` and `data-formulax-latex`, but that rendered DOM is not the persisted source of truth.

## Options

```ts
interface FormulaXTiptapOptions {
  formulaClassName?: string;
  formulaAttributeName?: string;
  cursorStyle?: string;
  initialLatex?: string;
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
    assets?: Partial<KityEditorAssets>;
    render?: {
      fontsize?: number;
    };
  };
}
```

| Option | Default | Description |
| --- | --- | --- |
| `formulaClassName` | `formulax-math` | CSS class used by rendered formula nodes. |
| `formulaAttributeName` | `data-formulax-latex` | Attribute used in rendered DOM for the source LaTeX. |
| `cursorStyle` | `pointer` | Cursor style applied to rendered formula nodes. |
| `initialLatex` | empty string | Initial LaTeX when inserting a new formula. |
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
