# FormulaX Editor Warmup Plan

This plan makes the first Formula Surface paint and the first Runtime Toolbar popover interaction behave closer to subsequent warm opens.

## Implementation Steps

1. Shared runtime font warmup
   - Add one shared runtime font helper for modal entry points.
   - Load only FormulaX font families instead of waiting for `document.fonts.ready`.
   - Measure with `fx:runtime-fonts-load`.

2. Shared editor warmup
   - Make `preloadFormulaXEditor` create one hidden read-only standard runtime editor per document.
   - Pass host editor context such as `initialLatex`, render font size, runtime assets, wrapping, and layout options.
   - Measure with `fx:editor-warmup`.

3. Tiered toolbar preview warmup
   - Render visible toolbar icons and the current symbol strip as `critical`.
   - Render the opened or hovered panel as `interaction`.
   - Render remaining panel previews as `idle`.
   - Measure with `fx:toolbar-preview:critical`, `fx:toolbar-preview:interaction`, and `fx:toolbar-preview:idle`.

4. Popover reuse
   - Cache built panel DOM nodes inside the mounted toolbar instance.
   - Detach panel content on close and reattach it on reopen.
   - Verify same-panel reopen reuses the same preview DOM node and keeps rendered SVG.

## Acceptance Checks

- `pnpm typecheck` passes.
- `pnpm lint` passes.
- `pnpm test` passes.
- Focused editor test confirms FormulaX preload does not read global `document.fonts.ready`.
- Focused editor test confirms same-panel popover reopen reuses the preview DOM node.

