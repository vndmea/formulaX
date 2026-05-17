import { createEmptyState, parseLatex, type FormulaState } from '@formulaxjs/core';
import {
  mountKityEditor,
  type FormulaXLocale,
  type KityEditorAssets,
  type KityEditorHandle,
} from '@formulaxjs/kity-runtime';
import { escapeHtml, ensureFormulaXBaseStyles } from '@formulaxjs/renderer';
import {
  serializeKityFormulaFromRoot,
  waitForKityFormulaSvgLayout,
} from '@formulaxjs/renderer-kity';
import {
  clearFormulaXPerfMarks,
  markFormulaXPerf,
  measureFormulaXPerf,
  recordFormulaXPerfPoint,
} from './perf';

const EMPTY_FORMULA_PLACEHOLDER = '\\placeholder ';
const STYLE_ID = 'fx-formula-modal-styles';

export interface FormulaXEditorOptions {
  initialLatex?: string;
  height?: number | string;
  autofocus?: boolean;
  locale?: FormulaXLocale;
  assets?: Partial<KityEditorAssets>;
  render?: {
    fontsize?: number;
  };
}

export interface MountedFormulaXEditor {
  root: HTMLElement;
  getLatex: () => Promise<string>;
  getState: () => Promise<FormulaState>;
  getRenderHtml: () => Promise<string>;
  destroy: () => void;
}

export const formulaXModalStyles = `
.fx-formula-modal-open {
  overflow: hidden;
}

.fx-formula-modal-root {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 16px;
  overflow-x: hidden;
  overflow-y: auto;
}

.fx-formula-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.48);
}

.fx-formula-modal {
  --fx-formula-editor-body-height: 264px;
  --fx-formula-workspace-height: 168px;
  position: relative;
  width: min(920px, calc(100vw - 32px));
  height: auto;
  max-height: none;
  margin: 0 auto;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.28);
  display: flex;
  flex-direction: column;
  overflow: visible;
  isolation: isolate;
}

.fx-formula-modal__header,
.fx-formula-modal__footer,
.fx-formula-modal__title,
.fx-formula-modal__close,
.fx-formula-modal__button,
.fx-formula-editor-loading,
.fx-formula-editor-error {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.fx-formula-modal__header {
  min-height: 56px;
  padding: 0 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  position: relative;
  z-index: 3;
  background: #fff;
  border-radius: 14px 14px 0 0;
}

.fx-formula-modal__title {
  font-size: 16px;
  font-weight: 650;
  margin: 0;
  color: #111827;
}

.fx-formula-modal__close {
  border: 0;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #6b7280;
}

.fx-formula-modal__body {
  flex: 0 0 auto;
  height: var(--fx-formula-editor-body-height);
  padding: 0;
  overflow: visible;
  min-height: var(--fx-formula-editor-body-height);
  position: relative;
  z-index: 2;
}

.fx-formula-editor-host {
  width: 100%;
  height: var(--fx-formula-editor-body-height);
  min-height: var(--fx-formula-editor-body-height);
  overflow: visible;
  position: relative;
}

.fx-formula-kity-host {
  width: 100%;
  height: var(--fx-formula-editor-body-height);
  min-height: var(--fx-formula-editor-body-height);
  overflow: visible;
  position: relative;
}

.fx-formula-kity-host .kf-editor {
  box-sizing: border-box;
  width: 100%;
  height: var(--fx-formula-editor-body-height) !important;
  overflow: visible !important;
}

.fx-formula-kity-host .kf-editor-toolbar {
  overflow: visible;
  position: relative;
  z-index: 20;
}

.fx-formula-kity-host .kf-editor-ui-button-mount-point,
.fx-formula-kity-host .kf-editor-ui-area-mount,
.fx-formula-kity-host .kf-editor-ui-box,
.fx-formula-kity-host .kf-editor-ui-list {
  z-index: 1000;
}

.fx-formula-kity-host .kf-editor-edit-area,
.fx-formula-kity-host .kf-editor-canvas-container {
  min-height: var(--fx-formula-workspace-height);
  height: var(--fx-formula-workspace-height);
}

.fx-formula-kity-host .kf-editor-edit-area {
  flex: 0 0 auto;
  overflow: hidden;
}

.fx-formula-kity-host .kf-editor,
.fx-formula-kity-host .kf-editor svg text,
.fx-formula-kity-host .kf-editor-ui-area-item-text,
.fx-formula-kity-host .kf-editor-ui-box-item-text,
.fx-formula-kity-host .kf-editor-ui-box-item-val {
  font-family: "KF AMS MAIN", "Cambria Math", "Latin Modern Math", "Times New Roman", serif !important;
}

.fx-formula-kity-host .kf-editor-ui-box-item-content,
.fx-formula-kity-host .kf-editor-ui-box-item-val {
  min-width: 32px;
  min-height: 32px;
}

.fx-formula-kity-host .kf-editor-ui-box-item-val svg,
.fx-formula-kity-host .kf-editor-ui-box-item-val img,
.fx-formula-kity-host .kf-editor-ui-area-item-img,
.fx-formula-kity-host .kf-editor-ui-area-item-text {
  display: block;
}

.fx-formula-editor-loading {
  height: var(--fx-formula-editor-body-height);
  padding: 24px;
  color: #4b5563;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fx-formula-editor-error {
  padding: 24px;
  color: #dc2626;
  font-size: 14px;
}

.fx-formula-editor-error pre {
  white-space: pre-wrap;
  word-break: break-all;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
}

.fx-formula-modal__footer {
  min-height: 64px;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 0 0 14px 14px;
}

.fx-formula-modal__button {
  appearance: none;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #111827;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
}

.fx-formula-modal__button--primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}
`;

