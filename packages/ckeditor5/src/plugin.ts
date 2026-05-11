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

function applyFormulaPayload(editor: any, selectedFormula: any, payload: FormulaXPayload): void {
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
}

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
      role: 'button',
      tabindex: '0',
    },
    (domElement: HTMLElement) => {
      domElement.innerHTML = html || createFormulaFallbackMarkup(latex, options);
    },
  );
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
      .map((child: any) => serializeViewNode(child))
      .join('');
  } catch {
    return '';
  }
}

function serializeViewNode(node: any): string {
  if (typeof node?.data === 'string') {
    return escapeHtml(node.data);
  }

  if (!node?.name || typeof node.getChildren !== 'function') {
    return '';
  }

  const attributesList = Array.from(
    (node.getAttributes?.() ?? []) as Iterable<[string, unknown]>,
  );
  const attributes = attributesList
    .map(([name, value]) => value === true ? name : `${name}="${escapeAttribute(String(value))}"`)
    .join(' ');
  const children = Array.from(node.getChildren())
    .map((child: any) => serializeViewNode(child))
    .join('');

  return `<${node.name}${attributes ? ` ${attributes}` : ''}>${children}</${node.name}>`;
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
