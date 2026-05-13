# @formulax/editor

Browser editing foundation for FormulaX.

`@formulax/editor` adapts `@formulax/core` state to the DOM. It provides the interactive editor shell, HTML rendering helpers, modal wiring, and browser-side styles used by richer host integrations.

> Status: experimental. Public APIs may change before the first stable release.

## Install

```bash
pnpm add @formulax/editor @formulax/core @formulax/renderer @formulax/kity-runtime
```

## Highlights

- `FormulaEditor` for mounting an interactive FormulaX editor into a DOM node
- `renderInteractiveHtml` for HTML rendering of FormulaX state
- `mountFormulaXKityEditor` for modal-based Kity editing flows
- `formulaXModalStyles` and `editorStyles` for default browser styling

## Example

```ts
import { FormulaEditor } from '@formulax/editor';

const root = document.getElementById('editor');

if (!root) {
  throw new Error('Missing #editor');
}

const editor = new FormulaEditor({
  root,
  onChange(state) {
    console.log(state);
  },
});

console.log(editor.getState());
```

## Package role

Use this package for browser-native FormulaX editing. If you are integrating FormulaX into TinyMCE, CKEditor 5, or Tiptap, prefer the dedicated adapter packages instead.
