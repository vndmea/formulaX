import {
  ButtonView,
  Command,
  Plugin,
  Widget,
  toWidget,
  viewToModelPositionOutsideModelElement,
} from 'ckeditor5';
import { mountKityEditor } from '@formulax/kity-runtime';
import type {
  FormulaXCKEditor5Options,
  FormulaXPayload,
  RequiredFormulaXCKEditor5Options,
} from './types';

const DEFAULT_BUTTON_NAME = 'formulaX';
const DEFAULT_FORMULA_CLASS = 'formulax-math';
const DEFAULT_FORMULA_ATTRIBUTE = 'data-formulax-latex';
const FORMULA_FLAG_ATTRIBUTE = 'data-formulax';
const EMPTY_FORMULA_PLACEHOLDER = '\\placeholder ';

export {
  DEFAULT_BUTTON_NAME,
  DEFAULT_FORMULA_ATTRIBUTE,
  DEFAULT_FORMULA_CLASS,
  FORMULA_FLAG_ATTRIBUTE,
};

export type {
  FormulaXCKEditor5Options,
  FormulaXPayload,
  RequiredFormulaXCKEditor5Options,
};

export function resolveOptions(options: FormulaXCKEditor5Options = {}): RequiredFormulaXCKEditor5Options {
  return {
    buttonName: options.buttonName ?? DEFAULT_BUTTON_NAME,
    toolbarText: options.toolbarText ?? 'FormulaX',
    tooltip: options.tooltip ?? 'Insert or edit formula',
    formulaClassName: options.formulaClassName ?? DEFAULT_FORMULA_CLASS,
    formulaAttributeName: options.formulaAttributeName ?? DEFAULT_FORMULA_ATTRIBUTE,
    modal: {
      title: options.modal?.title ?? 'FormulaX Editor',
      insertText: options.modal?.insertText ?? 'Insert',
      updateText: options.modal?.updateText ?? 'Update',
      cancelText: options.modal?.cancelText ?? 'Cancel',
      closeOnBackdrop: options.modal?.closeOnBackdrop ?? true,
    },
    editor: {
      height: options.editor?.height ?? '100%',
      autofocus: options.editor?.autofocus ?? true,
      assets: options.editor?.assets ?? {},
      render: {
        fontsize: options.editor?.render?.fontsize ?? 40,
      },
    },
  };
}

export class FormulaXCommand extends Command {
  private readonly options: RequiredFormulaXCKEditor5Options;

  constructor(editor: any, options: RequiredFormulaXCKEditor5Options) {
    super(editor);
    this.options = options;
  }

  override refresh(): void {
    this.isEnabled = true;
  }

  override execute(): void {
    const editor = this.editor as any;
    const selectedFormula = getSelectedFormulaModelElement(editor);
    const initialLatex = String(selectedFormula?.getAttribute('latex') ?? '');

    void openFormulaXModal({
      initialLatex,
      isUpdate: Boolean(selectedFormula),
      options: this.options,
    }).then((payload) => {
      if (!payload) return;

      editor.model.change((writer: any) => {
        if (selectedFormula) {
          if (!payload.latex.trim()) {
            writer.remove(selectedFormula);
            return;
          }

          writer.setAttribute('latex', payload.latex, selectedFormula);
          writer.setAttribute('html', payload.html ?? '', selectedFormula);
          return;
        }

        if (!payload.latex.trim()) return;

        const formula = writer.createElement('formulaX', {
          latex: payload.latex,
          html: payload.html ?? '',
        });

        editor.model.insertObject(formula, null, null, { setSelection: 'after' });
      });

      editor.editing.view.focus();
    });
  }
}

export class FormulaX extends Plugin {
  static get pluginName(): string {
    return 'FormulaX';
  }

  static get requires(): readonly [typeof Widget] {
    return [Widget];
  }

