import { createLegacyUiUtils } from '../vendor/legacy-ui-utils';
import { getLegacyKity } from '../vendor/runtime-interop';
import Box from './box';
import Button from './button';

type DropdownBoxOptions = {
  button: Record<string, unknown>;
  box: Record<string, unknown>;
};

type ToolbarLike = {
  notify: (type: string, exception?: unknown) => void;
};

type DropdownBoxInstance = {
  options: DropdownBoxOptions;
  toolbar: ToolbarLike | null;
  doc: Document;
  buttonElement: InstanceType<typeof Button>;
  element: HTMLDivElement;
  boxElement: InstanceType<typeof Box>;
  initEvent: () => void;
  disable: () => void;
  enable: () => void;
  setToolbar: (toolbar: ToolbarLike) => void;
  createButton: () => InstanceType<typeof Button>;
  show: () => void;
  hide: () => void;
  createBox: () => InstanceType<typeof Box>;
  attachTo: (container: HTMLElement) => void;
};

const $$ = createLegacyUiUtils();
const kity = getLegacyKity();

const DrapdownBox = kity.createClass('DrapdownBox', {
  constructor(this: DropdownBoxInstance, doc: Document, options: DropdownBoxOptions) {
    this.options = options;
    this.toolbar = null;
    this.doc = doc;
    this.buttonElement = this.createButton();
    this.element = this.buttonElement.getNode();
    this.boxElement = this.createBox();
    this.buttonElement.mount(this.boxElement);
    this.initEvent();
  },

  initEvent(this: DropdownBoxInstance) {
    $$.on(this.element, 'mousedown', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      this.toolbar?.notify('closeOther', this);
    });

    this.buttonElement.initEvent();
    this.boxElement.initEvent();

    this.boxElement.setSelectHandler((val: string | null) => {
      $$.publish('data.select', val);
      this.buttonElement.hide();
    });
  },

  disable(this: DropdownBoxInstance) {
    this.buttonElement.disable();
  },

  enable(this: DropdownBoxInstance) {
    this.buttonElement.enable();
  },

  setToolbar(this: DropdownBoxInstance, toolbar: ToolbarLike) {
    this.toolbar = toolbar;
    this.buttonElement.setToolbar(toolbar as any);
    this.boxElement.setToolbar(toolbar);
  },

  createButton(this: DropdownBoxInstance) {
    return new Button(this.doc, this.options.button);
  },

  show(this: DropdownBoxInstance) {
    this.buttonElement.show();
  },

  hide(this: DropdownBoxInstance) {
    this.buttonElement.hide();
  },

  createBox(this: DropdownBoxInstance) {
    return new Box(this.doc, this.options.box as any);
  },

  attachTo(this: DropdownBoxInstance, container: HTMLElement) {
    container.appendChild(this.element);
  },
});

export default DrapdownBox as new (doc: Document, options: DropdownBoxOptions) => DropdownBoxInstance;
