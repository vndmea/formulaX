import { kityUiConfig } from '../../kity-compat/ui-config';
import { createKityUiUtils } from '../../kity-compat/ui-utils';
import { kityBaseUtils } from '../../kity-compat/base-utils';
import { getKityGraphicsRuntime } from '../../kity-compat/runtime-context';
import type { KityRuntimeEditorInstance } from '../services/editor';
import Toolbar from './toolbar';
import Scrollbar from './scrollbar';
import createToolbarConfig from '../config/toolbar-config';
import { normalizeFormulaXLocale } from '@formulaxjs/core';

type ViewState = (typeof kityUiConfig.VIEW_STATE)[keyof typeof kityUiConfig.VIEW_STATE];

type UIComponentInstance = {
  options: Record<string, any>;
  container: HTMLElement;
  components: {
    toolbar?: unknown;
    scrollZoom?: unknown;
    scrollbar?: unknown;
  };
  canvasRect: DOMRect | null;
  viewState: ViewState;
  kfEditor: KityRuntimeEditorInstance;
  toolbarWrap: HTMLDivElement;
  toolbarContainer: HTMLDivElement;
  editArea: HTMLDivElement;
  canvasContainer: HTMLDivElement;
  scrollbarContainer: HTMLDivElement;
  initComponents: () => void;
  updateContainerSize: (container: HTMLElement, toolbar: HTMLElement, editArea: HTMLElement) => void;
  initServices: () => void;
  initEvent: () => void;
  initScrollEvent: () => void;
  getCanvasContainer: () => HTMLDivElement;
  addEvent: (type: string, handler: (event: Event) => void) => void;
  removeEvent: () => void;
  trigger: (type: string) => void;
  updateCanvasView: () => void;
  toggleViewState: () => void;
};

type KityFormulaCanvas = {
  getContentContainer: () => {
    getRenderBox: (scope?: string) => { width: number };
  };
};

const $$ = createKityUiUtils();
const VIEW_STATE = kityUiConfig.VIEW_STATE;
const DEFAULT_EDIT_AREA_HEIGHT = 100;
const kity = getKityGraphicsRuntime();

