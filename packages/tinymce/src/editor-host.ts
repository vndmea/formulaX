import { createEmptyState, parseLatex, type FormulaState } from '@formulax/core';
import { mountKityEditor, type KityEditorHandle } from '@formulax/kity-runtime';
import type { MountedFormulaXEditor, RequiredFormulaXTinyMceOptions } from './types';

export interface MountFormulaXEditorOptions {
  initialLatex?: string;
  options: RequiredFormulaXTinyMceOptions;
}

export function mountFormulaXEditorInModal(
  root: HTMLElement,
  input: MountFormulaXEditorOptions,
): MountedFormulaXEditor {
  let destroyed = false;
  let latestLatex = input.initialLatex ?? '';
  let handle: KityEditorHandle | null = null;

  root.innerHTML = '';
  root.classList.add('fx-tinymce-kity-host');

  const readyPromise = mountKityEditor(root, {
    initialLatex:
      latestLatex || 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}',
    height: input.options.editor.height ?? '100%',
    autofocus: input.options.editor.autofocus ?? true,
    assets: input.options.editor.assets,
    render: {
      fontsize: input.options.editor.render?.fontsize ?? 40,
    },
  })
    .then((nextHandle) => {
      if (destroyed) {
        nextHandle.destroy();
        throw new Error('FormulaX editor mount cancelled');
      }

      handle = nextHandle;
      return nextHandle;
    })
    .catch((error) => {
      console.error('[FormulaX] Failed to load FormulaX editor:', error);

      if (!destroyed) {
        root.innerHTML = `
          <div class="fx-tinymce-editor-error">
            Failed to load FormulaX editor.
            <pre>${escapeHtml(error instanceof Error ? error.message : String(error))}</pre>
          </div>
        `;
      }

      throw error;
    });

  return {
    root,

    async getLatex(): Promise<string> {
      const readyHandle = handle ?? await readyPromise;
      const latex = await tryReadLatexFromKityHandle(readyHandle);

      if (latex) {
        latestLatex = latex;
      }

      return latestLatex;
    },

    async getState(): Promise<FormulaState> {
      const latex = await this.getLatex();

      try {
        return {
          ...createEmptyState(),
          doc: parseLatex(latex),
        };
      } catch {
        return createEmptyState();
      }
    },

    destroy(): void {
      if (destroyed) return;
      destroyed = true;

      void readyPromise
        .then((readyHandle) => readyHandle.destroy())
        .catch(() => {
          // ignore destroy errors
        });

      root.innerHTML = '';
    },
  };
}

async function tryReadLatexFromKityHandle(
  handle: KityEditorHandle,
): Promise<string | null> {
  const candidates = [
    'get.source',
    'getSource',
    'getLatex',
    'get.latex',
    'get.content',
    'getContent',
  ];

  for (const command of candidates) {
    try {
      let value: unknown = null;

      handle.ready(function ready() {
        value = this.execCommand(command);
      });

      if (typeof value === 'string' && value.trim()) {
        return value;
      }

      if (value && typeof value === 'object' && 'latex' in value) {
        const latex = (value as { latex?: unknown }).latex;
        if (typeof latex === 'string' && latex.trim()) {
          return latex;
        }
      }
    } catch {
      // try next command
    }
  }

  return null;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
