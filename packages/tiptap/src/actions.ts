import type { FormulaXIconOptions } from '@formulaxjs/editor';
import {
  FORMULAX_DEFAULT_ICON_SVG,
  FORMULAX_DEFAULT_ICON_NAME,
  resolveFormulaXIcon,
  resolveFormulaXIconName,
} from '@formulaxjs/editor';

export interface FormulaXTiptapAction {
  id: string;
  label: string;
  tooltip: string;
  iconName: string;
  icon: string;
  run: () => boolean;
  isEnabled: () => boolean;
}

export interface FormulaXTiptapActionOptions extends FormulaXIconOptions {
  label?: string;
  tooltip?: string;
}

export interface FormulaXTiptapEditorLike {
  commands: {
    openFormulaX?: () => boolean;
  };
  can?: () => {
    openFormulaX?: () => boolean;
  };
}

export interface FormulaXTiptapActions {
  insertFormula: FormulaXTiptapAction;
  openFormulaX: FormulaXTiptapAction;
}

export function createFormulaXActions(
  editor: FormulaXTiptapEditorLike,
  options: FormulaXTiptapActionOptions = {},
): FormulaXTiptapActions {
  const label = options.label ?? 'Insert formula';
  const tooltip = options.tooltip ?? label;
  const icon = resolveFormulaXIcon(options);
  const iconName = resolveFormulaXIconName(options);
  const runCommand = editor.commands.openFormulaX;

  const createAction = (id: string): FormulaXTiptapAction => ({
    id,
    label,
    tooltip,
    iconName,
    icon,
    run: () => runCommand?.() ?? false,
    isEnabled: () => {
      const canOpen = editor.can?.().openFormulaX;

      if (canOpen) {
        return canOpen();
      }

      return typeof runCommand === 'function';
    },
  });

  return {
    insertFormula: createAction('formulax.insertFormula'),
    openFormulaX: createAction('formulax.openFormulaX'),
  };
}

export {
  FORMULAX_DEFAULT_ICON_SVG,
  FORMULAX_DEFAULT_ICON_NAME,
};