  init(): void {
    const editor = this.editor as any;
    const options = resolveOptions(editor.config.get('formulaX') as FormulaXCKEditor5Options | undefined);

    ensureFormulaXStyles(document);
    defineFormulaSchema(editor);
    defineFormulaConverters(editor, options);
    editor.editing.mapper.on(
      'viewToModelPosition',
      viewToModelPositionOutsideModelElement(editor.model, isFormulaWidgetView),
    );

    const command = new FormulaXCommand(editor, options);
    editor.commands.add(options.buttonName, command);

    editor.ui.componentFactory.add(options.buttonName, (locale: unknown) => {
      const button = new ButtonView(locale as any);

      button.set({
        label: options.toolbarText,
        tooltip: options.tooltip,
        withText: true,
      });

      button.bind('isEnabled').to(command, 'isEnabled');
      this.listenTo(button, 'execute', () => editor.execute(options.buttonName));

      return button;
    });

    this.listenTo(editor.editing.view.document, 'dblclick', (_event: unknown, data: any) => {
      const viewElement = findFormulaViewElement(data.target);
      if (!viewElement) return;

      const modelElement = editor.editing.mapper.toModelElement(viewElement);
      if (!modelElement?.is?.('element', 'formulaX')) return;

      editor.model.change((writer: any) => {
        writer.setSelection(modelElement, 'on');
      });

      editor.execute(options.buttonName);
    });
  }
}

export default FormulaX;

function defineFormulaSchema(editor: any): void {
  editor.model.schema.register('formulaX', {
    allowWhere: '$text',
    isInline: true,
    isObject: true,
    allowAttributes: ['latex', 'html'],
  });
}

function defineFormulaConverters(editor: any, options: RequiredFormulaXCKEditor5Options): void {
  editor.conversion.for('upcast').elementToElement({
    view: {
      name: 'span',
      attributes: {
        [FORMULA_FLAG_ATTRIBUTE]: true,
      },
    },
    model: (viewElement: any, { writer }: any) => writer.createElement('formulaX', {
      latex: readFormulaLatexFromView(viewElement, options),
      html: readFormulaHtmlFromView(viewElement),
    }),
  });

  editor.conversion.for('dataDowncast').elementToElement({
    model: 'formulaX',
    view: (modelElement: any, { writer }: any) => createFormulaRawElement(writer, modelElement, options),
  });

  editor.conversion.for('editingDowncast').elementToElement({
    model: 'formulaX',
    view: (modelElement: any, { writer }: any) => {
      const rawElement = createFormulaRawElement(writer, modelElement, options);
      return toWidget(rawElement, writer, { label: 'FormulaX formula' });
    },
  });
}

function createFormulaRawElement(
  writer: any,
  modelElement: any,
  options: RequiredFormulaXCKEditor5Options,
): any {
  const latex = String(modelElement.getAttribute('latex') ?? '');
  const html = String(modelElement.getAttribute('html') ?? '');

  return writer.createRawElement(
    'span',
    {
      class: options.formulaClassName,
      [FORMULA_FLAG_ATTRIBUTE]: 'true',
      [options.formulaAttributeName]: latex,
      'data-latex': latex,
      contenteditable: 'false',
    },
    (domElement: HTMLElement) => {
      domElement.innerHTML = html || `<span class="${escapeAttribute(options.formulaClassName)}__render">${escapeHtml(latex || '\\square')}</span>`;
    },
  );
}

function getSelectedFormulaModelElement(editor: any): any | null {
  const selectedElement = editor.model.document.selection.getSelectedElement();
  return selectedElement?.is?.('element', 'formulaX') ? selectedElement : null;
}

function findFormulaViewElement(viewNode: any): any | null {
  let node = viewNode;

  while (node) {
    if (isFormulaWidgetView(node)) {
      return node;
    }

    node = node.parent;
  }

  return null;
}

function isFormulaWidgetView(node: any): boolean {
  return Boolean(node?.is?.('element') && node.hasAttribute?.(FORMULA_FLAG_ATTRIBUTE));
}

