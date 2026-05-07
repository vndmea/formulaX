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

  const getCurrentLatex = async (): Promise<string> => {
    const readyHandle = handle ?? await readyPromise;
    const latex = await tryReadLatexFromKityHandle(readyHandle);

    if (latex) {
      latestLatex = latex;
    }

    return latestLatex;
  };

  return {
    root,

    getLatex: getCurrentLatex,

    async getState(): Promise<FormulaState> {
      const latex = await getCurrentLatex();

      try {
        return {
          ...createEmptyState(),
          doc: parseLatex(latex),
        };
      } catch {
        return createEmptyState();
      }
    },

    async getRenderHtml(): Promise<string> {
      await readyPromise;
      return renderCurrentFormulaAsSvgHtml(root);
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

function renderCurrentFormulaAsSvgHtml(root: HTMLElement): string {
  const svg = findFormulaSvg(root);

  if (!svg) {
    return '';
  }

  return serializeSvgForInsertion(svg);
}

function findFormulaSvg(root: HTMLElement): SVGSVGElement | null {
  return root.querySelector<SVGSVGElement>(
    '.kf-editor-edit-area svg, .kf-editor-canvas-container svg, svg',
  );
}

function serializeSvgForInsertion(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;

  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  if (!clone.getAttribute('xmlns:xlink')) {
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  }

  clone.removeAttribute('id');

  return new XMLSerializer().serializeToString(clone);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
