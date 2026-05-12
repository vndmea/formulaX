import { Node } from '@tiptap/core';
import { parseLatex, serializeLatex, type FormulaDoc } from '@formulax/core';
import {
  createFormulaElement,
  DEFAULT_FORMULA_ATTRIBUTE,
  DEFAULT_FORMULA_CLASS,
  ensureFormulaXModalStyles,
  getFormulaLatexFromElement,
} from '@formulax/editor';
import { openFormulaXTiptapModal } from './modal';
import type { FormulaXPayload, FormulaXTiptapOptions, RequiredFormulaXTiptapOptions } from './types';

export interface FormulaXNodeAttributes {
  latex: string;
  html: string;
}

export const FORMULAX_NODE_NAME = 'formulaX';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    formulaX: {
      openFormulaX: () => ReturnType;
    };
  }
}

export function resolveOptions(options: FormulaXTiptapOptions = {}): RequiredFormulaXTiptapOptions {
  return {
    formulaClassName: options.formulaClassName ?? DEFAULT_FORMULA_CLASS,
    formulaAttributeName: options.formulaAttributeName ?? DEFAULT_FORMULA_ATTRIBUTE,
    cursorStyle: options.cursorStyle ?? 'pointer',
    initialLatex: options.initialLatex ?? '',
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

const formulaXNodeConfig: any = {
  name: FORMULAX_NODE_NAME,
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  addOptions() {
    return resolveOptions();
  },
  onCreate() {
    if (typeof document !== 'undefined') {
      ensureFormulaXModalStyles(document);
    }
  },
  addAttributes() {
    return {
      latex: {
        default: '',
      },
      html: {
        default: '',
        rendered: false,
      },
    };
  },
  parseHTML() {
    return [{
      tag: 'span[data-formulax]',
      getAttrs: (element: Node | string) => {
        if (!(element instanceof HTMLElement)) {
          return false;
        }

        return {
          latex: getFormulaLatexFromElement(element, this.options.formulaAttributeName),
          html: element.innerHTML,
        };
      },
    }];
  },
  renderHTML({ node }: { node: { attrs: FormulaXNodeAttributes } }) {
    if (typeof document === 'undefined') {
      return [
        'span',
        {
          'data-formulax': 'true',
          [this.options.formulaAttributeName]: node.attrs.latex,
          'data-latex': node.attrs.latex,
        },
        node.attrs.latex || '\\square',
      ] as const;
    }

    return createFormulaDomElement(document, node.attrs, this.options);
  },
  addCommands() {
    return {
      openFormulaX: () => () => {
        const selectedFormula = getSelectedFormula(this.editor);
        const initialLatex = selectedFormula?.attrs.latex ?? this.options.initialLatex;

        void openFormulaXTiptapModal({
          initialLatex,
          isUpdate: Boolean(selectedFormula),
          options: this.options,
        }).then((payload) => {
          if (!payload) {
            return;
          }

          applyFormulaPayload(this.editor, payload, selectedFormula);
          this.editor.commands.focus();
        });

        return true;
      },
    };
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        if (!getSelectedFormula(this.editor)) {
          return false;
        }

        return this.editor.commands.openFormulaX();
      },
      Space: () => {
        if (!getSelectedFormula(this.editor)) {
          return false;
        }

        return this.editor.commands.openFormulaX();
      },
    };
  },
  addNodeView() {
    return ({ editor, getPos, node }: {
      editor: { commands: { openFormulaX: () => boolean; setNodeSelection?: (position: number) => boolean } };
      getPos: () => number;
      node: { attrs: FormulaXNodeAttributes };
    }) => {
      const dom = createFormulaDomElement(document, node.attrs, this.options) ?? document.createElement('span');
      dom.classList.add('formulax-math--interactive');

      const selectNode = (): void => {
        const position = getPos();
        if (typeof position !== 'number') {
          return;
        }

        editor.commands.setNodeSelection?.(position);
      };

      dom.addEventListener('click', (event) => {
        event.preventDefault();
        selectNode();
      });

      dom.addEventListener('dblclick', (event) => {
        event.preventDefault();
        event.stopPropagation();
        selectNode();
        editor.commands.openFormulaX();
      });

      return {
        dom,
        update: (updatedNode: { attrs: FormulaXNodeAttributes; type: { name: string } }) => {
          if (updatedNode.type.name !== FORMULAX_NODE_NAME) {
            return false;
          }

          syncFormulaDomElement(dom, updatedNode.attrs, this.options);
          return true;
        },
        selectNode: () => {
          dom.classList.add('ProseMirror-selectednode');
        },
        deselectNode: () => {
          dom.classList.remove('ProseMirror-selectednode');
        },
      };
    };
  },
};

