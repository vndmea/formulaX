# @formulaxjs/tinymce

English | [简体中文](./README.zh-CN.md)

TinyMCE integration adapter for FormulaX.

`@formulaxjs/tinymce` registers FormulaX as a TinyMCE plugin and provides a modal-based formula editing experience for inserting and updating formulas inside TinyMCE content.

> Status: experimental. Public APIs may change before the first stable release.

## Features

- TinyMCE plugin registration through `registerFormulaXTinyMcePlugin`
- FormulaX toolbar button and menu item support
- `FormulaXOpen` TinyMCE command for programmatic opening
- Insert and update formulas as non-editable inline nodes
- Double-click, Enter, and Space editing interactions for existing formulas
- TinyMCE compatibility layer for versions `>=5 <9`
- LaTeX persistence through `data-formulax-latex`
- Markup helpers for creating, parsing, serializing, finding, and replacing formula elements
- Default read-only rendering through `@formulaxjs/renderer-kity`
- Optional runtime preload before the first modal open

## Compatibility

The package declares TinyMCE as an optional peer dependency:

```json
{
  "tinymce": ">=5 <9"
}
```

The adapter is designed for TinyMCE 5, 6, 7, and 8. Unsupported major versions will emit a console warning.

The workspace demo can dynamically load TinyMCE 5, 6, 7, or 8 from CDN for compatibility verification.

## Install

When the package is published:

```bash
npm install @formulaxjs/tinymce tinymce
```

Inside the FormulaX workspace, use the workspace package directly:

```bash
pnpm install
pnpm dev:tinymce
```

## Basic usage

Register the FormulaX TinyMCE plugin before calling `tinymce.init`:

```ts
import tinymce from 'tinymce';
import { registerFormulaXTinyMcePlugin } from '@formulaxjs/tinymce';

registerFormulaXTinyMcePlugin(tinymce, {
  toolbarText: 'FormulaX',
  tooltip: 'Insert or edit formula',
  modal: {
    title: 'FormulaX Editor',
  },
  editor: {
    height: '100%',
    autofocus: true,
    render: { fontsize: 40 },
  },
});

await tinymce.init({
  selector: '#editor',
  height: 420,
  menubar: false,
  plugins: 'formulax',
  toolbar: 'undo redo | formulax',
  license_key: 'gpl',
});
```

Then users can click the `FormulaX` toolbar button to insert a formula. Existing formulas can be edited by double-clicking them or selecting them and pressing Enter or Space.

## Programmatic opening

The plugin registers the `FormulaXOpen` command:

```ts
editor.execCommand('FormulaXOpen');
```

## Custom plugin names

The default plugin, button, and menu item names are all `formulax`.

If you customize them, keep the TinyMCE `plugins` and `toolbar` configuration aligned with the custom names:

```ts
registerFormulaXTinyMcePlugin(tinymce, {
  pluginName: 'formulaXPlugin',
  buttonName: 'formulaXButton',
  menuItemName: 'formulaXMenuItem',
});

await tinymce.init({
  selector: '#editor',
  plugins: 'formulaXPlugin',
  toolbar: 'formulaXButton',
});
```

## Formula markup helpers

Use markup helpers when you need to generate or inspect FormulaX formula nodes outside the plugin UI:

```ts
import {
  createTinyMceFormulaMarkup,
  getFormulaLatexFromElement,
  isFormulaElement,
  replaceFormulaElement,
} from '@formulaxjs/tinymce';

const html = createTinyMceFormulaMarkup('\\sqrt{x}');

const element = document.querySelector('[data-formulax="true"]');
if (isFormulaElement(element)) {
  const latex = getFormulaLatexFromElement(element);
  replaceFormulaElement(element, `${latex}+1`);
}
```

A generated formula node stores the source LaTeX in `data-formulax-latex` and is marked with `data-formulax="true"`:

```html
<span
  class="formulax-math"
  data-formulax="true"
  data-formulax-latex="\\sqrt{x}"
  data-latex="\\sqrt{x}"
  contenteditable="false"
  data-mce-contenteditable="false"
  style="cursor: pointer"
></span>
```

The exact generated markup is internal and may evolve. Consumers should rely on the exported helper functions where possible.

## Custom renderer

The adapter accepts a `renderer` option. By default it uses `createKityFormulaRenderer()` from `@formulaxjs/renderer-kity`.

