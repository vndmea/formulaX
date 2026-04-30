import { createLegacyUiUtils } from '../vendor/legacy-ui-utils';
import { getLegacyKity } from '../vendor/runtime-interop';

type ButtonIconPosition = {
  src: string;
  x: number;
  y: number;
};

type ButtonOptions = {
  className?: string;
  label?: string;
  sign?: boolean;
  fixOffset?: boolean;
  icon?: string | ButtonIconPosition;
  iconSize?: {
    w?: number;
    h?: number;
  };
};

type MountElementLike = {
  setOffset?: (x: number, y: number) => void;
  getPositionInfo: () => DOMRect;
  updateSize?: () => void;
  mountTo: (container: HTMLElement) => void;
};

type ToolbarLike = {
  getContainer: () => HTMLElement;
};

type ButtonInstance = {
  options: Required<Pick<ButtonOptions, 'iconSize'>> & ButtonOptions;
  eventState: boolean;
  toolbar: ToolbarLike | null;
  displayState: boolean;
  fixOffset: boolean;
  doc: Document;
  element: HTMLDivElement;
  disabled: boolean;
  mountElement: MountElementLike | null;
  icon: HTMLDivElement | null;
  label: HTMLDivElement;
  sign: HTMLDivElement | null;
  mountPoint: HTMLDivElement;
  initEvent: () => void;
  setToolbar: (toolbar: ToolbarLike) => void;
  toggleMountElement: () => void;
  setLabel: (labelText: string) => void;
  toggleSelect: () => void;
  unselect: () => void;
  select: () => void;
  show: () => void;
  hide: () => void;
  showMount: () => void;
  hideMount: () => void;
  getNode: () => HTMLDivElement;
  mount: (element: MountElementLike) => void;
  createButton: () => HTMLDivElement;
  createIcon: () => HTMLDivElement | null;
  createLabel: () => HTMLDivElement;
  createSign: () => HTMLDivElement | null;
  createMountPoint: () => HTMLDivElement;
  disable: () => void;
  enable: () => void;
  mergeElement: () => void;
};

const PREFIX = 'kf-editor-ui-';
const LIST_OFFSET = 7;
const DEFAULT_OPTIONS: Required<Pick<ButtonOptions, 'iconSize'>> = {
  iconSize: {
    w: 32,
    h: 32,
  },
};

const $$ = createLegacyUiUtils();
const kity = getLegacyKity();

function getBackgroundStyle(data: ButtonIconPosition) {
  let style = `url( ${data.src} ) no-repeat `;
  style += `${-data.x}px `;
  style += `${-data.y}px`;
  return style;
}

