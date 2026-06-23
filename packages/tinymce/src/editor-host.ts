import {
  mountFormulaXEditor,
  type FormulaXEditorOptions,
} from '@formulaxjs/editor';
import type { MountedFormulaXEditor, RequiredFormulaXTinyMceOptions } from './types';

export interface MountFormulaXEditorOptions {
  initialLatex?: string;
  options: RequiredFormulaXTinyMceOptions;
}

export function mountFormulaXEditorInModal(
  root: HTMLElement,
  input: MountFormulaXEditorOptions,
): MountedFormulaXEditor {
  const options: FormulaXEditorOptions = {
    initialLatex: input.initialLatex,
    height: input.options.editor.height ?? '100%',
    autofocus: input.options.editor.autofocus ?? true,
    runtime: input.options.editor.runtime,
    locale: input.options.editor.locale,
    assets: input.options.editor.assets,
    runtimeAssets: input.options.editor.runtimeAssets,
    wrap: input.options.editor.wrap,
    maxWidth: input.options.editor.maxWidth,
    lineGap: input.options.editor.lineGap,
    continuationIndent: input.options.editor.continuationIndent,
    render: {
      fontsize: input.options.editor.render?.fontsize ?? 40,
    },
  };
  return mountFormulaXEditor(root, options);
}
