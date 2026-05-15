# @formulaxjs/editor

Public editor entry and integration helpers for FormulaX.

`@formulaxjs/editor` provides the public FormulaX editor entry backed by the Kity compatibility runtime, along with shared formula markup helpers and modal wiring used by richer host integrations.

> Status: experimental. Public APIs may change before the first stable release.

## Install

```bash
pnpm add @formulaxjs/editor
```

## Highlights

- `FormulaXEditor` as the public runtime-backed editor entry
- `mountFormulaXEditor` for modal-based Kity editing flows
- `formulaXModalStyles` for shared modal styling
- Formula node helpers for host-editor markup integration

## Example

```ts
import { FormulaXEditor } from '@formulaxjs/editor';

new FormulaXEditor({
  el: '#app',
});
```

## Package role

Use this package as the main application-facing FormulaX editor entry. If you are integrating FormulaX into TinyMCE, CKEditor 5, or Tiptap, prefer the dedicated adapter packages instead.
