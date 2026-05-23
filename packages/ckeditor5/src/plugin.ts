import {
  ButtonView,
  Command,
  Plugin,
  Widget,
  toWidget,
  viewToModelPositionOutsideModelElement,
} from 'ckeditor5';
import { DEFAULT_FORMULAX_LOCALE } from '@formulaxjs/kity-runtime';
import {
  DEFAULT_FORMULA_ATTRIBUTE,
  DEFAULT_FORMULA_CLASS,
  FORMULA_FLAG_ATTRIBUTE,
  createFormulaMarkup,
  ensureFormulaXBaseStyles,
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
  resolveFormulaXIcon,
  resolveFormulaXIconName,
  scheduleFormulaXEditorPreload,
} from '@formulaxjs/editor';
import { openFormulaXModal } from './modal';
import type {
  FormulaXCKEditor5Options,
  FormulaXPayload,
  RequiredFormulaXCKEditor5Options,
} from './types';

const DEFAULT_BUTTON_NAME = 'formulaX';
const DEFAULT_MODEL_NAME = 'formulaX';

export { DEFAULT_BUTTON_NAME, DEFAULT_MODEL_NAME };

export function resolveOptions(options: FormulaXCKEditor5Options = {}): RequiredFormulaXCKEditor5Options {
  const locale = options.editor?.locale ?? DEFAULT_FORMULAX_LOCALE;

  return {
    name: options.name ?? DEFAULT_MODEL_NAME,
    buttonName: options.buttonName ?? DEFAULT_BUTTON_NAME,
    toolbarText: options.toolbarText ?? 'FormulaX',
    tooltip: options.tooltip ?? 'Insert or edit formula',
    formulaIcon: resolveFormulaXIcon(options),
    formulaIconName: resolveFormulaXIconName(options),
    cursorStyle: options.cursorStyle ?? 'pointer',
    formulaClassName: options.formulaClassName ?? DEFAULT_FORMULA_CLASS,
    formulaAttributeName: options.formulaAttributeName ?? DEFAULT_FORMULA_ATTRIBUTE,
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

export class FormulaXCommand extends Command {
  private readonly options: RequiredFormulaXCKEditor5Options;

  constructor(editor: unknown, options: RequiredFormulaXCKEditor5Options) {
    super(editor as any);
    this.options = options;
  }

  override refresh(): void {
    this.isEnabled = true;
  }

  override execute(): void {
    const editor = this.editor as any;
    const selectedFormula = getSelectedFormulaModelElement(editor, this.options.name);
    const initialLatex = String(selectedFormula?.getAttribute('latex') ?? '');

    void openFormulaXModal({
      initialLatex,
      isUpdate: Boolean(selectedFormula),
      options: this.options,
    }).then((payload) => {
      if (!payload) return;
      applyFormulaPayload(editor, selectedFormula, payload, this.options.name);
      editor.editing.view.focus();
    });
  }
}

export class FormulaX extends Plugin {
  private preloadCleanup: (() => void) | null = null;

  static get pluginName(): string {
    return 'FormulaX';
  }

  static get requires(): readonly [typeof Widget] {
    return [Widget];
  }

  init(): void {
    const editor = this.editor as any;
    const options = resolveOptions(editor.config.get('formulaX') as FormulaXCKEditor5Options | undefined);

    if (hasRegisteredFormulaModelName(editor, options.name)) {
      console.error(
        `[FormulaX] CKEditor5 model name "${options.name}" is already registered. ` +
        'Pass a unique "name" option to avoid schema collisions.',
      );
      return;
    }

    ensureFormulaXBaseStyles(document);
    ensureFormulaXModalStyles(document);
    this.preloadCleanup = scheduleFormulaXEditorPreload(
      options.preload,
      getEditorPreloadTarget(editor),
    );
    defineFormulaSchema(editor, options.name);
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
        icon: options.formulaIcon,
        tooltip: options.tooltip,
        withText: false,
      });

      button.bind('isEnabled').to(command, 'isEnabled');
      this.listenTo(button, 'execute', () => editor.execute(options.buttonName));

      return button;
    });
  }

  override destroy(): void {
    this.preloadCleanup?.();
    this.preloadCleanup = null;
    super.destroy();
  }
}

