import {
  ButtonView,
  Command,
  Plugin,
  Widget,
  toWidget,
  viewToModelPositionOutsideModelElement,
} from 'ckeditor5';
import {
  DEFAULT_FORMULA_ATTRIBUTE,
  DEFAULT_FORMULA_CLASS,
  FORMULA_FLAG_ATTRIBUTE,
  createFormulaMarkup,
  ensureFormulaXModalStyles,
  mountFormulaXKityEditor,
} from '@formulax/editor';
import { openFormulaXModal } from './modal';
import type {
  FormulaXCKEditor5Options,
  FormulaXPayload,
  RequiredFormulaXCKEditor5Options,
} from './types';

const DEFAULT_BUTTON_NAME = 'formulaX';

export { DEFAULT_BUTTON_NAME };

export function resolveOptions(options: FormulaXCKEditor5Options = {}): RequiredFormulaXCKEditor5Options {
  return {
    buttonName: options.buttonName ?? DEFAULT_BUTTON_NAME,
    toolbarText: options.toolbarText ?? 'FormulaX',
    tooltip: options.tooltip ?? 'Insert or edit formula',
    cursorStyle: options.cursorStyle ?? 'pointer',
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

  constructor(editor: unknown, options: RequiredFormulaXCKEditor5Options) {
    super(editor as any);
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
      applyFormulaPayload(editor, selectedFormula, payload);
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

    ensureFormulaXModalStyles(document);
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
  }
}

export default FormulaX;

function applyFormulaPayload(editor: any, selectedFormula: any, payload: FormulaXPayload): void {
  editor.model.change((writer: any) => {
    if (selectedFormula) {
      if (!payload.latex.trim()) {
        writer.remove(selectedFormula);
        return;
      }

      writer.setAttribute('latex', payload.latex, selectedFormula);
      return;
    }

    if (!payload.latex.trim()) return;

    const formula = writer.createElement('formulaX', {
      latex: payload.latex,
    });

    editor.model.insertObject(formula, null, null, { setSelection: 'after' });
  });
}

function defineFormulaSchema(editor: any): void {
  editor.model.schema.register('formulaX', {
    allowWhere: '$text',
    isInline: true,
    isObject: true,
    allowAttributes: ['latex'],
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
    }),
  });

  editor.conversion.for('dataDowncast').elementToElement({
    model: createFormulaConverterModelDefinition(),
    view: (modelElement: any, { writer }: any) => createFormulaRawElement(writer, modelElement, options),
  });

  editor.conversion.for('editingDowncast').elementToElement({
    model: createFormulaConverterModelDefinition(),
    view: (modelElement: any, { writer }: any) => {
      const widgetElement = createFormulaWidgetElement(writer, modelElement, options, editor);
      return toWidget(widgetElement, writer, { label: 'FormulaX formula' });
    },
  });
}

function createFormulaConverterModelDefinition(): {
  name: string;
  attributes: string[];
} {
  return {
    name: 'formulaX',
    attributes: ['latex'],
  };
}

function createFormulaRawElement(
  writer: any,
  modelElement: any,
  options: RequiredFormulaXCKEditor5Options,
): any {
  const latex = String(modelElement.getAttribute('latex') ?? '');

  const element = writer.createContainerElement(
    'span',
    createFormulaViewAttributes(latex, options),
  );

  writer.insert(
    writer.createPositionAt(element, 0),
    writer.createText(latex || '\\square'),
  );

  return element;
}

function createFormulaWidgetElement(
  writer: any,
  modelElement: any,
  options: RequiredFormulaXCKEditor5Options,
  editor: any,
): any {
  const latex = String(modelElement.getAttribute('latex') ?? '');
  const widgetElement = writer.createContainerElement(
    'span',
    createFormulaViewAttributes(latex, options),
  );
  const contentElement = writer.createRawElement(
    'span',
    {
      class: `${options.formulaClassName}__content`,
      'aria-hidden': 'true',
    },
    (domElement: HTMLElement) => {
      domElement.innerHTML = createFormulaFallbackMarkup(latex, options);
      void renderFormulaIntoElement(domElement, latex, options);
      bindFormulaWidgetDomEvents(domElement, editor, modelElement, options.buttonName);
    },
  );

  writer.insert(writer.createPositionAt(widgetElement, 0), contentElement);

  return widgetElement;
}

function createFormulaViewAttributes(
  latex: string,
  options: RequiredFormulaXCKEditor5Options,
): Record<string, string> {
  return {
    class: options.formulaClassName,
    [FORMULA_FLAG_ATTRIBUTE]: 'true',
    [options.formulaAttributeName]: latex,
    'data-latex': latex,
    contenteditable: 'false',
    role: 'button',
    style: `cursor: ${options.cursorStyle}`,
    tabindex: '0',
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
  latex: string,
  options: RequiredFormulaXCKEditor5Options,
): string {
  const markup = createFormulaMarkup(latex, {
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

function getSelectedFormulaModelElement(editor: any): any | null {
  const selectedElement = editor.model.document.selection.getSelectedElement();
  return selectedElement?.is?.('element', 'formulaX') ? selectedElement : null;
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

const formulaRenderCache = new Map<string, Promise<string>>();

async function renderFormulaIntoElement(
  domElement: HTMLElement,
  latex: string,
  options: RequiredFormulaXCKEditor5Options,
): Promise<void> {
  const trimmedLatex = latex.trim();
  const renderToken = `${trimmedLatex}::${Date.now()}::${Math.random().toString(36).slice(2, 8)}`;
  domElement.dataset.renderToken = renderToken;

  if (!trimmedLatex) {
    return;
  }

  try {
    const markup = await renderFormulaSvgMarkup(trimmedLatex, options);
    if (domElement.dataset.renderToken !== renderToken) {
      return;
    }

    domElement.innerHTML = markup;
  } catch (error) {
    if (domElement.dataset.renderToken !== renderToken) {
      return;
    }

    console.error('[FormulaX] Failed to render CKEditor5 formula widget:', error);
  }
}

function renderFormulaSvgMarkup(
  latex: string,
  options: RequiredFormulaXCKEditor5Options,
): Promise<string> {
  const cached = formulaRenderCache.get(latex);
  if (cached) {
    return cached;
  }

  const pending = (async () => {
    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-100000px';
    host.style.top = '0';
    host.style.width = '1px';
    host.style.height = '1px';
    host.style.opacity = '0';
    host.style.pointerEvents = 'none';
    host.setAttribute('aria-hidden', 'true');
    document.body.appendChild(host);

    const mounted = mountFormulaXKityEditor(host, {
      initialLatex: latex,
      height: options.editor.height,
      autofocus: false,
      assets: options.editor.assets,
      render: {
        fontsize: options.editor.render.fontsize,
      },
    });

    try {
      return await mounted.getRenderHtml();
    } finally {
      mounted.destroy();
      host.remove();
    }
  })();

  formulaRenderCache.set(latex, pending);
  pending.catch(() => {
    if (formulaRenderCache.get(latex) === pending) {
      formulaRenderCache.delete(latex);
    }
  });
  return pending;
}
