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

  uniquifySvgIds(clone);
  sizeSvgForInlineDisplay(clone, svg);

  clone.removeAttribute('id');
  clone.setAttribute('class', mergeClassNames(clone.getAttribute('class'), 'formulax-math__svg'));
  clone.setAttribute('focusable', 'false');
  clone.setAttribute('aria-hidden', 'true');
  clone.setAttribute('preserveAspectRatio', clone.getAttribute('preserveAspectRatio') || 'xMidYMid meet');

  return new XMLSerializer().serializeToString(clone);
}

function sizeSvgForInlineDisplay(clone: SVGSVGElement, source: SVGSVGElement): void {
  const viewBox = clone.viewBox?.baseVal;
  const rect = source.getBoundingClientRect();
  const width = viewBox?.width || rect.width || Number(clone.getAttribute('width')) || 1;
  const height = viewBox?.height || rect.height || Number(clone.getAttribute('height')) || 1;
  const ratio = Math.max(0.1, width / Math.max(1, height));
  const inlineHeightEm = 1.65;
  const inlineWidthEm = Math.min(40, Math.max(0.75, ratio * inlineHeightEm));

  clone.setAttribute('width', `${roundLength(inlineWidthEm)}em`);
  clone.setAttribute('height', `${inlineHeightEm}em`);
}

function roundLength(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

function uniquifySvgIds(svg: SVGSVGElement): void {
  const idMap = new Map<string, string>();
  const prefix = `fx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-`;
  const elementsWithId = svg.querySelectorAll<Element>('[id]');

  elementsWithId.forEach((element) => {
    const id = element.getAttribute('id');
    if (!id) return;

    const nextId = `${prefix}${id}`;
    idMap.set(id, nextId);
    element.setAttribute('id', nextId);
  });

  if (!idMap.size) return;

  svg.querySelectorAll<Element>('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const nextValue = rewriteSvgReferences(attribute.value, idMap);
      if (nextValue !== attribute.value) {
        element.setAttribute(attribute.name, nextValue);
      }
    });
  });
}

function rewriteSvgReferences(value: string, idMap: Map<string, string>): string {
  let nextValue = value;

  idMap.forEach((nextId, id) => {
    nextValue = nextValue
      .replaceAll(`#${id}`, `#${nextId}`)
      .replaceAll(`url(${id})`, `url(${nextId})`)
      .replaceAll(`url(#${id})`, `url(#${nextId})`);
  });

  return nextValue;
}

function mergeClassNames(...values: Array<string | null | undefined>): string {
  return values
    .flatMap((value) => value?.split(/\s+/) ?? [])
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index)
    .join(' ');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