export default FormulaX;

function applyFormulaPayload(
  editor: any,
  selectedFormula: any,
  payload: FormulaXPayload,
  modelName: string,
): void {
  editor.model.change((writer: any) => {
    if (selectedFormula) {
      if (!payload.latex.trim()) {
        writer.remove(selectedFormula);
        return;
      }

      const attrs = createFormulaModelAttributes(payload);
      writer.setAttribute('latex', attrs.latex, selectedFormula);
      writer.setAttribute('output', attrs.output, selectedFormula);

      if (attrs.imageUrl) {
        writer.setAttribute('imageUrl', attrs.imageUrl, selectedFormula);
        writer.setAttribute('imageWidth', attrs.imageWidth, selectedFormula);
        writer.setAttribute('imageHeight', attrs.imageHeight, selectedFormula);
        writer.setAttribute('imageStyle', attrs.imageStyle, selectedFormula);
      } else {
        writer.removeAttribute('imageUrl', selectedFormula);
        writer.removeAttribute('imageWidth', selectedFormula);
        writer.removeAttribute('imageHeight', selectedFormula);
        writer.removeAttribute('imageStyle', selectedFormula);
      }
      return;
    }

    if (!payload.latex.trim()) return;

    const formula = writer.createElement(modelName, createFormulaModelAttributes(payload));

    editor.model.insertObject(formula, null, null, { setSelection: 'after' });
  });
}

function hasRegisteredFormulaModelName(editor: any, modelName: string): boolean {
  const schema = editor?.model?.schema;

  if (!schema) {
    return false;
  }

  if (typeof schema.isRegistered === 'function') {
    return Boolean(schema.isRegistered(modelName));
  }

  if (typeof schema.getDefinition === 'function') {
    return Boolean(schema.getDefinition(modelName));
  }

  if (schema._sourceDefinitions?.has) {
    return Boolean(schema._sourceDefinitions.has(modelName));
  }

  return Boolean(schema._definitions?.[modelName]);
}

function defineFormulaSchema(editor: any, modelName: string): void {
  editor.model.schema.register(modelName, {
    allowWhere: '$text',
    isInline: true,
    isObject: true,
    allowAttributes: ['latex', 'output', 'imageUrl', 'imageWidth', 'imageHeight', 'imageStyle'],
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
    model: (viewElement: any, { writer }: any) => writer.createElement(options.name, {
      latex: readFormulaLatexFromView(viewElement, options),
      output: readFormulaOutputFromView(viewElement),
      imageUrl: readFormulaImageUrlFromView(viewElement),
      imageWidth: readFormulaImageDimensionFromView(
        viewElement,
        FORMULAX_IMAGE_WIDTH_ATTRIBUTE,
        'width',
      ),
      imageHeight: readFormulaImageDimensionFromView(
        viewElement,
        FORMULAX_IMAGE_HEIGHT_ATTRIBUTE,
        'height',
      ),
      imageStyle: readFormulaImageStyleFromView(viewElement),
    }),
  });

  editor.conversion.for('dataDowncast').elementToElement({
    model: createFormulaConverterModelDefinition(options.name),
    view: (modelElement: any, { writer }: any) => createFormulaRawElement(writer, modelElement, options),
  });

  editor.conversion.for('editingDowncast').elementToElement({
    model: createFormulaConverterModelDefinition(options.name),
    view: (modelElement: any, { writer }: any) => {
      const widgetElement = createFormulaWidgetElement(writer, modelElement, options, editor);
      return toWidget(widgetElement, writer, { label: 'FormulaX formula' });
    },
  });
}

function createFormulaConverterModelDefinition(modelName: string): {
  name: string;
  attributes: string[];
} {
  return {
    name: modelName,
    attributes: ['latex', 'output', 'imageUrl', 'imageWidth', 'imageHeight', 'imageStyle'],
  };
}

