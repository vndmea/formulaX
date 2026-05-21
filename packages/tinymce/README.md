# @formulaxjs/tinymce

English | [简体中文](https://github.com/vndmea/formulaX/blob/main/packages/tinymce/README.zh-CN.md)

TinyMCE integration adapter for FormulaX.

`@formulaxjs/tinymce` registers FormulaX as a TinyMCE plugin and provides a modal-based formula editing experience for inserting and updating formulas inside TinyMCE content.

> Status: experimental. Public APIs may change before the first stable release.

## Features

- TinyMCE plugin registration through `registerFormulaXTinyMcePlugin`
- FormulaX toolbar button and menu item support
- Default SVG toolbar icon registration with optional custom SVG override
- Host-managed disabled toolbar state in readonly or non-editable contexts
- `FormulaXOpen` TinyMCE command for programmatic opening
- Insert and update formulas as non-editable inline nodes
- Double-click, Enter, and Space editing interactions for existing formulas
- TinyMCE compatibility layer for versions `>=5 <9`
- LaTeX persistence through `data-formulax-latex`
- Optional `output: 'image'` PNG persistence with user-provided upload
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
import {
  FORMULAX_DEFAULT_FORMULA_ICON_SVG,
  registerFormulaXTinyMcePlugin,
} from '@formulaxjs/tinymce';

registerFormulaXTinyMcePlugin(tinymce, {
  pluginName: 'formulax', // TinyMCE plugin id used in the plugins list
  buttonName: 'formulax', // toolbar button id used in the toolbar string
  menuItemName: 'formulax', // menu item id if you also expose the action in menus
  toolbarText: 'FormulaX', // used by the menu item label
  formulaIconName: 'formulax-formula',
  formulaIcon: FORMULAX_DEFAULT_FORMULA_ICON_SVG, // optional; omit to use the built-in icon
  tooltip: 'Insert or edit formula',
  cursorStyle: 'pointer', // cursor applied to generated formula nodes
  formulaClassName: 'formulax-math', // DOM class written on formula wrappers
  formulaAttributeName: 'data-formulax-latex', // attribute that stores source LaTeX
  output: 'svg', // 'svg' | 'image'
  initialLatex: '\\sqrt{x}', // default LaTeX for newly inserted formulas
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

      return {
        url: (await response.json()).url,
      };
    },
  },
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
    // forwarded to the embedded FormulaX editor instance
    locale: 'zh_CN', // optional, defaults to en_US
    height: 320,
    autofocus: true,
    assets: {},
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

The TinyMCE toolbar button is rendered as an icon-only control. `toolbarText` is used for the menu item label, while the toolbar button itself uses `tooltip` plus the registered SVG icon.

If you omit `formulaIcon`, the adapter automatically registers the built-in FormulaX SVG icon under `formulax-formula`.

When the host editor enters a non-editable or readonly mode, TinyMCE controls the disabled styling for the FormulaX toolbar button and menu item so they match the rest of the native toolbar UI.

## PNG image output

Set `output: 'image'` and provide `image.upload` when formulas should be persisted as uploaded PNG images instead of inline SVG:

```ts
registerFormulaXTinyMcePlugin(tinymce, {
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

The outer formula wrapper still preserves `data-formulax-latex`, so existing double-click editing flows continue to work.

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
  formulaIcon?: string;
  formulaIconName?: string;
  tooltip?: string;
  cursorStyle?: string;
  formulaClassName?: string;
  formulaAttributeName?: string;
  output?: 'svg' | 'image';
  image?: FormulaXImageOptions;
  renderer?: FormulaRenderer;
  preload?: FormulaXEditorPreloadMode;
  initialLatex?: string;
  modal?: FormulaXModalOptions;
  editor?: Omit<FormulaXEditorOptions, 'initialLatex'>;
}
```

| Option | Default | Description |
| --- | --- | --- |
| `pluginName` | `formulax` | TinyMCE plugin name registered through `tinymce.PluginManager.add`. |
| `buttonName` | `formulax` | Toolbar button name. |
| `menuItemName` | `formulax` | Menu item name. |
| `toolbarText` | `FormulaX` | Menu item label and readable action text. The toolbar button itself is icon-only. |
| `formulaIcon` | built-in SVG | Toolbar icon SVG string used for the TinyMCE icon registry. |
| `formulaIconName` | `formulax-formula` | Toolbar icon registry name passed to `editor.ui.registry.addIcon()`. |
| `tooltip` | `Insert formula` | Toolbar button tooltip. |
| `cursorStyle` | `pointer` | Cursor style applied to generated formula nodes. |
| `formulaClassName` | `formulax-math` | CSS class used by generated formula nodes. |
| `formulaAttributeName` | `data-formulax-latex` | Attribute used to persist source LaTeX. |
| `output` | `svg` | Persists formulas as inline SVG or uploaded PNG image markup. |
| `image` | `undefined` | PNG upload settings used when `output` is `image`. |
| `renderer` | `createKityFormulaRenderer()` | Renderer used when the plugin needs runtime formula HTML. |
| `preload` | `idle` | Preloads the FormulaX runtime on browser idle, on host hover/focus, or never. |
| `initialLatex` | empty string | Initial LaTeX when inserting a new formula. |
| `modal` | see below | Modal labels, dimensions, and closing behavior. |
| `editor` | see below | Embedded FormulaX editor options. |

### Modal options

| Option | Default | Description |
| --- | --- | --- |
| `title` | `FormulaX Editor` | Modal title. |
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
| `locale` | `en_US` | Localizes the modal defaults and the embedded Kity runtime UI. |
| `assets` | `{}` | Optional Kity runtime asset overrides. |
| `render.fontsize` | `40` | Formula render font size. |

## Exported API

| Export | Description |
| --- | --- |
| `registerFormulaXTinyMcePlugin` | Registers the TinyMCE plugin. |
| `resolveOptions` | Resolves user options into required defaults. |
| `openFormulaXOverlayModal` | Opens the FormulaX modal directly. |
| `FORMULAX_DEFAULT_FORMULA_ICON_SVG` | Built-in FormulaX toolbar SVG icon string. |
| `FORMULAX_DEFAULT_ICON_NAME` | Shared default FormulaX icon registry name. |
| `resolveFormulaXFormulaIcon` | Resolves a custom or default FormulaX toolbar SVG icon. |
| `resolveFormulaXFormulaIconName` | Resolves a custom or default FormulaX icon registry name. |
| `normalizeFormulaXIconSvg` | Trims developer-supplied SVG icon markup. |
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
