# @formulax/ckeditor5

English | [简体中文](./README.zh-CN.md)

CKEditor 5 integration adapter for FormulaX.

`@formulax/ckeditor5` provides a CKEditor 5 plugin that opens the FormulaX editor in a modal for inserting and updating inline formulas inside CKEditor 5 content.

> Status: experimental. Public APIs may change before the first stable release.

## Features

- CKEditor 5 plugin export through `FormulaX`
- Toolbar button registration driven by CKEditor 5 `componentFactory`
- Programmatic opening through `editor.execute('formulaX')`
- Insert and update formulas as inline widget objects
- Double-click editing for existing formulas
- Formula source persistence through `data-formulax-latex`
- Upcast and downcast support for formula markup in editor data
- Direct modal helper export through `openFormulaXModal`

## Compatibility

The package declares CKEditor 5 as an optional peer dependency:

```json
{
  "ckeditor5": ">=42 <49"
}
```

Inside this workspace, the demo app currently uses CKEditor 5 `46.1.1`.

## Install

When the package is published:

```bash
pnpm add @formulax/ckeditor5
pnpm add ckeditor5
```

Inside the FormulaX workspace, use the workspace package directly:

```bash
pnpm install
pnpm dev:ckeditor5
```

## Basic usage

Add `FormulaX` to the CKEditor 5 plugin list and configure the toolbar item:

```ts
import {
  ClassicEditor,
  Essentials,
  Paragraph,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

import { FormulaX } from '@formulax/ckeditor5';

await ClassicEditor.create(document.querySelector('#editor')!, {
  licenseKey: 'GPL',
  plugins: [
    Essentials,
    Paragraph,
    FormulaX,
  ],
  toolbar: ['formulaX'],
  formulaX: {
    toolbarText: 'FormulaX',
    tooltip: 'Insert or edit formula',
    modal: {
      title: 'FormulaX Editor',
    },
    editor: {
      render: {
        fontsize: 40,
      },
    },
  },
} as any);
```

Then users can click the `FormulaX` toolbar button to insert a formula. Existing formulas can be updated by double-clicking them, or by selecting them and executing the same command again.

## Programmatic opening

The plugin registers a command whose name matches `buttonName`. With the default configuration:

```ts
editor.execute('formulaX');
```

## Custom button names

The default toolbar button and command name is `formulaX`.

If you customize it, keep the CKEditor 5 `toolbar` configuration aligned with the custom name:

```ts
await ClassicEditor.create(document.querySelector('#editor')!, {
  plugins: [Essentials, Paragraph, FormulaX],
  toolbar: ['myFormulaX'],
  formulaX: {
    buttonName: 'myFormulaX',
    toolbarText: 'FormulaX',
  },
} as any);
```

Programmatic opening should use the same custom command name:

```ts
editor.execute('myFormulaX');
```

## Persisted markup

Generated formula nodes are marked with `data-formulax="true"` and store the source LaTeX in `data-formulax-latex` by default:

```html
<span
  class="formulax-math"
  data-formulax="true"
  data-formulax-latex="\\sqrt{x}"
  data-latex="\\sqrt{x}"
  contenteditable="false"
  role="button"
  tabindex="0"
></span>
```

The exact inner HTML used to render the formula is internal and may evolve. Consumers should rely on the plugin and exported options rather than hard-coding the full markup shape.

## Options

```ts
interface FormulaXCKEditor5Options {
  buttonName?: string;
  toolbarText?: string;
  tooltip?: string;
  formulaClassName?: string;
  formulaAttributeName?: string;
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
| `buttonName` | `formulaX` | CKEditor 5 toolbar button name and command name. |
| `toolbarText` | `FormulaX` | Toolbar button label. |
| `tooltip` | `Insert or edit formula` | Toolbar button tooltip. |
| `formulaClassName` | `formulax-math` | CSS class used by generated formula nodes. |
| `formulaAttributeName` | `data-formulax-latex` | Attribute used to persist source LaTeX. |
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
| `FormulaX` | CKEditor 5 plugin class. |
| `default` | Same as `FormulaX`. |
| `FormulaXCommand` | Command implementation used by the plugin. |
| `resolveOptions` | Resolves user options into required defaults. |
| `openFormulaXModal` | Opens the FormulaX modal directly. |
| `DEFAULT_BUTTON_NAME` | Default CKEditor 5 command and toolbar button name. |
| `DEFAULT_FORMULA_ATTRIBUTE` | Default LaTeX persistence attribute name. |
| `DEFAULT_FORMULA_CLASS` | Default CSS class for formula nodes. |
| `FORMULA_FLAG_ATTRIBUTE` | Attribute used to identify FormulaX nodes in editor data. |

## Development

From the repository root:

```bash
pnpm install
pnpm dev:ckeditor5
```

Build only this package:

```bash
pnpm --filter @formulax/ckeditor5 build
```

Run package type checking:

```bash
pnpm --filter @formulax/ckeditor5 typecheck
```

## Demo

Local demo:

```bash
pnpm dev:ckeditor5
```

GitHub Pages demo:

[https://vndmea.github.io/formulaX/ckeditor5/](https://vndmea.github.io/formulaX/ckeditor5/)
