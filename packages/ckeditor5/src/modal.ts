import {
  clearFormulaXPerfMarks,
  ensureFormulaXModalStyles,
  markFormulaXPerf,
  measureFormulaXPerf,
  mountFormulaXEditor,
  recordFormulaXPerfPoint,
  renderFormulaXEditorLoadingState,
  waitForFormulaXAnimationFrame,
} from '@formulaxjs/editor';
import { escapeAttribute, escapeHtml } from '@formulaxjs/renderer';
import type { FormulaXPayload, RequiredFormulaXCKEditor5Options } from './types';

export interface OpenFormulaXModalInput {
  initialLatex: string;
  isUpdate: boolean;
  options: RequiredFormulaXCKEditor5Options;
}

export function openFormulaXModal(input: OpenFormulaXModalInput): Promise<FormulaXPayload | null> {
  recordFormulaXPerfPoint('fx:modal:open:start');
  const modalOpenStart = markFormulaXPerf('fx:modal:open:start:scope');
  ensureFormulaXModalStyles(document);

  const root = document.createElement('div');
  root.className = 'fx-formula-modal-root';
  root.setAttribute('data-formulax-modal', 'true');

  const submitText = input.isUpdate ? input.options.modal.updateText : input.options.modal.insertText;

  root.innerHTML = `
    <div class="fx-formula-modal-backdrop" data-action="backdrop"></div>
    <div class="fx-formula-modal" role="dialog" aria-modal="true" aria-label="${escapeAttribute(input.options.modal.title)}">
      <header class="fx-formula-modal__header">
        <h2 class="fx-formula-modal__title">${escapeHtml(input.options.modal.title)}</h2>
        <button class="fx-formula-modal__close" type="button" data-action="close" aria-label="Close">×</button>
      </header>
      <section class="fx-formula-modal__body">
        <div class="fx-formula-editor-host"></div>
      </section>
      <footer class="fx-formula-modal__footer">
        <button class="fx-formula-modal__button" type="button" data-action="cancel">${escapeHtml(input.options.modal.cancelText)}</button>
        <button class="fx-formula-modal__button fx-formula-modal__button--primary" type="button" data-action="submit">${escapeHtml(submitText)}</button>
      </footer>
    </div>
  `;

  document.body.appendChild(root);
  document.body.classList.add('fx-formula-modal-open');
  const modalDomReadyMark = markFormulaXPerf('fx:modal:dom-ready');
  measureFormulaXPerf('fx:modal:dom-ready', modalOpenStart, modalDomReadyMark);
  clearFormulaXPerfMarks(modalDomReadyMark);

  const host = root.querySelector<HTMLElement>('.fx-formula-editor-host');
  if (!host) {
    root.remove();
    clearFormulaXPerfMarks(modalOpenStart);
    return Promise.reject(new Error('[FormulaX] CKEditor 5 modal host not found.'));
  }

  renderFormulaXEditorLoadingState(host);
  let closed = false;
  let mounted: ReturnType<typeof mountFormulaXEditor> | null = null;

  const mountedPromise = waitForFormulaXAnimationFrame()
    .then(() => {
      if (closed) {
        clearFormulaXPerfMarks(modalOpenStart);
        return null;
      }

      const mountStartMark = markFormulaXPerf('fx:modal:editor-mount-start');
      measureFormulaXPerf('fx:modal:editor-mount-start', modalOpenStart, mountStartMark);
      clearFormulaXPerfMarks(mountStartMark);

      const nextMounted = mountFormulaXEditor(host, {
        initialLatex: input.initialLatex,
        height: input.options.editor.height,
        autofocus: input.options.editor.autofocus,
        assets: input.options.editor.assets,
        render: {
          fontsize: input.options.editor.render.fontsize,
        },
      });

      mounted = nextMounted;

      const mountedMark = markFormulaXPerf('fx:modal:editor-mounted');
      measureFormulaXPerf('fx:modal:editor-mounted', modalOpenStart, mountedMark);
      clearFormulaXPerfMarks(mountedMark, modalOpenStart);

      queueMicrotask(() => {
        if (!closed) {
          nextMounted.root.focus();
        }
      });

      return nextMounted;
    })
    .catch((error) => {
      clearFormulaXPerfMarks(modalOpenStart);
      throw error;
    });

  return new Promise((resolve) => {
    const close = (payload: FormulaXPayload | null): void => {
      if (closed) return;
      closed = true;

      mounted?.destroy();
      root.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeydown, true);
      root.remove();
      document.body.classList.remove('fx-formula-modal-open');
      resolve(payload);
    };

    const submit = async (): Promise<void> => {
      try {
        const activeMounted = mounted ?? await mountedPromise;
        if (!activeMounted) {
          return;
        }

        const latex = await activeMounted.getLatex();
        close({ latex });
      } catch (error) {
        host.innerHTML = `
          <div class="fx-formula-editor-error">
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