function createFormulaRawElement(
  writer: any,
  modelElement: any,
  options: RequiredFormulaXCKEditor5Options,
): any {
  const attrs = readFormulaModelElementState(modelElement);
  const element = writer.createContainerElement('span', createFormulaViewAttributes(attrs, options));

  if (attrs.output === 'image' && attrs.imageUrl) {
    writer.insert(
      writer.createPositionAt(element, 0),
      writer.createEmptyElement('img', createFormulaImageViewAttributes(attrs, options)),
    );
    return element;
  }

  writer.insert(writer.createPositionAt(element, 0), writer.createText(attrs.latex || '\\square'));

  return element;
}

function createFormulaWidgetElement(
  writer: any,
  modelElement: any,
  options: RequiredFormulaXCKEditor5Options,
  editor: any,
): any {
  const attrs = readFormulaModelElementState(modelElement);
  const widgetElement = writer.createContainerElement(
    'span',
    createFormulaViewAttributes(attrs, options),
  );
  const contentElement = writer.createRawElement(
    'span',
    {
      class: `${options.formulaClassName}__content`,
      'aria-hidden': 'true',
    },
    (domElement: HTMLElement) => {
      domElement.innerHTML = createFormulaFallbackMarkup(attrs, options);
      void renderFormulaIntoElement(domElement, attrs, options);
      bindFormulaWidgetDomEvents(domElement, editor, modelElement, options.buttonName);
    },
  );

  writer.insert(writer.createPositionAt(widgetElement, 0), contentElement);

  return widgetElement;
}

