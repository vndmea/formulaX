import { Node } from '@tiptap/core';
import { DEFAULT_FORMULAX_LOCALE } from '@formulaxjs/kity-runtime';
import { parseLatex, serializeLatex, type FormulaDoc } from '@formulaxjs/core';
import {
  createFormulaElement,
  DEFAULT_FORMULA_ATTRIBUTE,
  DEFAULT_FORMULA_CLASS,
  ensureFormulaXBaseStyles,
  getFormulaLatexFromElement,
} from '@formulaxjs/renderer';
import {
  createFormulaDisplayAttributes,
  createFormulaImageHtml,
  FORMULAX_IMAGE_HEIGHT_ATTRIBUTE,
  FORMULAX_IMAGE_STYLE_ATTRIBUTE,
  FORMULAX_IMAGE_URL_ATTRIBUTE,
  FORMULAX_IMAGE_WIDTH_ATTRIBUTE,
  FORMULAX_OUTPUT_ATTRIBUTE,
} from '@formulaxjs/renderer-image';
import { createKityFormulaRenderer } from '@formulaxjs/renderer-kity';
import {
  ensureFormulaXModalStyles,
  getFormulaXEditorMessage,
  scheduleFormulaXEditorPreload,
} from '@formulaxjs/editor';
import { openFormulaXTiptapModal } from './modal';
import type { FormulaXPayload, FormulaXTiptapOptions, RequiredFormulaXTiptapOptions } from './types';

export interface FormulaXNodeAttributes {
  latex: string;
  output: 'svg' | 'image';
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  imageStyle: string | null;
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
  const locale = options.editor?.locale ?? DEFAULT_FORMULAX_LOCALE;

  return {
    name: options.name ?? FORMULAX_NODE_NAME,
    formulaClassName: options.formulaClassName ?? DEFAULT_FORMULA_CLASS,
    formulaAttributeName: options.formulaAttributeName ?? DEFAULT_FORMULA_ATTRIBUTE,
    cursorStyle: options.cursorStyle ?? 'pointer',
    initialLatex: options.initialLatex ?? '',
    output: options.output ?? 'svg',
    image: options.image,
    renderer: options.renderer ?? createKityFormulaRenderer({
      fontSize: options.editor?.render?.fontsize ?? 40,
      height: options.editor?.height ?? '100%',
      assets: options.editor?.assets ?? {},
    }),
    preload: options.preload ?? 'idle',
    modal: {
      title: options.modal?.title ?? getFormulaXEditorMessage('modal.title', locale),
      insertText: options.modal?.insertText ?? getFormulaXEditorMessage('modal.insert', locale),
      updateText: options.modal?.updateText ?? getFormulaXEditorMessage('modal.update', locale),
      cancelText: options.modal?.cancelText ?? getFormulaXEditorMessage('modal.cancel', locale),
      closeOnBackdrop: options.modal?.closeOnBackdrop ?? true,
    },
    editor: {
      height: options.editor?.height ?? '100%',
      autofocus: options.editor?.autofocus ?? true,
      locale,
      assets: options.editor?.assets ?? {},
      render: {
        fontsize: options.editor?.render?.fontsize ?? 40,
      },
    },
  };
}

function warnDuplicateNodeName(extension: {
  name: string;
  editor?: { extensionManager?: { extensions?: Array<{ name?: string }> } };
}) {
  const extensions = extension.editor?.extensionManager?.extensions ?? [];
  const duplicates = extensions.filter((item) => item?.name === extension.name);

  if (duplicates.length > 1) {
    console.warn(
      `[FormulaX] TipTap node name "${extension.name}" is already registered. ` +
      'Pass a unique "name" option to avoid schema collisions.',
    );
  }
}

