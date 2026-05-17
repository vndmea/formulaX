# @formulaxjs/kity-runtime

English | [简体中文](https://github.com/vndmea/formulaX/blob/main/packages/kity-runtime/README.zh-CN.md)

Legacy KityFormula runtime adapter for FormulaX.

`@formulaxjs/kity-runtime` packages the compatibility runtime that powers FormulaX's Kity-based editing and rendering flows. It now includes the legacy fonts, toolbar images, and stylesheet assets needed by the runtime, and provides low-level helpers for mounting the editor in browser applications.

> Status: experimental. Public APIs may change before the first stable release.

## Install

```bash
npm install @formulaxjs/kity-runtime
```

## Highlights

- `ensureKityRuntime` for lazy runtime bootstrapping
- `createKityEditor` and `mountKityEditor` for mounting a Kity editor into the DOM
- `FormulaXEditor` for a promise-friendly wrapper around the low-level runtime handle
- Legacy compatibility exports used by existing KityFormula-oriented integrations

## Example

```ts
import { FormulaXEditor } from '@formulaxjs/kity-runtime';

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

Use this package when you need the low-level legacy Kity editing runtime or compatibility with historical KityFormula behavior. For modal-oriented editing flows, prefer `mountFormulaXEditor()` from `@formulaxjs/editor`. For host-editor integrations, prefer the dedicated adapter packages that already depend on this runtime.