function createFormulaViewAttributes(
  attrs: FormulaModelState,
  options: RequiredFormulaXCKEditor5Options,
): Record<string, string> {
  const imageAttributes = createFormulaDisplayAttributes({
    output: attrs.output,
    latex: attrs.latex,
    renderHtml: '',
    source: {
      engine: 'ckeditor5',
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

  return {
    class: options.formulaClassName,
    [FORMULA_FLAG_ATTRIBUTE]: 'true',
    [options.formulaAttributeName]: attrs.latex,
    'data-latex': attrs.latex,
    contenteditable: 'false',
    role: 'button',
    style: `cursor: ${options.cursorStyle}`,
    tabindex: '0',
    ...Object.fromEntries(
      Object.entries(imageAttributes).filter(([, value]) => typeof value === 'string'),
    ) as Record<string, string>,
  };
}

function bindFormulaWidgetDomEvents(
  domElement: HTMLElement,
  editor: any,
  modelElement: any,
  commandName: string,
): void {
  domElement.onclick = (event) => {
    event.preventDefault();
    selectFormulaModelElement(editor, modelElement);
  };

  domElement.ondblclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    selectFormulaModelElement(editor, modelElement);
    editor.execute(commandName);
  };
}

function selectFormulaModelElement(editor: any, modelElement: any): void {
  if (!modelElement?.is?.('element', 'formulaX')) {
    return;
  }

  editor.editing.view.focus();
  editor.model.change((writer: any) => {
    writer.setSelection(modelElement, 'on');
  });
}

function createFormulaFallbackMarkup(
  attrs: FormulaModelState,
  options: RequiredFormulaXCKEditor5Options,
): string {
  if (attrs.output === 'image' && attrs.imageUrl) {
    return createFormulaImageHtml({
      src: attrs.imageUrl,
      latex: attrs.latex,
      className: options.formulaClassName,
      width: attrs.imageWidth ?? undefined,
      height: attrs.imageHeight ?? undefined,
      style: attrs.imageStyle ?? undefined,
    });
  }

  const markup = createFormulaMarkup(attrs.latex, {
    attributeName: options.formulaAttributeName,
    className: options.formulaClassName,
  });
  return extractInnerHtml(markup);
}

function extractInnerHtml(markup: string): string {
  const wrapper = document.createElement('span');
  wrapper.innerHTML = markup;
  return wrapper.firstElementChild?.innerHTML ?? '';
}

function getEditorPreloadTarget(editor: any): EventTarget | null {
  return editor?.ui?.getEditableElement?.()
    ?? editor?.ui?.view?.editable?.element
    ?? null;
}

function getSelectedFormulaModelElement(editor: any, modelName: string): any | null {
  const selectedElement = editor.model.document.selection.getSelectedElement();
  return selectedElement?.is?.('element', modelName) ? selectedElement : null;
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

async function renderFormulaIntoElement(
  domElement: HTMLElement,
  attrs: FormulaModelState,
  options: RequiredFormulaXCKEditor5Options,
): Promise<void> {
  if (attrs.output === 'image' && attrs.imageUrl) {
    delete domElement.dataset.renderToken;
    domElement.innerHTML = createFormulaImageHtml({
      src: attrs.imageUrl,
      latex: attrs.latex,
      className: options.formulaClassName,
      width: attrs.imageWidth ?? undefined,
      height: attrs.imageHeight ?? undefined,
      style: attrs.imageStyle ?? undefined,
    });
    return;
  }

  const latex = attrs.latex;
  const trimmedLatex = latex.trim();
  const renderToken = `${trimmedLatex}::${Date.now()}::${Math.random().toString(36).slice(2, 8)}`;
  domElement.dataset.renderToken = renderToken;

  if (!trimmedLatex) {
    return;
  }

  try {
    const result = await options.renderer.renderLatex(trimmedLatex, {
      fontSize: options.editor.render.fontsize,
      className: options.formulaClassName,
    });
    if (domElement.dataset.renderToken !== renderToken) {
      return;
    }

    domElement.innerHTML = result.html;
  } catch (error) {
    if (domElement.dataset.renderToken !== renderToken) {
      return;
    }

    console.error('[FormulaX] Failed to render CKEditor5 formula widget:', error);
  }
}

interface FormulaModelState {
  latex: string;
  output: 'svg' | 'image';
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  imageStyle: string | null;
}

function createFormulaModelAttributes(payload: FormulaXPayload): Record<string, unknown> {
  return {
    latex: payload.latex,
    output: payload.output ?? 'svg',
    imageUrl: payload.image?.url ?? null,
    imageWidth: payload.image?.width ?? null,
    imageHeight: payload.image?.height ?? null,
    imageStyle: payload.image?.style ?? null,
  };
}

function readFormulaModelElementState(modelElement: any): FormulaModelState {
  return {
    latex: String(modelElement.getAttribute('latex') ?? ''),
    output: modelElement.getAttribute('output') === 'image' ? 'image' : 'svg',
    imageUrl: readOptionalString(modelElement.getAttribute('imageUrl')),
    imageWidth: readImageDimension(modelElement.getAttribute('imageWidth')),
    imageHeight: readImageDimension(modelElement.getAttribute('imageHeight')),
    imageStyle: readOptionalString(modelElement.getAttribute('imageStyle')),
  };
}

function createFormulaImageViewAttributes(
  attrs: FormulaModelState,
  options: RequiredFormulaXCKEditor5Options,
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

function readFormulaOutputFromView(viewElement: any): 'svg' | 'image' {
  const explicit = viewElement.getAttribute(FORMULAX_OUTPUT_ATTRIBUTE);
  if (explicit === 'image') {
    return 'image';
  }

  return findFormulaImageViewChild(viewElement) ? 'image' : 'svg';
}

function readFormulaImageUrlFromView(viewElement: any): string | null {
  return readOptionalString(
    viewElement.getAttribute(FORMULAX_IMAGE_URL_ATTRIBUTE)
    ?? findFormulaImageViewChild(viewElement)?.getAttribute('src'),
  );
}

function readFormulaImageDimensionFromView(
  viewElement: any,
  wrapperAttributeName: string,
  imageAttributeName: string,
): number | null {
  return readImageDimension(
    viewElement.getAttribute(wrapperAttributeName)
    ?? findFormulaImageViewChild(viewElement)?.getAttribute(imageAttributeName),
  );
}

function readFormulaImageStyleFromView(viewElement: any): string | null {
  return readOptionalString(
    viewElement.getAttribute(FORMULAX_IMAGE_STYLE_ATTRIBUTE)
    ?? findFormulaImageViewChild(viewElement)?.getAttribute('style'),
  );
}

function findFormulaImageViewChild(viewElement: any): any | null {
  const children = Array.from(viewElement.getChildren?.() ?? []);
  return children.find((child: any) => (
    child?.is?.('element', 'img') && child.getAttribute?.('data-formulax-image')
  )) ?? null;
}

function readImageDimension(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value !== 'string' || !value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function readOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}