function readFormulaLatexFromView(viewElement: any, options: RequiredFormulaXCKEditor5Options): string {
  return String(
    viewElement.getAttribute(options.formulaAttributeName)
    ?? viewElement.getAttribute('data-latex')
    ?? '',
  );
}

function readFormulaHtmlFromView(viewElement: any): string {
  try {
    return Array.from(viewElement.getChildren?.() ?? [])
      .map((child: any) => child.data ?? '')
      .join('');
  } catch {
    return '';
  }
}

interface OpenFormulaXModalInput {
  initialLatex: string;
  isUpdate: boolean;
  options: RequiredFormulaXCKEditor5Options;
}

function openFormulaXModal(input: OpenFormulaXModalInput): Promise<FormulaXPayload | null> {
  ensureFormulaXStyles(document);

  const root = document.createElement('div');
  root.className = 'fx-ckeditor5-modal-root';
  root.setAttribute('data-formulax-ckeditor5-modal', 'true');

  const submitText = input.isUpdate ? input.options.modal.updateText : input.options.modal.insertText;

  root.innerHTML = `
    <div class="fx-ckeditor5-modal-backdrop" data-action="backdrop"></div>
    <div class="fx-ckeditor5-modal" role="dialog" aria-modal="true" aria-label="${escapeAttribute(input.options.modal.title)}">
      <header class="fx-ckeditor5-modal__header">
        <h2 class="fx-ckeditor5-modal__title">${escapeHtml(input.options.modal.title)}</h2>
        <button class="fx-ckeditor5-modal__close" type="button" data-action="close" aria-label="Close">×</button>
      </header>
      <section class="fx-ckeditor5-modal__body">
        <div class="fx-ckeditor5-editor-host">
          <div class="fx-ckeditor5-editor-loading" role="status" aria-live="polite">Loading FormulaX editor...</div>
        </div>
      </section>
      <footer class="fx-ckeditor5-modal__footer">
        <button class="fx-ckeditor5-modal__button" type="button" data-action="cancel">${escapeHtml(input.options.modal.cancelText)}</button>
        <button class="fx-ckeditor5-modal__button fx-ckeditor5-modal__button--primary" type="button" data-action="submit">${escapeHtml(submitText)}</button>
      </footer>
    </div>
  `;

  document.body.appendChild(root);
  document.body.classList.add('fx-ckeditor5-modal-open');

  const host = root.querySelector<HTMLElement>('.fx-ckeditor5-editor-host');
  if (!host) {
    root.remove();
    return Promise.reject(new Error('[FormulaX] CKEditor 5 modal host not found.'));
  }

  let destroyed = false;
  let handle: KityEditorHandleLike | null = null;
  const initialLatex = input.initialLatex.trim() ? input.initialLatex : EMPTY_FORMULA_PLACEHOLDER;
  const readyPromise = mountKityEditor(host, {
    initialLatex,
    height: input.options.editor.height,
    autofocus: input.options.editor.autofocus,
    assets: input.options.editor.assets,
    render: {
      fontsize: input.options.editor.render.fontsize,
    },
  }).then((nextHandle) => {
    if (destroyed) {
      nextHandle.destroy();
      throw new Error('FormulaX editor mount cancelled');
    }

    handle = nextHandle;
    return nextHandle;
  }).catch((error) => {
    if (!destroyed) {
      host.innerHTML = `
        <div class="fx-ckeditor5-editor-error">
          Failed to load FormulaX editor.
          <pre>${escapeHtml(error instanceof Error ? error.message : String(error))}</pre>
        </div>
      `;
    }
    throw error;
  });

  return new Promise((resolve) => {
    const close = (payload: FormulaXPayload | null): void => {
      if (destroyed) return;
      destroyed = true;
      void readyPromise.then((readyHandle) => readyHandle.destroy()).catch(() => undefined);
      root.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeydown, true);
      root.remove();
      document.body.classList.remove('fx-ckeditor5-modal-open');
      resolve(payload);
    };

    const submit = async (): Promise<void> => {
      try {
        const readyHandle = handle ?? await readyPromise;
        const latex = await readLatexFromKityHandle(readyHandle);
        const html = latex.trim() ? await renderCurrentFormulaAsSvgHtml(host) : '';
        close({ latex, html });
      } catch (error) {
        host.innerHTML = `
          <div class="fx-ckeditor5-editor-error">
            Failed to read FormulaX editor content.
            <pre>${escapeHtml(error instanceof Error ? error.message : String(error))}</pre>
          </div>
        `;
      }
    };

    function onClick(event: MouseEvent): void {
      const action = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')?.dataset.action;
      if (!action) return;

      if (action === 'submit') {
        void submit();
        return;
      }

      if (action === 'cancel' || action === 'close') {
        close(null);
        return;
      }

      if (action === 'backdrop' && input.options.modal.closeOnBackdrop) {
        close(null);
      }
    }

    function onKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(null);
      }
    }

    root.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeydown, true);
  });
}

