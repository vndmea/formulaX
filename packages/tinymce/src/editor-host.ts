import {
  mountFormulaXKityEditor,
  type FormulaXKityEditorOptions,
} from '@formulaxjs/editor';
import { serializeSvgForInsertion } from '@formulaxjs/renderer';
import type { MountedFormulaXEditor, RequiredFormulaXTinyMceOptions } from './types';

export interface MountFormulaXEditorOptions {
  initialLatex?: string;
  options: RequiredFormulaXTinyMceOptions;
}

export function mountFormulaXEditorInModal(
  root: HTMLElement,
  input: MountFormulaXEditorOptions,
): MountedFormulaXEditor {
  const options: FormulaXKityEditorOptions = {
    initialLatex: input.initialLatex,
    height: input.options.editor.height ?? '100%',
    autofocus: input.options.editor.autofocus ?? true,
    assets: input.options.editor.assets,
    render: {
      fontsize: input.options.editor.render?.fontsize ?? 40,
    },
  };
  return mountFormulaXKityEditor(root, options);
}

export { serializeSvgForInsertion };
