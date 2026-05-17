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
- Legacy compatibility exports used by existing KityFormula-oriented integrations

## Example

```ts
import { mountKityEditor } from '@formulaxjs/kity-runtime';

const root = document.getElementById('editor');

if (!root) {
  throw new Error('Missing #editor');
}

const handle = await mountKityEditor(root, {
  value: 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}',
  locale: 'zh_CN', // optional, defaults to en_US
});

console.log(handle.getLatex());
```

## Package role

Use this package when you need the low-level legacy Kity editing runtime or compatibility with historical KityFormula behavior. For application-facing editor usage, prefer importing `FormulaXEditor` from `@formulaxjs/editor`. For host-editor integrations, prefer the dedicated adapter packages that already depend on this runtime.
