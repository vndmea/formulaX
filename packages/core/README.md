# @formulax/core

Core document model and shared utilities for FormulaX.

`@formulax/core` contains the AST, editor state, command helpers, traversal helpers, and LaTeX parse/serialize logic used by the higher-level FormulaX packages.

> Status: experimental. Public APIs may change before the first stable release.

## Install

```bash
pnpm add @formulax/core
```

## Highlights

- Formula AST builders such as `doc`, `group`, `frac`, `sqrt`, `supsub`, and `text`
- State helpers such as `createEmptyState` and `createStateFromDoc`
- Editing commands such as `insertText`, `insertFraction`, `insertSuperscript`, `insertSubscript`, `insertSqrt`, and `backspace`
- LaTeX conversion through `parseLatex` and `serializeLatex`

## Example

```ts
import {
  createEmptyState,
  insertFraction,
  insertText,
  parseLatex,
  serializeLatex,
} from '@formulax/core';

const initial = parseLatex('x^2+1');
const latex = serializeLatex(initial);

let state = createEmptyState();
state = insertText('x')(state);
state = insertFraction()(state);

console.log(latex);
```

## Package role

Use this package when you need FormulaX data structures and deterministic transformations without any DOM, modal, or host-editor integration concerns.
