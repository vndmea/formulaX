# @formulaxjs/ckeditor5

English | [简体中文](https://github.com/vndmea/formulaX/blob/main/packages/ckeditor5/README.zh-CN.md)

CKEditor 5 integration adapter for FormulaX.

`@formulaxjs/ckeditor5` provides a CKEditor 5 plugin that opens the FormulaX editor in a modal for inserting and updating inline formulas inside CKEditor 5 content.

> Status: experimental. Public APIs may change before the first stable release.

## Features

- CKEditor 5 plugin export through `FormulaX`
- Toolbar button registration driven by CKEditor 5 `componentFactory`
- Default SVG toolbar icon with optional custom SVG override
- Programmatic opening through `editor.execute('formulaX')`
- Insert and update formulas as inline widget objects
- Double-click editing for existing formulas
- Default SVG persistence in the CKEditor 5 model
- Optional `output: 'image'` PNG persistence with user-provided upload
- Runtime SVG rendering in the editing view
- Default read-only rendering through `@formulaxjs/renderer-kity`
- Optional runtime preload before the first modal open
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
npm install @formulaxjs/ckeditor5 ckeditor5
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

import {
  FORMULAX_DEFAULT_FORMULA_ICON_SVG,
  FormulaX,
} from '@formulaxjs/ckeditor5';
import { createKityFormulaRenderer } from '@formulaxjs/renderer-kity';

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
    formulaIcon: FORMULAX_DEFAULT_FORMULA_ICON_SVG,
    tooltip: 'Insert or edit formula',
    modal: {
      title: 'FormulaX Editor',
    },
    renderer: createKityFormulaRenderer({
      fontSize: 40,
    }),
    editor: {
      locale: 'zh_CN', // optional, defaults to en_US
      render: {
        fontsize: 40,
      },
    },
  },
} as any);
```

Then users can click the `FormulaX` toolbar button to insert a formula. Existing formulas can be updated by double-clicking them, or by selecting them and executing the same command again.

If you omit `formulaIcon`, the adapter uses the built-in FormulaX SVG icon by default.

The CKEditor 5 toolbar button is rendered as an icon-only control by default. `toolbarText` still provides the accessible label and readable action text, while the visible toolbar UI uses the configured SVG icon plus `tooltip`.

## Custom model names

The default CKEditor 5 model name is `formulaX`.

If the host editor already uses that model name, pass a custom `name` in the `formulaX` config:

```ts
await ClassicEditor.create(document.querySelector('#editor')!, {
  plugins: [Essentials, Paragraph, FormulaX],
  toolbar: ['formulaX'],
  formulaX: {
    name: 'inlineMath',
  },
} as any);
```

If CKEditor 5 detects that the configured model name is already registered, the plugin logs a `console.error` and skips registration so the editor does not silently create a conflicting schema definition.

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

## Persisted data and markup

The default CKEditor 5 model stores only the formula source LaTeX:

```ts
<formulaX latex="\\sqrt{x}" />
```

When editor data is downcast to HTML, generated formula nodes are marked with `data-formulax="true"` and store the source LaTeX in `data-formulax-latex` by default:

```html
<span
  class="formulax-math"
  data-formulax="true"
  data-formulax-latex="\\sqrt{x}"
  data-latex="\\sqrt{x}"
  contenteditable="false"
  role="button"
  style="cursor: pointer"
  tabindex="0"
></span>
```

When `output: 'image'` is enabled, the model also stores `output`, `imageUrl`, `imageWidth`, `imageHeight`, and `imageStyle`, and downcast HTML renders an `<img>` while preserving the source LaTeX on the outer wrapper.

## PNG image output

```ts
await ClassicEditor.create(document.querySelector('#editor')!, {
  plugins: [Essentials, Paragraph, FormulaX],
  toolbar: ['formulaX'],
  formulaX: {
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
  },
} as any);
```

## Custom renderer

The adapter accepts a `renderer` option. By default it uses `createKityFormulaRenderer()` from `@formulaxjs/renderer-kity`.

## Options

```ts
interface FormulaXCKEditor5Options {
  name?: string;
  buttonName?: string;
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
| `name` | `formulaX` | CKEditor 5 model/schema element name used for persisted formula nodes. |
| `buttonName` | `formulaX` | CKEditor 5 toolbar button name and command name. |
| `toolbarText` | `FormulaX` | Accessible toolbar label and readable action text. The default toolbar UI is icon-only. |
| `formulaIcon` | built-in SVG | Toolbar button SVG icon passed to CKEditor 5 `ButtonView`. |
| `formulaIconName` | `formulax-formula` | Shared FormulaX icon id. Useful when you keep icon metadata aligned across adapters. |
| `tooltip` | `Insert or edit formula` | Toolbar button tooltip. |
| `cursorStyle` | `pointer` | Cursor style applied to generated formula nodes. |
| `formulaClassName` | `formulax-math` | CSS class used by generated formula nodes. |
| `formulaAttributeName` | `data-formulax-latex` | Attribute used to persist source LaTeX. |
| `output` | `svg` | Persists formulas as runtime SVG metadata or uploaded PNG metadata. |
| `image` | `undefined` | PNG upload settings used when `output` is `image`. |
| `renderer` | `createKityFormulaRenderer()` | Renderer used for runtime SVG output in the editing view. |
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
| `FormulaX` | CKEditor 5 plugin class. |
| `default` | Same as `FormulaX`. |
| `FormulaXCommand` | Command implementation used by the plugin. |
| `resolveOptions` | Resolves user options into required defaults. |
| `openFormulaXModal` | Opens the FormulaX modal directly. |
| `FORMULAX_DEFAULT_FORMULA_ICON_SVG` | Built-in FormulaX toolbar SVG icon string. |
| `FORMULAX_DEFAULT_ICON_NAME` | Shared default FormulaX icon registry name. |
| `resolveFormulaXFormulaIcon` | Resolves a custom or default FormulaX toolbar SVG icon. |
| `resolveFormulaXFormulaIconName` | Resolves a custom or default FormulaX icon registry name. |
| `normalizeFormulaXIconSvg` | Trims developer-supplied SVG icon markup. |
| `DEFAULT_MODEL_NAME` | Default CKEditor 5 model name. |
| `DEFAULT_BUTTON_NAME` | Default CKEditor 5 command and toolbar button name. |
| `FormulaXIconOptions` | Shared icon configuration type for CKEditor 5 integrations. |
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
pnpm --filter @formulaxjs/ckeditor5 build
```

Run package type checking:

```bash
pnpm --filter @formulaxjs/ckeditor5 typecheck
```

## Demo

Local demo:

```bash
pnpm dev:ckeditor5
```

GitHub Pages demo:

[https://vndmea.github.io/formulaX/ckeditor5/](https://vndmea.github.io/formulaX/ckeditor5/)
