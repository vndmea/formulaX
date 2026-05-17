# @formulaxjs/editor

Modal-oriented FormulaX editor UI helpers.

`@formulaxjs/editor` provides the browser-side modal styling and embedded editing helpers used by host integrations. It is no longer the shared markup layer or the read-only renderer layer.

> Status: experimental. Public APIs may change before the first stable release.

## Install

```bash
npm install @formulaxjs/editor
```

## Highlights

- `ensureFormulaXModalStyles`
- `formulaXModalStyles`
- `mountFormulaXEditor`
- `preloadFormulaXEditor` and `scheduleFormulaXEditorPreload`
- `getLatex()`, `getState()`, and `getRenderHtml()` on the mounted editor handle

## Example

```ts
import {
  ensureFormulaXModalStyles,
  mountFormulaXEditor,
} from '@formulaxjs/editor';

ensureFormulaXModalStyles(document);

const mounted = mountFormulaXEditor(document.querySelector('#host') as HTMLElement, {
  initialLatex: '\\sqrt{x}',
  autofocus: true,
});

const latex = await mounted.getLatex();
const html = await mounted.getRenderHtml();
```

## Preloading

If you want the FormulaX runtime to start loading before the user opens the modal, use the preload helpers:

```ts
import { scheduleFormulaXEditorPreload } from '@formulaxjs/editor';

const cleanup = scheduleFormulaXEditorPreload('hover', document.querySelector('#open-formula'));

// Call cleanup() if the host UI is torn down before preload triggers.
```

Supported preload modes:

- `idle` schedules runtime loading when the browser is idle.
- `hover` waits for `pointerenter` or `focusin` on the provided target.
- `false` disables preloading.

## Package role

Use this package for modal-based editing flows and embedded FormulaX editor UI.

- If you need shared markup or base formula styles, use `@formulaxjs/renderer`.
- If you need Kity-based read-only rendering, use `@formulaxjs/renderer-kity`.
- If you need the low-level legacy runtime entry, use `@formulaxjs/kity-runtime`.
