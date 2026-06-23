import type { RuntimeEditorHandle, RuntimeEditorOptions } from '../core/types';
import { FormulaRuntimeEditor } from './FormulaRuntimeEditor';

export async function ensureRuntime(): Promise<void> {
  return Promise.resolve();
}

export async function createRuntimeEditor(
  container: HTMLElement,
  options: RuntimeEditorOptions = {},
): Promise<RuntimeEditorHandle> {
  await ensureRuntime();
  const editor = new FormulaRuntimeEditor(container, options);
  await editor.ready;
  return {
    root: container,
    editor,
    ready: editor.ready,
    getLatex: () => editor.getLatex(),
    setLatex: (latex, dispatchOptions) => editor.setLatex(latex, dispatchOptions),
    getRenderHtml: () => editor.getRenderHtml(),
    focus: () => editor.focus(),
    destroy: () => editor.destroy(),
  };
}

export async function mountRuntimeEditor(
  container: HTMLElement,
  options: RuntimeEditorOptions = {},
): Promise<RuntimeEditorHandle> {
  return createRuntimeEditor(container, options);
}
