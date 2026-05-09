import type { FormulaXModalOpenOptions, TinyMceEditorLike } from './types';
import { ensureTinyMceStyles } from './styles';
import { mountFormulaXEditorInModal } from './editor-host';
import {
  createTinyMceFormulaElement,
  createTinyMceFormulaMarkup,
  escapeAttribute,
  escapeHtml,
  getFormulaLatexFromElement,
  replaceFormulaElement,
} from './markup';

export interface OpenFormulaXModalResult {
  close: () => void;
}

export function openFormulaXOverlayModal(input: FormulaXModalOpenOptions): OpenFormulaXModalResult {
  ensureTinyMceStyles(document);

  const { editor, target, options } = input;
  const initialLatex = target
    ? getFormulaLatexFromElement(target, options.formulaAttributeName)
    : input.initialLatex ?? options.initialLatex ?? '';

  const root = document.createElement('div');
  root.className = 'fx-tinymce-modal-root';
  root.setAttribute('data-formulax-modal', 'true');

  const isUpdate = Boolean(target);
  const submitText = isUpdate ? options.modal.updateText : options.modal.insertText;
  const title = options.modal.title || (isUpdate ? 'Edit Formula' : 'Insert Formula');

  root.innerHTML = `
    <div class="fx-tinymce-modal-backdrop" data-action="backdrop"></div>
    <div class="fx-tinymce-modal" role="dialog" aria-modal="true" aria-label="${escapeAttribute(title)}">
      <header class="fx-tinymce-modal__header">
        <h2 class="fx-tinymce-modal__title">${escapeHtml(title)}</h2>
        <button class="fx-tinymce-modal__close" type="button" data-action="close" aria-label="Close">×</button>
      </header>
      <section class="fx-tinymce-modal__body">
        <div class="fx-tinymce-editor-host"></div>
      </section>
      <footer class="fx-tinymce-modal__footer">
        <button class="fx-tinymce-modal__button" type="button" data-action="cancel">${escapeHtml(options.modal.cancelText)}</button>
        <button class="fx-tinymce-modal__button fx-tinymce-modal__button--primary" type="button" data-action="submit">${escapeHtml(submitText)}</button>
      </footer>
    </div>
  `;

  document.body.appendChild(root);
  document.body.classList.add('fx-tinymce-modal-open');

  const host = root.querySelector<HTMLElement>('.fx-tinymce-editor-host');
  if (!host) {
    root.remove();
    throw new Error('[FormulaX] Modal editor host not found.');
  }

  const mounted = mountFormulaXEditorInModal(host, { initialLatex, options });
  let closed = false;

  const close = (): void => {
    if (closed) return;
    closed = true;

    mounted.destroy();
    root.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onKeydown, true);
    root.remove();
    document.body.classList.remove('fx-tinymce-modal-open');
    editor.focus?.();
  };

  const submit = async (): Promise<void> => {
    const latex = await mounted.getLatex();
    const renderHtml = mounted.getRenderHtml ? await mounted.getRenderHtml() : undefined;

    runEditorTransaction(editor, () => {
      if (target) {
        replaceFormulaElement(target, latex, {
          attributeName: options.formulaAttributeName,
          className: options.formulaClassName,
          renderHtml,
        });
      } else {
        insertFormulaElementIntoEditor(editor, latex, options.formulaAttributeName, options.formulaClassName, renderHtml);
      }

      notifyEditorChanged(editor);
    });

    close();
  };

  function onClick(event: MouseEvent): void {
    const action = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')?.dataset.action;
    if (!action) return;

    if (action === 'submit') {
      void submit();
      return;
    }

    if (action === 'cancel' || action === 'close') {
      close();
      return;
    }

    if (action === 'backdrop' && options.modal.closeOnBackdrop) {
      close();
    }
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }

  root.addEventListener('click', onClick);
  document.addEventListener('keydown', onKeydown, true);

  queueMicrotask(() => {
    mounted.root.focus();
  });

  return { close };
}

function runEditorTransaction(editor: TinyMceEditorLike, mutation: () => void): void {
  if (typeof editor.undoManager?.transact === 'function') {
    editor.undoManager.transact(mutation);
    return;
  }

  mutation();
  editor.undoManager?.add?.();
}

function insertFormulaElementIntoEditor(
  editor: TinyMceEditorLike,
  latex: string,
  attributeName: string,
  className: string,
  renderHtml?: string,
): void {
  const editorDoc = editor.getDoc?.() ?? document;
  const next = createTinyMceFormulaElement(editorDoc, latex, {
    attributeName,
    className,
    renderHtml,
  });

  if (next && insertNodeAtEditorSelection(editor, next)) {
    return;
  }

  insertFormulaElementWithPlaceholder(editor, latex, attributeName, className, renderHtml);
}

function insertNodeAtEditorSelection(editor: TinyMceEditorLike, node: HTMLElement): boolean {
  const range = getEditorRange(editor);
  if (!range || !isRangeInsideEditor(editor, range)) {
    return false;
  }

  try {
    range.deleteContents();
    range.insertNode(node);
    moveSelectionAfterNode(editor, node);
    return true;
  } catch {
    return false;
  }
}

function getEditorRange(editor: TinyMceEditorLike): Range | null {
  try {
    return editor.selection?.getRng?.() ?? null;
  } catch {
    return null;
  }
}

function isRangeInsideEditor(editor: TinyMceEditorLike, range: Range): boolean {
  const editorDoc = editor.getDoc?.() ?? document;
  if (range.startContainer.ownerDocument !== editorDoc || range.endContainer.ownerDocument !== editorDoc) {
    return false;
  }

  const body = editor.getBody?.();
  if (!body) {
    return true;
  }

  return body.contains(getRangeContainerElement(range.startContainer))
    && body.contains(getRangeContainerElement(range.endContainer));
}

function getRangeContainerElement(node: Node): Node {
  return node.nodeType === Node.ELEMENT_NODE ? node : node.parentNode ?? node;
}

function moveSelectionAfterNode(editor: TinyMceEditorLike, node: HTMLElement): void {
  const doc = node.ownerDocument;
  const range = doc.createRange();
  range.setStartAfter(node);
  range.collapse(true);

  try {
    editor.selection?.setRng?.(range);
    editor.selection?.collapse?.(false);
  } catch {
    // Ignore selection restoration failures across TinyMCE versions.
  }
}

function insertFormulaElementWithPlaceholder(
  editor: TinyMceEditorLike,
  latex: string,
  attributeName: string,
  className: string,
  renderHtml?: string,
): void {
  const editorDoc = editor.getDoc?.() ?? document;
  const marker = `fx-pending-${Math.random().toString(36).slice(2, 10)}`;
  editor.insertContent(`<span data-formulax-pending="${escapeAttribute(marker)}">&#xfeff;</span>`);

  const placeholder = editorDoc.querySelector<HTMLElement>(`[data-formulax-pending="${marker}"]`);
  if (!placeholder) {
    const html = createTinyMceFormulaMarkup(latex, {
      attributeName,
      className,
      renderHtml,
    });
    editor.insertContent(html);
    return;
  }

  const next = createTinyMceFormulaElement(editorDoc, latex, {
    attributeName,
    className,
    renderHtml,
  });

  if (!next) {
    placeholder.remove();
    return;
  }

  placeholder.replaceWith(next);
  moveSelectionAfterNode(editor, next);
}

function notifyEditorChanged(editor: TinyMceEditorLike): void {
  editor.nodeChanged?.();
  editor.dispatch?.('change');
  editor.fire?.('change');
}