export function ensureFormulaXModalStyles(doc: Document = document): void {
  ensureFormulaXBaseStyles(doc);

  if (doc.getElementById(STYLE_ID)) return;

  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = formulaXModalStyles;
  doc.head.appendChild(style);
}

export function renderFormulaXEditorLoadingState(root: HTMLElement): void {
  root.classList.add('fx-formula-kity-host');
  root.innerHTML = `
    <div class="fx-formula-editor-loading" role="status" aria-live="polite">
      Loading FormulaX editor...
    </div>
  `;
}

export function mountFormulaXEditor(
  root: HTMLElement,
  options: FormulaXEditorOptions = {},
): MountedFormulaXEditor {
  recordFormulaXPerfPoint('fx:formula-editor:mount:start');
  const mountStart = markFormulaXPerf('fx:formula-editor:mount:start:scope');
  let destroyed = false;
  let latestLatex = options.initialLatex ?? '';
  let handle: KityEditorHandle | null = null;
  const initialLatex = latestLatex.trim() ? latestLatex : EMPTY_FORMULA_PLACEHOLDER;

  renderFormulaXEditorLoadingState(root);
  const loadingVisibleMark = markFormulaXPerf('fx:formula-editor:loading-visible');
  measureFormulaXPerf('fx:formula-editor:loading-visible', mountStart, loadingVisibleMark);
  clearFormulaXPerfMarks(loadingVisibleMark);

  const readyPromise = mountKityEditor(root, {
    initialLatex,
    height: options.height ?? '100%',
    autofocus: options.autofocus ?? true,
    locale: options.locale,
    assets: options.assets,
    render: {
      fontsize: options.render?.fontsize ?? 40,
    },
  })
    .then((nextHandle) => {
      if (destroyed) {
        nextHandle.destroy();
        throw new Error('FormulaX editor mount cancelled');
      }

      const readyMark = markFormulaXPerf('fx:kity-editor:ready');
      measureFormulaXPerf('fx:kity-editor:ready', mountStart, readyMark);
      clearFormulaXPerfMarks(readyMark);
      handle = nextHandle;
      return nextHandle;
    })
    .catch((error) => {
      console.error('[FormulaX] Failed to load FormulaX editor:', error);

      if (!destroyed) {
        root.innerHTML = `
          <div class="fx-formula-editor-error">
            Failed to load FormulaX editor.
            <pre>${escapeHtml(error instanceof Error ? error.message : String(error))}</pre>
          </div>
        `;
      }

      throw error;
    })
    .finally(() => {
      clearFormulaXPerfMarks(mountStart);
    });

  const getCurrentLatex = async (): Promise<string> => {
    const readyHandle = handle ?? await readyPromise;
    const latex = await tryReadLatexFromKityHandle(readyHandle);

    if (latex !== null) {
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
      await waitForKityFormulaSvgLayout(root);
      return serializeKityFormulaFromRoot(root);
    },

    destroy(): void {
      if (destroyed) return;
      destroyed = true;

      void readyPromise
        .then((readyHandle) => readyHandle.destroy())
        .catch(() => undefined);

      root.innerHTML = '';
    },
  };
}

async function tryReadLatexFromKityHandle(handle: KityEditorHandle): Promise<string | null> {
  try {
    let isEmpty = false;

    handle.ready(function ready() {
      const result = this.execCommand('content.is.empty');
      isEmpty = result === true;
    });

    if (isEmpty) {
      return '';
    }
  } catch {
    // Fall back to source commands for runtimes without content.is.empty.
  }

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
      // Try the next available command name.
    }
  }

  return null;
}