const Button = kity.createClass('Button', {
  constructor(this: ButtonInstance, doc: Document, options: ButtonOptions) {
    this.options = kity.Utils.extend({}, DEFAULT_OPTIONS, options) as ButtonInstance['options'];
    this.eventState = false;
    this.toolbar = null;
    this.displayState = false;
    this.fixOffset = !!options.fixOffset;
    this.doc = doc;
    this.element = this.createButton();
    this.disabled = true;
    this.mountElement = null;
    this.icon = this.createIcon();
    this.label = this.createLabel();
    this.sign = this.createSign();
    this.mountPoint = this.createMountPoint();
    this.mergeElement();
  },

  initEvent(this: ButtonInstance) {
    if (this.eventState) {
      return;
    }

    this.eventState = true;

    $$.on(this.element, 'mousedown', (e: Event & { which?: number }) => {
      e.preventDefault();
      e.stopPropagation();

      if ((e.which ?? 1) !== 1 || this.disabled) {
        return;
      }

      this.toggleSelect();
      this.toggleMountElement();
    });
  },

  setToolbar(this: ButtonInstance, toolbar: ToolbarLike) {
    this.toolbar = toolbar;
  },

  toggleMountElement(this: ButtonInstance) {
    if (this.displayState) {
      this.hideMount();
    } else {
      this.showMount();
    }
  },

  setLabel(this: ButtonInstance, labelText: string) {
    let signText = '';
    if (this.sign) {
      signText = `<div class="${PREFIX}button-sign"></div>`;
    }
    this.label.innerHTML = `${labelText}${signText}`;
  },

  toggleSelect(this: ButtonInstance) {
    $$.getClassList(this.element).toggle(`${PREFIX}button-in`);
  },

  unselect(this: ButtonInstance) {
    $$.getClassList(this.element).remove(`${PREFIX}button-in`);
  },

  select(this: ButtonInstance) {
    $$.getClassList(this.element).add(`${PREFIX}button-in`);
  },

  show(this: ButtonInstance) {
    this.select();
    this.showMount();
  },

  hide(this: ButtonInstance) {
    this.unselect();
    this.hideMount();
  },

  showMount(this: ButtonInstance) {
    this.displayState = true;
    this.mountPoint.style.display = 'block';

    if (this.fixOffset && this.mountElement?.setOffset) {
      const elementRect = this.element.getBoundingClientRect();
      this.mountElement.setOffset(elementRect.left + LIST_OFFSET, elementRect.bottom);
    }

    const editorContainer = this.toolbar?.getContainer();
    if (!editorContainer || !this.mountElement) {
      return;
    }

    const containerBox = $$.getRectBox(editorContainer);
    const mountEleBox = this.mountElement.getPositionInfo();

    if (mountEleBox.right > containerBox.right) {
      const currentBox = $$.getRectBox(this.element);
      this.mountPoint.style.left = `${currentBox.right - mountEleBox.right - 1}px`;
    }

    this.mountElement.updateSize?.();
  },

  hideMount(this: ButtonInstance) {
    this.displayState = false;
    this.mountPoint.style.display = 'none';
  },

  getNode(this: ButtonInstance) {
    return this.element;
  },

  mount(this: ButtonInstance, element: MountElementLike) {
    this.mountElement = element;
    element.mountTo(this.mountPoint);
  },

  createButton(this: ButtonInstance) {
    const buttonNode = $$.ele(this.doc, 'div', {
      className: `${PREFIX}button`,
    }) as HTMLDivElement;

    if (this.options.className) {
      buttonNode.className += ` ${PREFIX}${this.options.className}`;
    }

    return buttonNode;
  },

  createIcon(this: ButtonInstance) {
    if (!this.options.icon) {
      return null;
    }

    const iconNode = $$.ele(this.doc, 'div', {
      className: `${PREFIX}button-icon`,
    }) as HTMLDivElement;

    if (typeof this.options.icon === 'string') {
      iconNode.style.backgroundImage = `url(${this.options.icon}) no-repeat`;
    } else {
      iconNode.style.background = getBackgroundStyle(this.options.icon);
    }

    if (this.options.iconSize.w) {
      iconNode.style.width = `${this.options.iconSize.w}px`;
    }

    if (this.options.iconSize.h) {
      iconNode.style.height = `${this.options.iconSize.h}px`;
    }

    return iconNode;
  },

  createLabel(this: ButtonInstance) {
    return $$.ele(this.doc, 'div', {
      className: `${PREFIX}button-label`,
      content: this.options.label,
    }) as HTMLDivElement;
  },

  createSign(this: ButtonInstance) {
    if (this.options.sign === false) {
      return null;
    }

    return $$.ele(this.doc, 'div', {
      className: `${PREFIX}button-sign`,
    }) as HTMLDivElement;
  },

  createMountPoint(this: ButtonInstance) {
    return $$.ele(this.doc, 'div', {
      className: `${PREFIX}button-mount-point`,
    }) as HTMLDivElement;
  },

  disable(this: ButtonInstance) {
    this.disabled = true;
    $$.getClassList(this.element).remove(`${PREFIX}enabled`);
  },

  enable(this: ButtonInstance) {
    this.disabled = false;
    $$.getClassList(this.element).add(`${PREFIX}enabled`);
  },

  mergeElement(this: ButtonInstance) {
    if (this.icon) {
      this.element.appendChild(this.icon);
    }
    this.element.appendChild(this.label);
    if (this.sign) {
      this.label.appendChild(this.sign);
    }
    this.element.appendChild(this.mountPoint);
  },
});

export default Button as new (doc: Document, options: ButtonOptions) => ButtonInstance;
