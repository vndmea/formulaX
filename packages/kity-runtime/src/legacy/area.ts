import { createLegacyUiUtils } from '../vendor/legacy-ui-utils';
import { getLegacyKity } from '../vendor/runtime-interop';
import Box from './box';

type AreaOptions = {
  width?: number;
  box: Record<string, any>;
};

type ToolbarLike = {
  notify: (type: string, exception?: unknown) => void;
};

type AreaInstance = {
  options: AreaOptions;
  doc: Document;
  toolbar: ToolbarLike | null;
  disabled: boolean;
  panelIndex: number;
  maxPanelIndex: number;
  currentItemCount: number;
  lineMaxCount: number;
  element: HTMLDivElement;
  container: HTMLDivElement;
  panel: HTMLDivElement;
  buttonContainer: HTMLDivElement;
  button: HTMLDivElement;
  mountPoint: HTMLDivElement;
  moveDownButton: HTMLDivElement;
  moveUpButton: HTMLDivElement;
  disabledUp?: boolean;
  disabledDown?: boolean;
  boxObject: InstanceType<typeof Box>;
  initEvent: () => void;
  disable: () => void;
  enable: () => void;
  setListener: () => void;
  createArea: () => HTMLDivElement;
  checkMaxPanelIndex: () => void;
  updateContent: () => void;
  mount: () => void;
  showMount: () => void;
  hideMount: () => void;
  hide: () => void;
  createButton: () => HTMLDivElement;
  createMoveDownButton: () => HTMLDivElement;
  createMoveUpButton: () => HTMLDivElement;
  createMountPoint: () => HTMLDivElement;
  createBox: () => InstanceType<typeof Box>;
  createContainer: () => HTMLDivElement;
  createPanel: () => HTMLDivElement;
  createButtonContainer: () => HTMLDivElement;
  mergeElement: () => void;
  disablePanelUp: () => void;
  enablePanelUp: () => void;
  disablePanelDown: () => void;
  enablePanelDown: () => void;
  updatePanelButtonState: () => void;
  nextPanel: () => void;
  prevPanel: () => void;
  setToolbar: (toolbar: ToolbarLike) => void;
  attachTo: (container: HTMLElement) => void;
};

const PREFIX = 'kf-editor-ui-';
const PANEL_HEIGHT = 66;
const $$ = createLegacyUiUtils();
const kity = getLegacyKity();

