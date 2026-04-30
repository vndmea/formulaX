import { legacyEleType } from '../vendor/legacy-ele-type';
import { createLegacyUiUtils } from '../vendor/legacy-ui-utils';
import { getLegacyKity } from '../vendor/runtime-interop';
import type { LegacyEditorInstance } from './editor';
import UiImpl from './ui-impl';

type ToolbarElementDefinition = {
  type: unknown;
  options?: Record<string, unknown>;
};

type ToolbarElementInstance = {
  disable?: () => void;
  enable?: () => void;
  hide?: () => void;
  setToolbar: (toolbar: ToolbarInstance) => void;
  attachTo: (container: HTMLElement) => void;
};

type ToolbarUiComponent = {
  toolbarContainer: HTMLDivElement;
};

type ToolbarInstance = {
  kfEditor: LegacyEditorInstance;
  uiComponent: ToolbarUiComponent;
  elementList: ToolbarElementDefinition[];
  elements: ToolbarElementInstance[];
  initToolbarElements: () => void;
  initServices: () => void;
  initEvent: () => void;
  insertSource: (value: string) => void;
  disableToolbar: () => void;
  enableToolbar: () => void;
  getContainer: () => HTMLElement;
  closeToolbar: () => void;
  notify: (type: string, exception?: ToolbarElementInstance) => void;
  closeElement: (exception?: ToolbarElementInstance) => void;
  appendElement: (uiElement: ToolbarElementInstance) => void;
};

const $$ = createLegacyUiUtils();
const kity = getLegacyKity();

const Toolbar = kity.createClass('Tollbar', {
  constructor(this: ToolbarInstance, uiComponent: ToolbarUiComponent, kfEditor: LegacyEditorInstance, elementList: ToolbarElementDefinition[]) {
    this.kfEditor = kfEditor;
    this.uiComponent = uiComponent;
    this.elementList = elementList;
    this.elements = [];

    this.initToolbarElements();
    this.initServices();
    this.initEvent();
  },

  initServices(this: ToolbarInstance) {
    this.kfEditor.registerService('ui.toolbar.disable', this, {
      disableToolbar: this.disableToolbar,
    });

    this.kfEditor.registerService('ui.toolbar.enable', this, {
      enableToolbar: this.enableToolbar,
    });

    this.kfEditor.registerService('ui.toolbar.close', this, {
      closeToolbar: this.closeToolbar,
    });
  },

  initEvent(this: ToolbarInstance) {
    $$.on(this.uiComponent.toolbarContainer, 'mousedown', (e: Event) => {
      e.preventDefault();
    });

    $$.on(this.uiComponent.toolbarContainer, 'mousewheel', (e: Event) => {
      e.preventDefault();
    });

    $$.on(this.kfEditor.getContainer(), 'mousedown', () => {
      this.notify('closeAll');
    });

    $$.subscribe('data.select', (...args: unknown[]) => {
      this.insertSource(String(args[0] ?? ''));
    });
  },

  insertSource(this: ToolbarInstance, value: string) {
    this.kfEditor.requestService('control.insert.string', value);
  },

  disableToolbar(this: ToolbarInstance) {
    kity.Utils.each(this.elements, (ele: ToolbarElementInstance) => {
      ele.disable?.();
    });
  },

  enableToolbar(this: ToolbarInstance) {
    kity.Utils.each(this.elements, (ele: ToolbarElementInstance) => {
      ele.enable?.();
    });
  },

  getContainer(this: ToolbarInstance) {
    return this.kfEditor.requestService('ui.get.canvas.container') as HTMLElement;
  },

  closeToolbar(this: ToolbarInstance) {
    this.closeElement();
  },

  notify(this: ToolbarInstance, type: string, exception?: ToolbarElementInstance) {
    switch (type) {
      case 'closeAll':
      case 'closeOther':
        this.closeElement(exception);
        return;
      default:
        return;
    }
  },

  closeElement(this: ToolbarInstance, exception?: ToolbarElementInstance) {
    kity.Utils.each(this.elements, (ele: ToolbarElementInstance) => {
      if (ele !== exception) {
        ele.hide?.();
      }
    });
  },

  initToolbarElements(this: ToolbarInstance) {
    const doc = this.uiComponent.toolbarContainer.ownerDocument;

    kity.Utils.each(this.elementList, (eleInfo: ToolbarElementDefinition) => {
      const ele = createElement(eleInfo.type, doc, eleInfo.options);
      this.elements.push(ele);
      this.appendElement(ele);
    });
  },

  appendElement(this: ToolbarInstance, uiElement: ToolbarElementInstance) {
    uiElement.setToolbar(this);
    uiElement.attachTo(this.uiComponent.toolbarContainer);
  },
});

function createElement(type: unknown, doc: Document, options?: Record<string, unknown>) {
  switch (type) {
    case legacyEleType.DRAPDOWN_BOX:
      return createDrapdownBox(doc, options);
    case legacyEleType.DELIMITER:
      return createDelimiter(doc);
    case legacyEleType.AREA:
      return createArea(doc, options);
    default:
      throw new Error(`Unknown toolbar element type: ${String(type)}`);
  }
}

function createDrapdownBox(doc: Document, options?: Record<string, unknown>) {
  return new (UiImpl.DrapdownBox as any)(doc, options) as ToolbarElementInstance;
}

function createDelimiter(doc: Document) {
  return new (UiImpl.Delimiter as any)(doc) as ToolbarElementInstance;
}

function createArea(doc: Document, options?: Record<string, unknown>) {
  return new (UiImpl.Area as any)(doc, options) as ToolbarElementInstance;
}

export default Toolbar as new (
  uiComponent: ToolbarUiComponent,
  kfEditor: LegacyEditorInstance,
  elementList: ToolbarElementDefinition[],
) => ToolbarInstance;