type KityCommandHost = {
  execCommand: (name: string, value?: string) => unknown;
};

type KityEditorHandleLike = {
  ready: (callback: (this: KityCommandHost) => void) => void;
};

async function readLatexFromKityHandle(handle: KityEditorHandleLike): Promise<string> {
  try {
    let isEmpty = false;
    handle.ready(function ready() {
      const result = this.execCommand('content.is.empty');
      isEmpty = result === true;
    });
    if (isEmpty) return '';
  } catch {
    // ignore and fall back to source commands
  }

  const candidates = ['get.source', 'getSource', 'getLatex', 'get.latex', 'get.content', 'getContent'];

  for (const command of candidates) {
    try {
      let value: unknown = null;
      handle.ready(function ready() {
        value = this.execCommand(command);
      });

      if (typeof value === 'string') return normalizeFormulaLatex(value);
      if (value && typeof value === 'object' && 'latex' in value) {
        const latex = (value as { latex?: unknown }).latex;
        if (typeof latex === 'string') return normalizeFormulaLatex(latex);
      }
    } catch {
      // try next command
    }
  }

  return '';
}

function normalizeFormulaLatex(value: string): string {
  const normalized = value.trim();

  if (!normalized || normalized === EMPTY_FORMULA_PLACEHOLDER.trim()) {
    return '';
  }

  return value;
}

async function renderCurrentFormulaAsSvgHtml(root: HTMLElement): Promise<string> {
  await waitForFormulaSvgLayout(root);

  const svg = root.querySelector<SVGSVGElement>('.kf-editor-edit-area svg, .kf-editor-canvas-container svg, svg');
  if (!svg) return '';

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.removeAttribute('id');
  clone.removeAttribute('xmlns');
  clone.removeAttribute('xmlns:xlink');
  clone.setAttribute('class', mergeClassNames(clone.getAttribute('class'), 'formulax-math__svg'));
  clone.setAttribute('focusable', 'false');
  clone.setAttribute('aria-hidden', 'true');
  clone.setAttribute('preserveAspectRatio', clone.getAttribute('preserveAspectRatio') || 'xMinYMin meet');
  clone.setAttribute('style', mergeInlineStyles(clone.getAttribute('style'), 'height:0.875em', 'width:auto'));

  return new XMLSerializer().serializeToString(clone);
}

async function waitForFormulaSvgLayout(root: HTMLElement): Promise<void> {
  const doc = root.ownerDocument ?? document;
  const view = doc.defaultView ?? window;

  if (doc.fonts?.ready) {
    try {
      await doc.fonts.ready;
    } catch {
      // ignore font readiness errors
    }
  }

  await new Promise<void>((resolve) => view.requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => view.requestAnimationFrame(() => resolve()));
}

const STYLE_ID = 'fx-ckeditor5-formulax-styles';

