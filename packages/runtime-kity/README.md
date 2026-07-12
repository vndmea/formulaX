# @formulaxjs/runtime-kity

English | [简体中文](https://github.com/vndmea/formulaX/blob/main/packages/runtime-kity/README.zh-CN.md)

KityFormula compatibility runtime adapter for FormulaX.

`@formulaxjs/runtime-kity` packages the compatibility runtime that powers FormulaX's Kity-based editing and rendering flows. It now includes the KityFormula fonts, toolbar images, and stylesheet assets needed by the runtime, and provides low-level helpers for mounting the editor in browser applications.

> Status: experimental. Public APIs may change before the first stable release.

## Install

```bash
npm install @formulaxjs/runtime-kity
```

## Highlights

- `ensureKityRuntime` for lazy runtime bootstrapping
- `createKityEditor` and `mountKityEditor` for mounting a Kity editor into the DOM
- `FormulaXEditor` for a promise-friendly wrapper around the low-level runtime handle
- KityFormula compatibility runtime used by Kity-oriented integrations

## Example

```ts
import { FormulaXEditor } from '@formulaxjs/runtime-kity';

const editor = new FormulaXEditor({
  el: '#editor', // HTMLElement or selector
  initialLatex: 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}',
  height: 320, // optional runtime workspace height
  autofocus: true, // focus after mount
  assets: {
    // optional partial overrides when runtime CSS / fonts / toolbar images live on your CDN
    styles: {
      editor: '/static/formulax/editor.css',
    },
  },
  render: {
    fontsize: 40, // preview / export font size
  },
});

await editor.execCommand('render', '\\sqrt{x}');
await editor.focus();
await editor.destroy();
```

## Package role

Use this package when you need the low-level KityFormula editing runtime or compatibility with historical KityFormula behavior. For modal-oriented editing flows, prefer `mountFormulaXEditor()` from `@formulaxjs/editor`. For host-editor integrations, prefer the dedicated adapter packages that already depend on this runtime.