function createFormulaXNodeConfig(options: RequiredFormulaXTiptapOptions): any {
  return {
    name: options.name,
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,
    addOptions() {
      return options;
    },
    addStorage() {
      return {
        preloadCleanup: null as null | (() => void),
      };
    },
    onCreate() {
      warnDuplicateNodeName(this);

      if (typeof document !== 'undefined') {
        ensureFormulaXBaseStyles(document);
        ensureFormulaXModalStyles(document);
      }

      const preloadCleanup = scheduleFormulaXEditorPreload(
        options.preload,
        this.editor?.view?.dom ?? null,
      );

      if (this.storage) {
        this.storage.preloadCleanup = preloadCleanup;
      }
    },
    onDestroy() {
      this.storage?.preloadCleanup?.();

      if (this.storage) {
        this.storage.preloadCleanup = null;
      }
    },
    addAttributes() {
      return {
        latex: {
          default: '',
        },
        output: {
          default: 'svg',
        },
        imageUrl: {
          default: null,
        },
        imageWidth: {
          default: null,
        },
        imageHeight: {
          default: null,
        },
        imageStyle: {
          default: null,
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
            output: readOutputModeFromElement(element),
            imageUrl: readImageUrlFromElement(element),
            imageWidth: readImageDimension(
              element.getAttribute(FORMULAX_IMAGE_WIDTH_ATTRIBUTE)
              ?? element.querySelector('img[data-formulax-image]')?.getAttribute('width'),
            ),
            imageHeight: readImageDimension(
              element.getAttribute(FORMULAX_IMAGE_HEIGHT_ATTRIBUTE)
              ?? element.querySelector('img[data-formulax-image]')?.getAttribute('height'),
            ),
            imageStyle: readImageStyleFromElement(element),
          };
        },
      }];
    },
    renderHTML({ node }: { node: { attrs: FormulaXNodeAttributes } }) {
      if (node.attrs.output === 'image' && node.attrs.imageUrl) {
        return [
          'span',
          createFormulaNodeRootAttributes(node.attrs, this.options),
          [
            'img',
            createFormulaImageViewAttributes(node.attrs, this.options),
          ],
        ] as const;
      }

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
          const selectedFormula = getSelectedFormula(this.editor, this.name);
          const initialLatex = selectedFormula?.attrs.latex ?? this.options.initialLatex;

          void openFormulaXTiptapModal({
            initialLatex,
            isUpdate: Boolean(selectedFormula),
            options: this.options,
          }).then((payload) => {
            if (!payload) {
              return;
            }

            applyFormulaPayload(this.editor, payload, selectedFormula, this.name);
            this.editor.commands.focus();
          });

          return true;
        },
      };
    },
    addKeyboardShortcuts() {
      return {
        Enter: () => {
          if (!getSelectedFormula(this.editor, this.name)) {
            return false;
          }

          return this.editor.commands.openFormulaX();
        },
        Space: () => {
          if (!getSelectedFormula(this.editor, this.name)) {
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
        void renderFormulaIntoElement(dom, node.attrs, this.options);

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
            if (updatedNode.type.name !== this.name) {
              return false;
            }

            syncFormulaDomElement(dom, updatedNode.attrs, this.options);
            void renderFormulaIntoElement(dom, updatedNode.attrs, this.options);
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
}

export interface TiptapNodeFactory {
  create: typeof Node.create;
}

export function createFormulaXNode(
  nodeFactory: TiptapNodeFactory = Node,
  options?: FormulaXTiptapOptions,
) {
  return nodeFactory.create(createFormulaXNodeConfig(resolveOptions(options))) as any;
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
  nodeName: string,
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
      createFormulaNodeContent(payload, nodeName),
    ).run();
    return;
  }

  if (!latex) {
    return;
  }

  editor.chain().focus().insertContent(createFormulaNodeContent(payload, nodeName)).run();
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
}, nodeName: string): SelectedFormula | null {
  const { selection } = editor.state;
  const node = selection.node;

  if (node?.type?.name !== nodeName) {
    return null;
  }

  return {
    from: selection.from,
    to: selection.to,
    attrs: {
      latex: node.attrs?.latex ?? '',
      output: node.attrs?.output ?? 'svg',
      imageUrl: node.attrs?.imageUrl ?? null,
      imageWidth: node.attrs?.imageWidth ?? null,
      imageHeight: node.attrs?.imageHeight ?? null,
      imageStyle: node.attrs?.imageStyle ?? null,
    },
  };
}

function createFormulaNodeContent(
  payload: FormulaXPayload,
  nodeName = FORMULAX_NODE_NAME,
): {
  type: string;
  attrs: FormulaXNodeAttributes;
} {
  return {
    type: nodeName,
    attrs: {
      latex: payload.latex,
      output: payload.output ?? 'svg',
      imageUrl: payload.image?.url ?? null,
      imageWidth: payload.image?.width ?? null,
      imageHeight: payload.image?.height ?? null,
      imageStyle: payload.image?.style ?? null,
    },
  };
}