export interface TiptapNodeFactory {
  create: typeof Node.create;
}

export function createFormulaXNode(
  nodeFactory: TiptapNodeFactory = Node,
  options?: FormulaXTiptapOptions,
) {
  const extension = nodeFactory.create(formulaXNodeConfig) as any;
  return options ? extension.configure(options) : extension;
}

export const FormulaXNode = createFormulaXNode();

export const createFormulaXPayload = (latex: string): FormulaDoc => parseLatex(latex);

export const serializeFormulaXPayload = (doc: FormulaDoc): string => serializeLatex(doc);

function applyFormulaPayload(
  editor: {
    chain: () => {
      focus: () => {
        deleteRange: (range: { from: number; to: number }) => { run: () => boolean };
        insertContent: (content: unknown) => { run: () => boolean };
        insertContentAt: (range: { from: number; to: number }, content: unknown) => { run: () => boolean };
      };
    };
  },
  payload: FormulaXPayload,
  selectedFormula: SelectedFormula | null,
): void {
  const latex = payload.latex.trim();

  if (selectedFormula) {
    if (!latex) {
      editor.chain().focus().deleteRange({
        from: selectedFormula.from,
        to: selectedFormula.to,
      }).run();
      return;
    }

    editor.chain().focus().insertContentAt(
      {
        from: selectedFormula.from,
        to: selectedFormula.to,
      },
      createFormulaNodeContent(payload),
    ).run();
    return;
  }

  if (!latex) {
    return;
  }

  editor.chain().focus().insertContent(createFormulaNodeContent(payload)).run();
}

interface SelectedFormula {
  from: number;
  to: number;
  attrs: FormulaXNodeAttributes;
}

function getSelectedFormula(editor: {
  state: {
    selection: {
      from: number;
      to: number;
      node?: { type?: { name?: string }; attrs?: FormulaXNodeAttributes };
    };
  };
}): SelectedFormula | null {
  const { selection } = editor.state;
  const node = selection.node;

  if (node?.type?.name !== FORMULAX_NODE_NAME) {
    return null;
  }

  return {
    from: selection.from,
    to: selection.to,
    attrs: {
      latex: node.attrs?.latex ?? '',
      html: node.attrs?.html ?? '',
    },
  };
}

function createFormulaNodeContent(payload: FormulaXPayload): {
  type: string;
  attrs: FormulaXNodeAttributes;
} {
  return {
    type: FORMULAX_NODE_NAME,
    attrs: {
      latex: payload.latex,
      html: payload.html ?? '',
    },
  };
}

function createFormulaDomElement(
  ownerDocument: Document,
  attrs: FormulaXNodeAttributes,
  options: RequiredFormulaXTiptapOptions,
): HTMLElement | null {
  return createFormulaElement(ownerDocument, attrs.latex, {
    attributeName: options.formulaAttributeName,
    className: options.formulaClassName,
    cursorStyle: options.cursorStyle,
    renderHtml: attrs.html || undefined,
  });
}

function syncFormulaDomElement(
  dom: HTMLElement,
  attrs: FormulaXNodeAttributes,
  options: RequiredFormulaXTiptapOptions,
): void {
  const next = createFormulaDomElement(dom.ownerDocument ?? document, attrs, options);
  if (!next) {
    return;
  }

  dom.replaceChildren(...Array.from(next.childNodes));
  Array.from(dom.attributes).forEach((attribute) => {
    if (attribute.name === 'class') {
      return;
    }

    dom.removeAttribute(attribute.name);
  });

  Array.from(next.attributes).forEach((attribute) => {
    dom.setAttribute(attribute.name, attribute.value);
  });
}

export type { FormulaXPayload, FormulaXTiptapOptions, RequiredFormulaXTiptapOptions } from './types';
export { openFormulaXTiptapModal } from './modal';
