import { createEmptyState, parseLatex, type FormulaState } from '@formulaxjs/core';
import {
  kityFontAssets,
  mountKityEditor,
  type FormulaXLocale,
  type KityEditorAssets,
} from '@formulaxjs/kity-runtime';
import {
  createRuntimeEditor,
  type RuntimeEditorAssets,
} from '@formulaxjs/runtime';
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
import { mountRuntimeV2Toolbar } from './runtime-v2-toolbar';

const EMPTY_FORMULA_PLACEHOLDER = '\\placeholder ';
const STYLE_ID = 'fx-formula-modal-styles';
const RUNTIME_FONT_STYLE_ID = 'fx-runtime-font-styles';

export type FormulaXEditorRuntime = 'kity' | 'v2';

export interface FormulaXEditorOptions {
  initialLatex?: string;
  height?: number | string;
  autofocus?: boolean;
  runtime?: FormulaXEditorRuntime;
  locale?: FormulaXLocale;
  assets?: Partial<KityEditorAssets>;
  runtimeAssets?: Partial<RuntimeEditorAssets>;
  wrap?: 'none' | 'soft';
  maxWidth?: number | 'host';
  lineGap?: number;
  continuationIndent?: number;
  render?: {
    fontsize?: number;
    fontSize?: number;
  };
}

export interface MountedFormulaXEditor {
  root: HTMLElement;
  getLatex: () => Promise<string>;
  getState: () => Promise<FormulaState>;
  getRenderHtml: () => Promise<string>;
  destroy: () => void;
}

interface MountedFormulaXHandle {
  ready: Promise<void>;
  getLatex: () => Promise<string>;
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
  border: 1px solid #c9c7be;
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
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
  min-height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid #d8d6cd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  position: relative;
  z-index: 3;
  background: #f7f6f0;
  border-radius: 4px 4px 0 0;
}

.fx-formula-modal__title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.fx-formula-modal__close {
  border: 1px solid transparent;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: #666;
  border-radius: 3px;
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

.fx-formula-runtime-host {
  width: 100%;
  height: var(--fx-formula-editor-body-height);
  min-height: var(--fx-formula-editor-body-height);
  overflow: visible;
  position: relative;
  background: #fff;
}

.fx-formula-runtime-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: visible;
  border: 1px solid #e0e0e0;
  background: #f6f5ee;
}

.fx-formula-runtime-toolbar-host {
  flex: 0 0 auto;
  background: #f6f5ee;
  position: relative;
  z-index: 20;
  overflow: visible;
}

.fx-runtime-toolbar {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding: 1px 10px;
  background-color: #f6f5ee;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  color: #000;
  font-family: Helvetica, Arial, "微软雅黑", "Microsoft YaHei", "宋体", sans-serif;
}

.fx-runtime-toolbar__row {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: stretch;
  white-space: nowrap;
  overflow: visible;
}

.fx-runtime-toolbar__button {
  appearance: none;
  padding: 8px 6px;
  min-width: 46px;
  height: 79px;
  font-size: 12px;
  display: inline-block;
  border: 1px solid transparent;
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  z-index: 3;
  vertical-align: top;
  opacity: 1;
  margin-right: 1px;
  background: transparent;
  color: inherit;
}

.fx-runtime-toolbar__history {
  display: inline-flex;
  margin-left: auto;
}

.fx-runtime-toolbar__delimiter {
  flex: 0 0 11px;
  height: 79px;
  display: inline-block;
}

.fx-runtime-toolbar__delimiter-line {
  display: block;
  width: 1px;
  height: 100%;
  margin: 0 auto;
  background: linear-gradient(
    to bottom,
    rgba(233, 233, 233, 0.11),
    rgba(92, 92, 92, 0.2) 60%,
    rgba(92, 92, 92, 0.41) 80%,
    rgba(123, 123, 123, 0.5)
  );
}