```ts
import tinymce from 'tinymce';
import { registerFormulaXTinyMcePlugin } from '@formulaxjs/tinymce';
import { createKityFormulaRenderer } from '@formulaxjs/renderer-kity';

registerFormulaXTinyMcePlugin(tinymce, {
  renderer: createKityFormulaRenderer({
    fontSize: 44,
  }),
});
```

## Options

```ts
interface FormulaXTinyMceOptions {
  pluginName?: string;
  buttonName?: string;
  menuItemName?: string;
  toolbarText?: string;
  tooltip?: string;
  cursorStyle?: string;
  formulaClassName?: string;
  formulaAttributeName?: string;
  renderer?: FormulaRenderer;
  preload?: FormulaXEditorPreloadMode;
  initialLatex?: string;
  modal?: FormulaXModalOptions;
  editor?: FormulaXEditorOptions;
}
```

| Option | Default | Description |
| --- | --- | --- |
| `pluginName` | `formulax` | TinyMCE plugin name registered through `tinymce.PluginManager.add`. |
| `buttonName` | `formulax` | Toolbar button name. |
| `menuItemName` | `formulax` | Menu item name. |
| `toolbarText` | `FormulaX` | Toolbar and menu item label. |
| `tooltip` | `Insert formula` | Toolbar button tooltip. |
| `cursorStyle` | `pointer` | Cursor style applied to generated formula nodes. |
| `formulaClassName` | `formulax-math` | CSS class used by generated formula nodes. |
| `formulaAttributeName` | `data-formulax-latex` | Attribute used to persist source LaTeX. |
| `renderer` | `createKityFormulaRenderer()` | Renderer used when the plugin needs runtime formula HTML. |
| `preload` | `idle` | Preloads the FormulaX runtime on browser idle, on host hover/focus, or never. |
| `initialLatex` | empty string | Initial LaTeX when inserting a new formula. |
| `modal` | see below | Modal labels, dimensions, and closing behavior. |
| `editor` | see below | Embedded FormulaX editor options. |

### Modal options

| Option | Default | Description |
| --- | --- | --- |
| `title` | `FormulaX` | Modal title. |
| `insertText` | `Insert` | Submit button text when inserting. |
| `updateText` | `Update` | Submit button text when updating. |
| `cancelText` | `Cancel` | Cancel button text. |
| `width` | `1100px` | Modal width. |
| `height` | `auto` | Modal height. |
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
| `registerFormulaXTinyMcePlugin` | Registers the TinyMCE plugin. |
| `resolveOptions` | Resolves user options into required defaults. |
| `openFormulaXOverlayModal` | Opens the FormulaX modal directly. |
| `createTinyMceFormulaMarkup` | Creates formula HTML from LaTeX. |
| `parseTinyMceFormulaMarkup` | Parses LaTeX into a FormulaX document. |
| `serializeTinyMceFormulaMarkup` | Serializes a FormulaX document into TinyMCE formula HTML. |
| `getFormulaLatexFromElement` | Reads source LaTeX from a formula element. |
| `findFormulaElement` | Finds the nearest FormulaX formula element. |
| `isFormulaElement` | Checks whether a node is a FormulaX formula element. |
| `replaceFormulaElement` | Replaces an existing formula element with updated markup. |
| `getTinyMceMajorVersion` | Reads the TinyMCE major version. |
| `createTinyMceCompat` | Creates the internal TinyMCE compatibility facade. |
| `warnUnsupportedTinyMceVersion` | Emits a warning for unsupported TinyMCE versions. |

## Development

From the repository root:

```bash
pnpm install
pnpm dev:tinymce
```

Build only this package:

```bash
pnpm --filter @formulaxjs/tinymce build
```

Run package tests:

```bash
pnpm --filter @formulaxjs/tinymce test
```

Run package type checking:

```bash
pnpm --filter @formulaxjs/tinymce typecheck
```

## Demo

Local demo:

```bash
pnpm dev:tinymce
```

GitHub Pages demo:

[https://vndmea.github.io/formulaX/tinymce/](https://vndmea.github.io/formulaX/tinymce/)

The demo includes a TinyMCE version selector and is intended to stay close to the standalone FormulaX playground experience.

## Notes and limitations

- TinyMCE versions below 5 and 9 or newer are not officially supported.
- The API is still experimental.
- If your host TinyMCE configuration performs strict content filtering, ensure FormulaX formula spans and SVG output are allowed.
- The current editing UI uses the FormulaX Kity-compatible runtime.

## License

FormulaX license information should be reviewed before public npm publishing.

KityFormula-related code and assets retain their original copyright and license notices.