const Area = kity.createClass('Area', {
  constructor(this: AreaInstance, doc: Document, options: AreaOptions) {
    this.options = options;
    this.doc = doc;
    this.toolbar = null;
    this.disabled = true;
    this.panelIndex = 0;
    this.maxPanelIndex = 0;
    this.currentItemCount = 0;
    this.lineMaxCount = 9;
    this.element = this.createArea();
    this.container = this.createContainer();
    this.panel = this.createPanel();
    this.buttonContainer = this.createButtonContainer();
    this.button = this.createButton();
    this.mountPoint = this.createMountPoint();
    this.moveDownButton = this.createMoveDownButton();
    this.moveUpButton = this.createMoveUpButton();
    this.boxObject = this.createBox();
    this.mergeElement();
    this.mount();
    this.setListener();
    this.initEvent();
  },

  initEvent(this: AreaInstance) {
    const self = this;

    $$.on(this.button, 'mousedown', (e: Event & { which?: number }) => {
      e.preventDefault();
      e.stopPropagation();

      if ((e.which ?? 1) !== 1 || this.disabled) {
        return;
      }

      this.showMount();
      this.toolbar?.notify('closeOther', this);
    });

    $$.on(this.moveDownButton, 'mousedown', (e: Event & { which?: number }) => {
      e.preventDefault();
      e.stopPropagation();

      if ((e.which ?? 1) !== 1 || this.disabled) {
        return;
      }

      this.nextPanel();
      this.toolbar?.notify('closeOther', this);
    });

    $$.on(this.moveUpButton, 'mousedown', (e: Event & { which?: number }) => {
      e.preventDefault();
      e.stopPropagation();

      if ((e.which ?? 1) !== 1 || this.disabled) {
        return;
      }

      this.prevPanel();
      this.toolbar?.notify('closeOther', this);
    });

    $$.delegate(this.container, '.kf-editor-ui-area-item', 'mousedown', function (this: Element, e: Event & { which?: number }) {
      e.preventDefault();

      if ((e.which ?? 1) !== 1 || self.disabled) {
        return;
      }

      $$.publish('data.select', this.getAttribute('data-value'));
    } as unknown as (event: Event) => void);

    this.boxObject.initEvent();
  },

  disable(this: AreaInstance) {
    this.disabled = true;
    this.boxObject.disable();
    $$.getClassList(this.element).remove(`${PREFIX}enabled`);
  },

  enable(this: AreaInstance) {
    this.disabled = false;
    this.boxObject.enable();
    $$.getClassList(this.element).add(`${PREFIX}enabled`);
  },

  setListener(this: AreaInstance) {
    this.boxObject.setSelectHandler((val: string | null) => {
      $$.publish('data.select', val);
      this.hide();
    });

    this.boxObject.setChangeHandler(() => {
      this.updateContent();
    });
  },

  createArea(this: AreaInstance) {
    const areaNode = $$.ele(this.doc, 'div', {
      className: `${PREFIX}area`,
    }) as HTMLDivElement;

    if ('width' in this.options && this.options.width !== undefined) {
      areaNode.style.width = `${this.options.width}px`;
    }

    return areaNode;
  },

  checkMaxPanelIndex(this: AreaInstance) {
    this.maxPanelIndex = Math.ceil(this.currentItemCount / this.lineMaxCount / 2);
  },

  updateContent(this: AreaInstance) {
    const items = this.boxObject.getOverlapContent();
    let count = 0;
    let lineno = 0;
    let colno = 0;
    const lineMaxCount = this.lineMaxCount;
    const newContent: string[] = [];

    this.panel.innerHTML = '';

    kity.Utils.each(items, (item: { content: Array<{ key: string; img: string; pos: { x: number; y: number } }> }) => {
      const contents = item.content;

      kity.Utils.each(contents, (currentContent: { key: string; img: string; pos: { x: number; y: number } }) => {
        lineno = Math.floor(count / lineMaxCount);
        colno = count % lineMaxCount;
        count += 1;

        const style = `top: ${lineno * 33 + 5}px; left: ${colno * 32 + 5}px;`;
        newContent.push(
          `<div class="${PREFIX}area-item" data-value="${currentContent.key}" style="${style}"><div class="${PREFIX}area-item-inner"><div class="${PREFIX}area-item-img" style="background: url(${currentContent.img}) no-repeat ${-currentContent.pos.x}px ${-currentContent.pos.y}px;"></div></div></div>`,
        );
      });
    });

    this.currentItemCount = count;
    this.panelIndex = 0;
    this.panel.style.top = '0';
    this.panel.innerHTML = newContent.join('');
    this.checkMaxPanelIndex();
    this.updatePanelButtonState();
  },

  mount(this: AreaInstance) {
    this.boxObject.mountTo(this.mountPoint);
  },

  showMount(this: AreaInstance) {
    this.mountPoint.style.display = 'block';
    this.boxObject.updateSize();
  },

  hideMount(this: AreaInstance) {
    this.mountPoint.style.display = 'none';
  },

  hide(this: AreaInstance) {
    this.hideMount();
    this.boxObject.hide();
  },

  createButton(this: AreaInstance) {
    return $$.ele(this.doc, 'div', {
      className: `${PREFIX}area-button`,
    }) as HTMLDivElement;
  },

  createMoveDownButton(this: AreaInstance) {
    return $$.ele(this.doc, 'div', {
      className: `${PREFIX}movedown-button`,
      content: '',
    }) as HTMLDivElement;
  },

  createMoveUpButton(this: AreaInstance) {
    return $$.ele(this.doc, 'div', {
      className: `${PREFIX}moveup-button`,
      content: '',
    }) as HTMLDivElement;
  },

  createMountPoint(this: AreaInstance) {
    return $$.ele(this.doc, 'div', {
      className: `${PREFIX}area-mount`,
    }) as HTMLDivElement;
  },

  createBox(this: AreaInstance) {
    return new Box(this.doc, this.options.box as any);
  },

  createContainer(this: AreaInstance) {
    return $$.ele(this.doc, 'div', {
      className: `${PREFIX}area-container`,
    }) as HTMLDivElement;
  },

  createPanel(this: AreaInstance) {
    return $$.ele(this.doc, 'div', {
      className: `${PREFIX}area-panel`,
    }) as HTMLDivElement;
  },

  createButtonContainer(this: AreaInstance) {
    return $$.ele(this.doc, 'div', {
      className: `${PREFIX}area-button-container`,
    }) as HTMLDivElement;
  },

  mergeElement(this: AreaInstance) {
    this.buttonContainer.appendChild(this.moveUpButton);
    this.buttonContainer.appendChild(this.moveDownButton);
    this.buttonContainer.appendChild(this.button);
    this.container.appendChild(this.panel);
    this.element.appendChild(this.container);
    this.element.appendChild(this.buttonContainer);
    this.element.appendChild(this.mountPoint);
  },

  disablePanelUp(this: AreaInstance) {
    this.disabledUp = true;
    $$.getClassList(this.moveUpButton).add('kf-editor-ui-disabled');
  },

  enablePanelUp(this: AreaInstance) {
    this.disabledUp = false;
    $$.getClassList(this.moveUpButton).remove('kf-editor-ui-disabled');
  },

  disablePanelDown(this: AreaInstance) {
    this.disabledDown = true;
    $$.getClassList(this.moveDownButton).add('kf-editor-ui-disabled');
  },

  enablePanelDown(this: AreaInstance) {
    this.disabledDown = false;
    $$.getClassList(this.moveDownButton).remove('kf-editor-ui-disabled');
  },

  updatePanelButtonState(this: AreaInstance) {
    if (this.panelIndex === 0) {
      this.disablePanelUp();
    } else {
      this.enablePanelUp();
    }

    if (this.panelIndex + 1 >= this.maxPanelIndex) {
      this.disablePanelDown();
    } else {
      this.enablePanelDown();
    }
  },

  nextPanel(this: AreaInstance) {
    if (this.disabledDown || this.panelIndex + 1 >= this.maxPanelIndex) {
      return;
    }

    this.panelIndex += 1;
    this.panel.style.top = `${-this.panelIndex * PANEL_HEIGHT}px`;
    this.updatePanelButtonState();
  },

  prevPanel(this: AreaInstance) {
    if (this.disabledUp || this.panelIndex === 0) {
      return;
    }

    this.panelIndex -= 1;
    this.panel.style.top = `${-this.panelIndex * PANEL_HEIGHT}px`;
    this.updatePanelButtonState();
  },

  setToolbar(this: AreaInstance, toolbar: ToolbarLike) {
    this.toolbar = toolbar;
    this.boxObject.setToolbar(toolbar);
  },

  attachTo(this: AreaInstance, container: HTMLElement) {
    container.appendChild(this.element);
    this.updateContent();
    this.updatePanelButtonState();
  },
});

export default Area as new (doc: Document, options: AreaOptions) => AreaInstance;