function ensureFormulaXStyles(doc: Document): void {
  if (doc.getElementById(STYLE_ID)) return;

  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
.fx-ckeditor5-modal-open { overflow: hidden; }
.fx-ckeditor5-modal-root {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fx-ckeditor5-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.48);
}
.fx-ckeditor5-modal {
  --fx-ckeditor5-editor-body-height: 264px;
  --fx-ckeditor5-workspace-height: 168px;
  position: relative;
  width: min(860px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.28);
  display: flex;
  flex-direction: column;
  overflow: visible;
  isolation: isolate;
}
.fx-ckeditor5-modal__header,
.fx-ckeditor5-modal__footer,
.fx-ckeditor5-modal__title,
.fx-ckeditor5-modal__close,
.fx-ckeditor5-modal__button,
.fx-ckeditor5-editor-loading,
.fx-ckeditor5-editor-error {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.fx-ckeditor5-modal__header {
  min-height: 56px;
  padding: 0 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 14px 14px 0 0;
  position: relative;
  z-index: 3;
}
.fx-ckeditor5-modal__title {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
  color: #111827;
}
.fx-ckeditor5-modal__close {
  border: 0;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #6b7280;
}
.fx-ckeditor5-modal__body {
  height: var(--fx-ckeditor5-editor-body-height);
  min-height: var(--fx-ckeditor5-editor-body-height);
  position: relative;
  overflow: visible;
  z-index: 2;
}
.fx-ckeditor5-editor-host,
.fx-ckeditor5-editor-host .kf-editor {
  width: 100%;
  height: var(--fx-ckeditor5-editor-body-height) !important;
  min-height: var(--fx-ckeditor5-editor-body-height);
  overflow: visible !important;
  position: relative;
}
.fx-ckeditor5-editor-host .kf-editor-toolbar {
  overflow: visible;
  position: relative;
  z-index: 20;
}
.fx-ckeditor5-editor-host .kf-editor-ui-button-mount-point,
.fx-ckeditor5-editor-host .kf-editor-ui-area-mount,
.fx-ckeditor5-editor-host .kf-editor-ui-box,
.fx-ckeditor5-editor-host .kf-editor-ui-list {
  z-index: 1000;
}
.fx-ckeditor5-editor-host .kf-editor-edit-area,
.fx-ckeditor5-editor-host .kf-editor-canvas-container {
  min-height: var(--fx-ckeditor5-workspace-height);
  height: var(--fx-ckeditor5-workspace-height);
}
.fx-ckeditor5-editor-host .kf-editor-edit-area {
  flex: 0 0 auto;
  overflow: hidden;
}
.fx-ckeditor5-editor-loading {
  height: var(--fx-ckeditor5-editor-body-height);
  padding: 24px;
  color: #4b5563;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fx-ckeditor5-editor-error {
  padding: 24px;
  color: #dc2626;
  font-size: 14px;
}
.fx-ckeditor5-editor-error pre {
  white-space: pre-wrap;
  word-break: break-all;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
}
.fx-ckeditor5-modal__footer {
  min-height: 64px;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  background: #fff;
  border-radius: 0 0 14px 14px;
  position: relative;
  z-index: 1;
}
.fx-ckeditor5-modal__button {
  appearance: none;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #111827;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
}
.fx-ckeditor5-modal__button--primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}
.formulax-math {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  line-height: 1;
  padding: 0 2px;
  margin: 0 1px;
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
  user-select: none;
}
.formulax-math:hover {
  outline: 1px solid rgba(37, 99, 235, 0.35);
  background: rgba(37, 99, 235, 0.06);
}
.formulax-math__svg {
  display: inline-block;
  flex: 0 0 auto;
  max-width: 100%;
  vertical-align: -0.35em;
  pointer-events: none;
}
.formulax-math__render {
  font-family: "Times New Roman", serif;
}
`;
  doc.head.appendChild(style);
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function mergeClassNames(...values: Array<string | null | undefined>): string {
  return values
    .flatMap((value) => value?.split(/\s+/) ?? [])
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index)
    .join(' ');
}

function mergeInlineStyles(...values: Array<string | null | undefined>): string {
  return values
    .flatMap((value) => value?.split(';') ?? [])
    .map((value) => value.trim())
    .filter(Boolean)
    .join('; ');
}