function createFormulaDomElement(
  ownerDocument: Document,
  attrs: FormulaXNodeAttributes,
  options: RequiredFormulaXTiptapOptions,
): HTMLElement | null {
  if (attrs.output === 'image' && attrs.imageUrl) {
    return createFormulaElement(ownerDocument, attrs.latex, {
      attributeName: options.formulaAttributeName,
      className: options.formulaClassName,
      cursorStyle: options.cursorStyle,
      renderHtml: createFormulaImageHtml({
        src: attrs.imageUrl,
        latex: attrs.latex,
        className: options.formulaClassName,
        width: attrs.imageWidth ?? undefined,
        height: attrs.imageHeight ?? undefined,
        style: attrs.imageStyle ?? undefined,
      }),
      extraAttributes: createFormulaNodeExtraAttributes(attrs),
    });
  }

  return createFormulaElement(ownerDocument, attrs.latex, {
    attributeName: options.formulaAttributeName,
    className: options.formulaClassName,
    cursorStyle: options.cursorStyle,
    extraAttributes: createFormulaNodeExtraAttributes(attrs),
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

async function renderFormulaIntoElement(
  dom: HTMLElement,
  attrs: FormulaXNodeAttributes,
  options: RequiredFormulaXTiptapOptions,
): Promise<void> {
  const latex = attrs.latex.trim();
  if (attrs.output === 'image' && attrs.imageUrl) {
    delete dom.dataset.renderToken;
    dom.innerHTML = createFormulaImageHtml({
      src: attrs.imageUrl,
      latex: attrs.latex,
      className: options.formulaClassName,
      width: attrs.imageWidth ?? undefined,
      height: attrs.imageHeight ?? undefined,
      style: attrs.imageStyle ?? undefined,
    });
    return;
  }

  const renderToken = `${latex}::${Date.now()}::${Math.random().toString(36).slice(2, 8)}`;
  dom.dataset.renderToken = renderToken;

  if (!latex) {
    const placeholder = dom.querySelector<HTMLElement>(`.${options.formulaClassName}__render`);
    if (placeholder) {
      placeholder.textContent = '\\square';
    }
    return;
  }

  try {
    const result = await options.renderer.renderLatex(latex, {
      fontSize: options.editor.render.fontsize,
      className: options.formulaClassName,
    });
    if (dom.dataset.renderToken !== renderToken) {
      return;
    }

    dom.innerHTML = result.html;
  } catch (error) {
    if (dom.dataset.renderToken !== renderToken) {
      return;
    }

    console.error('[FormulaX] Failed to render Tiptap formula node:', error);
    const placeholder = dom.querySelector<HTMLElement>(`.${options.formulaClassName}__render`);
    if (placeholder) {
      placeholder.textContent = latex;
    }
  }
}

function createFormulaNodeExtraAttributes(
  attrs: FormulaXNodeAttributes,
): Record<string, string | undefined> {
  return createFormulaDisplayAttributes({
    output: attrs.output,
    latex: attrs.latex,
    renderHtml: '',
    source: {
      engine: 'tiptap',
      output: 'svg',
      latex: attrs.latex,
      html: '',
    },
    image: attrs.output === 'image' && attrs.imageUrl
      ? {
          url: attrs.imageUrl,
          width: attrs.imageWidth ?? 0,
          height: attrs.imageHeight ?? 0,
          displayStyle: attrs.imageStyle ?? undefined,
        }
      : undefined,
  });
}

function createFormulaNodeRootAttributes(
  attrs: FormulaXNodeAttributes,
  options: RequiredFormulaXTiptapOptions,
): Record<string, string> {
  const imageAttributes = createFormulaNodeExtraAttributes(attrs);

  return {
    class: options.formulaClassName,
    'data-formulax': 'true',
    [options.formulaAttributeName]: attrs.latex,
    'data-latex': attrs.latex,
    contenteditable: 'false',
    role: 'button',
    tabindex: '0',
    style: `cursor: ${options.cursorStyle}`,
    ...Object.fromEntries(
      Object.entries(imageAttributes).filter(([, value]) => typeof value === 'string'),
    ) as Record<string, string>,
  };
}

function createFormulaImageViewAttributes(
  attrs: FormulaXNodeAttributes,
  options: RequiredFormulaXTiptapOptions,
): Record<string, string> {
  return {
    class: `${options.formulaClassName}__image`,
    src: attrs.imageUrl ?? '',
    alt: attrs.latex,
    'data-formulax-image': 'true',
    ...(attrs.imageWidth ? { width: String(attrs.imageWidth) } : {}),
    ...(attrs.imageHeight ? { height: String(attrs.imageHeight) } : {}),
    ...(attrs.imageStyle ? { style: attrs.imageStyle } : {}),
  };
}

function readOutputModeFromElement(element: HTMLElement): 'svg' | 'image' {
  const explicit = element.getAttribute(FORMULAX_OUTPUT_ATTRIBUTE);
  if (explicit === 'image') {
    return 'image';
  }

  return element.querySelector('img[data-formulax-image]') ? 'image' : 'svg';
}

function readImageUrlFromElement(element: HTMLElement): string | null {
  return element.getAttribute(FORMULAX_IMAGE_URL_ATTRIBUTE)
    ?? element.querySelector('img[data-formulax-image]')?.getAttribute('src')
    ?? null;
}

function readImageStyleFromElement(element: HTMLElement): string | null {
  return element.getAttribute(FORMULAX_IMAGE_STYLE_ATTRIBUTE)
    ?? element.querySelector('img[data-formulax-image]')?.getAttribute('style')
    ?? null;
}

function readImageDimension(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export type { FormulaXPayload, FormulaXTiptapOptions, RequiredFormulaXTiptapOptions } from './types';
export { openFormulaXTiptapModal } from './modal';