const UIComponent = kity.createClass('UIComponent', {
  constructor(this: UIComponentInstance, kfEditor: KityRuntimeEditorInstance, options?: Record<string, any>) {
    const currentDocument = kfEditor.getContainer().ownerDocument;

    this.options = options ?? {};
    this.container = kfEditor.getContainer();
    this.components = {};
    this.canvasRect = null;
    this.viewState = VIEW_STATE.NO_OVERFLOW;
    this.kfEditor = kfEditor;
    this.toolbarWrap = createToolbarWrap(currentDocument);
    this.toolbarContainer = createToolbarContainer(currentDocument);
    this.editArea = createEditArea(currentDocument);
    this.canvasContainer = createCanvasContainer(currentDocument);
    this.scrollbarContainer = createScrollbarContainer(currentDocument);

    this.toolbarWrap.appendChild(this.toolbarContainer);
    this.container.appendChild(this.toolbarWrap);
    this.editArea.appendChild(this.canvasContainer);
    this.container.appendChild(this.editArea);
    this.container.appendChild(this.scrollbarContainer);

    this.initComponents();
    this.initServices();
    this.initEvent();
    this.updateContainerSize(this.container, this.toolbarWrap, this.editArea);
    this.initScrollEvent();
  },

  initComponents(this: UIComponentInstance) {
    const toolbarConfig = createToolbarConfig(normalizeFormulaXLocale(this.options.locale));

    this.components.toolbar = new (Toolbar as any)(this, this.kfEditor, toolbarConfig);

    this.components.scrollbar = new (Scrollbar as any)(this, this.kfEditor);
  },

  updateContainerSize(this: UIComponentInstance, container: HTMLElement, toolbar: HTMLElement, editArea: HTMLElement) {
    const containerBox = container.getBoundingClientRect();
    const toolbarBox = toolbar.getBoundingClientRect();
    const declaredHeight = container.style.height;
    const containerHeight = containerBox.height;
    let editAreaHeight = DEFAULT_EDIT_AREA_HEIGHT;

    if (declaredHeight && declaredHeight !== 'auto') {
      editAreaHeight = Math.max(containerHeight - toolbarBox.height, DEFAULT_EDIT_AREA_HEIGHT);
    }

    editArea.style.width = '100%';
    editArea.style.height = `${editAreaHeight}px`;
  },

  initServices(this: UIComponentInstance) {
    this.kfEditor.registerService('ui.get.canvas.container', this, {
      getCanvasContainer: this.getCanvasContainer,
    });

    this.kfEditor.registerService('ui.update.canvas.view', this, {
      updateCanvasView: this.updateCanvasView,
    });

    this.kfEditor.registerService('ui.canvas.container.event', this, {
      on: this.addEvent,
      off: this.removeEvent,
      trigger: this.trigger,
      fire: this.trigger,
    });
  },

  initEvent(this: UIComponentInstance) {},

  initScrollEvent(this: UIComponentInstance) {
    this.kfEditor.requestService(
      'ui.set.scrollbar.update.handler',
      (proportion: number, _offset: number, values: { contentWidth: number; viewWidth: number }) => {
        const offset = Math.floor(proportion * (values.contentWidth - values.viewWidth));
        this.kfEditor.requestService('render.set.canvas.offset', offset);
      },
    );
  },

  getCanvasContainer(this: UIComponentInstance) {
    return this.canvasContainer;
  },

  addEvent(this: UIComponentInstance, type: string, handler: (event: Event) => void) {
    kityBaseUtils.addEvent(this.canvasContainer, type, handler);
  },

  removeEvent(this: UIComponentInstance) {},

  trigger(this: UIComponentInstance, type: string) {
    kityBaseUtils.trigger(this.canvasContainer, type);
  },

  updateCanvasView(this: UIComponentInstance) {
    const canvas = this.kfEditor.requestService('render.get.canvas') as KityFormulaCanvas;
    const contentContainer = canvas.getContentContainer();

    this.canvasRect = this.canvasContainer.getBoundingClientRect();

    const contentRect = contentContainer.getRenderBox('paper');

    if (contentRect.width > this.canvasRect.width) {
      if (this.viewState === VIEW_STATE.NO_OVERFLOW) {
        this.toggleViewState();
        this.kfEditor.requestService('ui.show.scrollbar');
        this.kfEditor.requestService('render.disable.relocation');
      }

      this.kfEditor.requestService('render.relocation');
      this.kfEditor.requestService('ui.update.scrollbar', contentRect.width);
      this.kfEditor.requestService('ui.relocation.scrollbar');
      return;
    }

    if (this.viewState === VIEW_STATE.OVERFLOW) {
      this.toggleViewState();
      this.kfEditor.requestService('ui.hide.scrollbar');
      this.kfEditor.requestService('render.enable.relocation');
    }

    this.kfEditor.requestService('render.relocation');
  },

  toggleViewState(this: UIComponentInstance) {
    this.viewState = this.viewState === VIEW_STATE.NO_OVERFLOW ? VIEW_STATE.OVERFLOW : VIEW_STATE.NO_OVERFLOW;
  },
});

function createToolbarWrap(doc: Document) {
  return $$.ele(doc, 'div', {
    className: 'kf-editor-toolbar',
  }) as HTMLDivElement;
}

function createToolbarContainer(doc: Document) {
  return $$.ele(doc, 'div', {
    className: 'kf-editor-inner-toolbar',
  }) as HTMLDivElement;
}

function createEditArea(doc: Document) {
  const container = doc.createElement('div');
  container.className = 'kf-editor-edit-area';
  container.style.width = '100%';
  container.style.height = `${DEFAULT_EDIT_AREA_HEIGHT}px`;
  return container;
}

function createCanvasContainer(doc: Document) {
  const container = doc.createElement('div');
  container.className = 'kf-editor-canvas-container';
  return container;
}

function createScrollbarContainer(doc: Document) {
  const container = doc.createElement('div');
  container.className = 'kf-editor-edit-scrollbar';
  return container;
}

export default UIComponent as new (kfEditor: KityRuntimeEditorInstance, options?: Record<string, any>) => UIComponentInstance;

