import type {
  FormulaXTinyMceOptions,
  RequiredFormulaXTinyMceOptions,
  TinyMceEditorLike,
  TinyMceLike,
} from './types';
import { createTinyMceCompat, warnUnsupportedTinyMceVersion } from './compat';
import { findFormulaElement } from './markup';
import { openFormulaXOverlayModal } from './modal';
import { ensureTinyMceStyles } from './styles';

export function resolveOptions(options: FormulaXTinyMceOptions = {}): RequiredFormulaXTinyMceOptions {
  return {
    pluginName: options.pluginName ?? 'formulax',
    buttonName: options.buttonName ?? 'formulax',
    menuItemName: options.menuItemName ?? 'formulax',
    toolbarText: options.toolbarText ?? 'FormulaX',
    tooltip: options.tooltip ?? 'Insert formula',
    formulaClassName: options.formulaClassName ?? 'formulax-math',
    formulaAttributeName: options.formulaAttributeName ?? 'data-formulax-latex',
    renderMode: options.renderMode ?? 'text',
    initialLatex: options.initialLatex ?? '',
    modal: {
      title: options.modal?.title ?? 'FormulaX',
      insertText: options.modal?.insertText ?? 'Insert',
      updateText: options.modal?.updateText ?? 'Update',
      cancelText: options.modal?.cancelText ?? 'Cancel',
      width: options.modal?.width ?? '1100px',
      height: options.modal?.height ?? 'auto',
      closeOnBackdrop: options.modal?.closeOnBackdrop ?? true,
    },
    editor: {
      mode: 'kity',
      height: options.editor?.height ?? '100%',
      autofocus: options.editor?.autofocus ?? true,
      assets: options.editor?.assets ?? {},
      render: {
        fontsize: options.editor?.render?.fontsize ?? 40,
      },
    },
  };
}

export function registerFormulaXTinyMcePlugin(
  tinymce: TinyMceLike,
  options: FormulaXTinyMceOptions = {},
): void {
  if (!tinymce?.PluginManager?.add) {
    throw new Error('[FormulaX] Invalid TinyMCE instance: PluginManager.add is missing.');
  }

  warnUnsupportedTinyMceVersion(tinymce);
  const resolved = resolveOptions(options);

  tinymce.PluginManager.add(
    resolved.pluginName,
    function FormulaXTinyMcePlugin(editor: TinyMceEditorLike): undefined {
      const compat = createTinyMceCompat(editor, tinymce);

      const open = (target?: HTMLElement | null): void => {
        const resolvedTarget = target ?? compat.getSelectedFormulaElement();

        openFormulaXOverlayModal({
          editor,
          target: resolvedTarget,
          initialLatex: resolvedTarget ? undefined : resolved.initialLatex,
          options: resolved,
        });
      };

      editor.addCommand('FormulaXOpen', () => {
        open();
      });

      editor.ui?.registry?.addButton?.(resolved.buttonName, {
        text: resolved.toolbarText,
        tooltip: resolved.tooltip,
        onAction: () => editor.execCommand('FormulaXOpen'),
      });

      editor.ui?.registry?.addMenuItem?.(resolved.menuItemName, {
        text: resolved.toolbarText,
        onAction: () => editor.execCommand('FormulaXOpen'),
      });

      editor.on('init', () => {
        ensureTinyMceStyles(document);
        const editorDoc = editor.getDoc?.();
        if (editorDoc) {
          ensureTinyMceStyles(editorDoc);
        }
      });

      editor.on('dblclick', (event: unknown) => {
        const formula = findFormulaElement((event as MouseEvent).target as Node);
        if (!formula) return;
        (event as Event).preventDefault?.();
        open(formula);
      });

      editor.on('keydown', (event: unknown) => {
        const e = event as KeyboardEvent;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const formula = compat.getSelectedFormulaElement();
        if (!formula) return;
        e.preventDefault?.();
        open(formula);
      });

      return undefined;
    },
  );
}