.fx-runtime-toolbar__button:hover,
.fx-runtime-toolbar__button.is-open,
.fx-runtime-toolbar__button[data-active="true"] {
  border-color: #a9d9ab;
  background: #ebf7e6;
}

.fx-runtime-toolbar__button.is-open .fx-runtime-toolbar__button-label,
.fx-runtime-toolbar__button[data-active="true"] .fx-runtime-toolbar__button-label {
  color: #2b6a2f;
}

.fx-runtime-toolbar__button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.fx-runtime-toolbar__button-in {
  display: block;
  width: 100%;
}

.fx-runtime-toolbar__button-icon {
  width: 32px;
  height: 32px;
  margin: 2px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #000;
}

.fx-runtime-toolbar__button-icon .fx-runtime-svg,
.fx-runtime-toolbar__item-preview .fx-runtime-svg {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: 100%;
  overflow: visible;
}

.fx-runtime-toolbar__button-icon[aria-busy="true"],
.fx-runtime-toolbar__item-preview[aria-busy="true"] {
  background: linear-gradient(90deg, #f1f0ea 25%, #faf9f5 50%, #f1f0ea 75%);
  background-size: 200% 100%;
  animation: fx-runtime-preview-loading 1.1s linear infinite;
}

@keyframes fx-runtime-preview-loading {
  to {
    background-position: -200% 0;
  }
}

.fx-runtime-toolbar__area {
  flex: 0 0 315px;
  width: 315px;
  height: 79px;
  display: flex;
  align-items: stretch;
  position: relative;
  box-sizing: border-box;
  margin-right: 1px;
  border: 1px solid #e0dfd5;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.fx-runtime-toolbar__area-container {
  width: 293px;
  height: 70px;
  margin: 4px 0 4px 4px;
  display: grid;
  grid-template-columns: repeat(9, 32px);
  grid-auto-rows: 32px;
  gap: 2px 0;
  overflow: hidden;
}

.fx-runtime-toolbar__area-item {
  appearance: none;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.fx-runtime-toolbar__area-item .fx-runtime-toolbar__item-preview {
  box-sizing: border-box;
  transform: none;
}

.fx-runtime-toolbar__area-open {
  appearance: none;
  width: 18px;
  min-width: 18px;
  height: 79px;
  padding: 0;
  border: 0;
  border-left: 1px solid #d3d3d3;
  background:
    linear-gradient(135deg, transparent 45%, #fff 46% 54%, transparent 55%) center 38px / 8px 8px no-repeat,
    #53b856;
  cursor: pointer;
}

.fx-runtime-toolbar__area-open:hover,
.fx-runtime-toolbar__area-open.is-open {
  background-color: #45a949;
}

.fx-runtime-toolbar__button-label {
  color: #666;
  text-align: center;
  display: block;
  font-size: 12px;
  line-height: 20px;
  white-space: nowrap;
}

.fx-runtime-toolbar__button-sign {
  border: 4px solid transparent;
  border-top-color: #2d2d2d;
  width: 0;
  height: 0;
  display: inline-block;
  margin: 8px auto 0;
  vertical-align: top;
}

.fx-runtime-toolbar__popover {
  position: absolute;
  left: 0;
  top: 78px;
  z-index: 40;
  border: 1px solid #b3aead;
  border-radius: 3px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.11);
  background: #fff;
  overflow: hidden;
}

.fx-runtime-toolbar__popover.is-hidden {
  display: none;
}

.fx-runtime-toolbar__popover-body,
.fx-runtime-toolbar__popover-card {
  max-height: 230px;
  overflow-y: auto;
}

.fx-runtime-toolbar__section + .fx-runtime-toolbar__section {
  margin-top: 0;
}

.fx-runtime-toolbar__section-title {
  background-color: #f7f6f0;
  min-height: 23px;
  line-height: 1.35;
  font-size: 12px;
  border: 1px solid #ebeae4;
  border-width: 1px 0;
  padding: 4px 12px;
  white-space: normal;
}

.fx-runtime-toolbar__grid {
  padding: 6px 4px;
  white-space: normal;
}

.fx-runtime-toolbar__item {
  appearance: none;
  display: inline-block;
  margin: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  vertical-align: top;
  cursor: pointer;
}

.fx-runtime-toolbar__item-content {
  display: block;
  background: #fff;
  border: 1px solid #fff;
  padding: 0;
}

.fx-runtime-toolbar__item-content:hover {
  border-color: #6eb864;
}

.fx-runtime-toolbar__item-label {
  margin-bottom: 5px;
  line-height: 1.35;
  white-space: normal;
  display: block;
  color: #000;
}

.fx-runtime-toolbar__item-preview--symbol {
  width: 32px;
  height: 32px;
  line-height: 32px;
  font-size: 20px;
  text-align: center;
  color: #000;
  border: 1px solid #808080;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s linear, border-color 0.1s linear;
}

.fx-runtime-toolbar__item:hover .fx-runtime-toolbar__item-preview--symbol {
  border-color: #6eb864;
  transform: scale(1.2);
}

.fx-runtime-toolbar__item-preview--template {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  min-height: 42px;
  padding: 5px;
  line-height: 1.15;
  border: 1px solid #808080;
  white-space: nowrap;
}

.fx-runtime-toolbar__item:hover .fx-runtime-toolbar__item-preview--template {
  border-color: #6eb864;
}

.fx-formula-runtime-surface {
  flex: 1 1 auto;
  width: 100%;
  height: auto !important;
  min-height: 0;
  overflow: hidden;
  background: #fff;
  position: relative;
  cursor: text;
}

.fx-formula-runtime-surface.fx-runtime-editor-host {
  min-height: 0 !important;
}

.fx-formula-runtime-surface .fx-runtime-editor {
  width: 100%;
  height: 100% !important;
  min-height: 0 !important;
  overflow: auto;
}

.fx-formula-runtime-surface .fx-runtime-editor__surface {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0 !important;
  padding: 16px !important;
  display: flex;
  align-items: safe center;
  justify-content: safe center;
}

.fx-formula-runtime-surface .fx-runtime-svg {
  flex: 0 0 auto;
  max-width: none;
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
  padding: 12px 16px;
  border-top: 1px solid #d8d6cd;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  background: #f7f6f0;
  border-radius: 0 0 4px 4px;
}

.fx-formula-modal__button {
  appearance: none;
  border: 1px solid #b9b7af;
  background: linear-gradient(180deg, #fff, #efede4);
  color: #333;
  border-radius: 3px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
}

.fx-formula-modal__button--primary {
  border-color: #53b856;
  background: linear-gradient(180deg, #6cc96a, #53b856);
  color: #fff;
}
`;

export function ensureFormulaXModalStyles(doc: Document = document): void {
  ensureFormulaXBaseStyles(doc);
  ensureRuntimeFontStyles(doc);

  if (doc.getElementById(STYLE_ID)) return;

  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = formulaXModalStyles;
  doc.head.appendChild(style);
}

function ensureRuntimeFontStyles(doc: Document): void {
  if (doc.getElementById(RUNTIME_FONT_STYLE_ID)) {
    return;
  }

  const style = doc.createElement('style');
  style.id = RUNTIME_FONT_STYLE_ID;
  style.textContent = [
    ['KF AMS MAIN', kityFontAssets.KF_AMS_MAIN],
    ['KF AMS CAL', kityFontAssets.KF_AMS_CAL],
    ['KF AMS FRAK', kityFontAssets.KF_AMS_FRAK],
    ['KF AMS BB', kityFontAssets.KF_AMS_BB],
    ['KF AMS ROMAN', kityFontAssets.KF_AMS_ROMAN],
  ].map(([family, source]) => (
    `@font-face{font-family:"${family}";font-style:normal;font-weight:400;src:url("${source}") format("woff");}`
  )).join('\n');
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
  let handle: MountedFormulaXHandle | null = null;
  const initialLatex = latestLatex.trim() ? latestLatex : EMPTY_FORMULA_PLACEHOLDER;
  const runtime = options.runtime ?? 'kity';

  renderFormulaXEditorLoadingState(root);
  const loadingVisibleMark = markFormulaXPerf('fx:formula-editor:loading-visible');
  measureFormulaXPerf('fx:formula-editor:loading-visible', mountStart, loadingVisibleMark);
  clearFormulaXPerfMarks(loadingVisibleMark);

  const readyPromise = mountFormulaEditorHandle(root, {
    ...options,
    initialLatex,
    runtime,
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
    const latex = await readyHandle.getLatex();

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
      const readyHandle = handle ?? await readyPromise;
      return readyHandle.getRenderHtml();
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

async function mountFormulaEditorHandle(
  root: HTMLElement,
  options: FormulaXEditorOptions & { initialLatex: string; runtime: FormulaXEditorRuntime },
): Promise<MountedFormulaXHandle> {
  if (options.runtime === 'v2') {
    return mountRuntimeV2Handle(root, options);
  }

  return mountLegacyKityHandle(root, options);
}

async function mountRuntimeV2Handle(
  root: HTMLElement,
  options: FormulaXEditorOptions & { initialLatex: string },
): Promise<MountedFormulaXHandle> {
  ensureRuntimeFontStyles(root.ownerDocument ?? document);
  root.classList.remove('fx-formula-kity-host');
  root.classList.add('fx-formula-runtime-host');
  root.innerHTML = '';

  const shell = document.createElement('div');
  shell.className = 'fx-formula-runtime-shell';

  const toolbarHost = document.createElement('div');
  toolbarHost.className = 'fx-formula-runtime-toolbar-host';

  const surfaceHost = document.createElement('div');
  surfaceHost.className = 'fx-formula-runtime-surface kf-editor-edit-area';

  shell.append(toolbarHost, surfaceHost);
  root.appendChild(shell);

  const handle = await createRuntimeEditor(surfaceHost, {
    initialLatex: options.initialLatex,
    height: options.height ?? '100%',
    autofocus: options.autofocus ?? true,
    readOnly: false,
    assets: options.runtimeAssets,
    wrap: options.wrap,
    maxWidth: options.maxWidth,
    lineGap: options.lineGap,
    continuationIndent: options.continuationIndent,
    render: {
      fontSize: options.render?.fontSize ?? options.render?.fontsize ?? 40,
    },
  });
  surfaceHost.querySelector('.fx-runtime-editor__surface')?.classList.add('kf-editor-canvas-container');

  const toolbar = mountRuntimeV2Toolbar(toolbarHost, handle, {
    locale: options.locale,
    runtimeAssets: options.runtimeAssets,
  });

  return {
    ready: handle.ready,
    getLatex: async () => handle.getLatex(),
    getRenderHtml: async () => handle.getRenderHtml(),
    destroy: () => {
      toolbar.destroy();
      handle.destroy();
    },
  };
}

async function mountLegacyKityHandle(
  root: HTMLElement,
  options: FormulaXEditorOptions & { initialLatex: string },
): Promise<MountedFormulaXHandle> {
  const handle = await mountKityEditor(root, {
    initialLatex: options.initialLatex,
    height: options.height ?? '100%',
    autofocus: options.autofocus ?? true,
    locale: options.locale,
    assets: options.assets as Partial<KityEditorAssets> | undefined,
    render: {
      fontsize: options.render?.fontsize ?? options.render?.fontSize ?? 40,
    },
  });

  return {
    ready: Promise.resolve(),
    getLatex: async () => tryReadLatexFromKityHandle(handle),
    getRenderHtml: async () => {
      await waitForKityFormulaSvgLayout(root);
      return serializeKityFormulaFromRoot(root);
    },
    destroy: () => handle.destroy(),
  };
}

async function tryReadLatexFromKityHandle(handle: {
  ready: (callback: (this: { execCommand: (name: string, value?: string) => unknown }) => void) => void;
}): Promise<string> {
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

  return '';
}
