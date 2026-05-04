import { legacyBoxType } from '../vendor/legacy-box-type';
import { legacyItemType } from '../vendor/legacy-item-type';
import { createLegacyUiUtils } from '../vendor/legacy-ui-utils';
import { getLegacyKity } from '../vendor/runtime-interop';
import Button from './button';
import List from './list';

type BoxItemImage = {
  img: string;
  pos: { x: number; y: number };
  size?: { width: number; height: number };
  val?: string;
  key?: string;
  label?: string;
  item?: BoxItemImage & { val: string };
};

type BoxContentGroup = {
  title?: string;
  items: Array<{
    title: string;
    content: BoxItemImage[];
  }>;
};

type OverlapListConfig = {
  width: number;
  items: string[];
};

type BoxOptions = {
  width?: number;
  type?: number | string;
  fixOffset?: boolean;
  group: BoxContentGroup[];
};

type BoxItemInstance = {
  type: number | string;
  doc: Document;
  options: BoxItemImage;
  element: HTMLDivElement;
  labelNode?: HTMLDivElement;
  contentNode: HTMLDivElement;
  getNode: () => HTMLDivElement;
  createItem: () => HTMLDivElement;
  createLabel: () => HTMLDivElement | undefined;
  getContent: () => void;
  createContent: () => HTMLDivElement;
  createBigContent: () => HTMLDivElement;
  createSmallContent: () => HTMLDivElement;
  mergeElement: () => void;
  appendTo: (container: HTMLElement) => void;
};

type BoxGroupResult = {
  title: string[];
  items: HTMLDivElement[][];
};

type BoxInstance = {
  options: BoxOptions;
  toolbar: unknown;
  doc: Document;
  itemPanels: HTMLDivElement[] | null;
  overlapButtonObject: InstanceType<typeof Button> | null;
  overlapIndex: number;
  element: HTMLDivElement;
  groupContainer: HTMLDivElement;
  itemGroups: HTMLDivElement[] | null;
  onselectHandler?: (value: string | null) => void;
  onchangeHandler: (index: number) => void;
  createBox: () => HTMLDivElement;
  setToolbar: (toolbar: unknown) => void;
  updateSize: () => void;
  initEvent: () => void;
  getNode: () => HTMLDivElement;
  setSelectHandler: (onselectHandler: (value: string | null) => void) => void;
  scroll: (delta: number) => void;
  scrollDown: () => void;
  scrollUp: () => void;
  setChangeHandler: (changeHandler: (index: number) => void) => void;
  createGroupContainer: () => HTMLDivElement;
  getPositionInfo: () => DOMRect;
  createItemGroup: () => HTMLDivElement[] | null;
  enable: () => void;
  disable: () => void;
  hide: () => void;
  getOverlapContent: () => BoxContentGroup['items'] | null;
  createOverlapGroup: (itemGroup: BoxGroupResult) => HTMLDivElement[];
  getCurrentItemPanel: () => HTMLDivElement;
  getGroupList: () => OverlapListConfig;
  createGroup: () => BoxGroupResult;
  mergeElement: () => void;
  mountTo: (container: HTMLElement) => void;
  appendTo: (container: HTMLElement) => void;
};

const kity = getLegacyKity();
const $$ = createLegacyUiUtils();
const PREFIX = 'kf-editor-ui-';
const BOX_TYPE = legacyBoxType;
const ITEM_TYPE = legacyItemType;
const SCROLL_STEP = 20;

function getViewportBox(doc: Document) {
  const view = doc.documentElement;

  return {
    top: 0,
    left: 0,
    right: view.clientWidth,
    bottom: view.clientHeight,
    width: view.clientWidth,
    height: view.clientHeight,
  };
}

function getStyleByData(data: BoxItemImage & { size: { width: number; height: number } }) {
  let style = `background: url( ${data.img} ) no-repeat `;
  style += `${-data.pos.x}px `;
  style += `${-data.pos.y}px;`;
  style += ` width: ${data.size.width}px;`;
  style += ` height: ${data.size.height}px;`;
  return style;
}

function createItems(doc: Document, group: BoxItemImage[], type: number | string) {
  const items: BoxItemInstance[] = [];

  kity.Utils.each(group, (itemVal: BoxItemImage) => {
    items.push(new (BoxItem as any)(type, doc, itemVal));
  });

  return items;
}

function createOverlapContainer(doc: Document) {
  return $$.ele(doc, 'div', {
    className: `${PREFIX}overlap-container`,
  }) as HTMLDivElement;
}

function createOverlapButton(doc: Document, options: { fixOffset?: boolean }) {
  return new Button(doc, {
    className: 'overlap-button',
    label: '',
    fixOffset: options.fixOffset,
  });
}

function createOverlapList(doc: Document, list: OverlapListConfig) {
  return new List(doc, list);
}

const BoxItem = kity.createClass('BoxItem', {
  constructor(this: BoxItemInstance, type: number | string, doc: Document, options: BoxItemImage) {
    this.type = type;
    this.doc = doc;
    this.options = options;
    this.element = this.createItem();
    this.labelNode = this.createLabel();
    this.contentNode = this.createContent();
    this.mergeElement();
  },

  getNode(this: BoxItemInstance) {
    return this.element;
  },

  createItem(this: BoxItemInstance) {
    return $$.ele(this.doc, 'div', {
      className: `${PREFIX}box-item`,
    }) as HTMLDivElement;
  },

  createLabel(this: BoxItemInstance) {
    if (!('label' in this.options)) {
      return undefined;
    }

    return $$.ele(this.doc, 'div', {
      className: `${PREFIX}box-item-label`,
      content: this.options.label,
    }) as HTMLDivElement;
  },

  getContent(this: BoxItemInstance) {},

  createContent(this: BoxItemInstance) {
    switch (this.type) {
      case ITEM_TYPE.BIG:
        return this.createBigContent();
      case ITEM_TYPE.SMALL:
        return this.createSmallContent();
      default:
        return this.createSmallContent();
    }
  },

  createBigContent(this: BoxItemInstance) {
    const contentNode = $$.ele(this.doc, 'div', {
      className: `${PREFIX}box-item-content`,
    }) as HTMLDivElement;
    const cls = `${PREFIX}box-item-val`;
    const tmpContent = this.options.item as BoxItemImage & { val: string; size: { width: number; height: number } };
    const tmpNode = $$.ele(this.doc, 'div', {
      className: cls,
    }) as HTMLDivElement;
    const styleStr = getStyleByData(tmpContent);

    tmpNode.innerHTML = `<div class="${PREFIX}item-image" style="${styleStr}"></div>`;
    this.element.setAttribute('data-value', tmpContent.val);
    contentNode.appendChild(tmpNode);
    return contentNode;
  },

  createSmallContent(this: BoxItemInstance) {
    const contentNode = $$.ele(this.doc, 'div', {
      className: `${PREFIX}box-item-content`,
    }) as HTMLDivElement;
    const cls = `${PREFIX}box-item-val`;
    const tmpContent = this.options;

    if (tmpContent.unicode) {
      const tmpNode = $$.ele(this.doc, 'span', {
        className: `${cls} ${PREFIX}box-item-text`,
        content: tmpContent.unicode,
      }) as HTMLSpanElement;

      if (tmpContent.unicodeFont) {
        tmpNode.style.fontFamily = tmpContent.unicodeFont as string;
      }

      if (tmpContent.key) {
        this.element.setAttribute('data-value', tmpContent.key);
      }
      contentNode.appendChild(tmpNode);
      return contentNode;
    }

    const tmpNode = $$.ele(this.doc, 'div', {
      className: cls,
    }) as HTMLDivElement;

    tmpNode.style.background = `url( ${tmpContent.img} )`;
    tmpNode.style.backgroundPosition = `${-tmpContent.pos.x}px ${-tmpContent.pos.y}px`;
    if (tmpContent.key) {
      this.element.setAttribute('data-value', tmpContent.key);
    }
    contentNode.appendChild(tmpNode);
    return contentNode;
  },

  mergeElement(this: BoxItemInstance) {
    if (this.labelNode) {
      this.element.appendChild(this.labelNode);
    }
    this.element.appendChild(this.contentNode);
  },

  appendTo(this: BoxItemInstance, container: HTMLElement) {
    container.appendChild(this.element);
  },
});

const Box = kity.createClass('Box', {
  constructor(this: BoxInstance, doc: Document, options: BoxOptions) {
    this.options = options;
    this.toolbar = null;
    this.options.type = this.options.type || BOX_TYPE.DETACHED;
    this.doc = doc;
    this.itemPanels = null;
    this.overlapButtonObject = null;
    this.overlapIndex = -1;
    this.onchangeHandler = function () {};
    this.element = this.createBox();
    this.groupContainer = this.createGroupContainer();
    this.itemGroups = this.createItemGroup();
    this.mergeElement();
  },

  createBox(this: BoxInstance) {
    const boxNode = $$.ele(this.doc, 'div', {
      className: `${PREFIX}box`,
    }) as HTMLDivElement;

    if ('width' in this.options && this.options.width !== undefined) {
      boxNode.style.width = `${this.options.width}px`;
    }

    return boxNode;
  },

  setToolbar(this: BoxInstance, toolbar: unknown) {
    this.toolbar = toolbar;
    if (this.overlapButtonObject) {
      this.overlapButtonObject.setToolbar(toolbar as any);
    }
  },

  updateSize(this: BoxInstance) {
    const containerBox = getViewportBox(this.doc);
    const diff = 30;
    const curBox = $$.getRectBox(this.element);

    if (this.options.type === BOX_TYPE.DETACHED) {
      if (curBox.bottom <= containerBox.bottom) {
        this.element.scrollTop = 0;
        return;
      }

      this.element.style.height = `${curBox.height - (curBox.bottom - containerBox.bottom + diff)}px`;
      return;
    }

    const panel = this.getCurrentItemPanel();
    panel.scrollTop = 0;

    if (curBox.bottom <= containerBox.bottom) {
      return;
    }

    const panelRect = $$.getRectBox(panel);
    panel.style.height = `${containerBox.bottom - panelRect.top - diff}px`;
  },

  initEvent(this: BoxInstance) {
    const className = `.${PREFIX}box-item`;
    const self = this;

    $$.delegate(this.groupContainer, className, 'mousedown', function (this: Element, e: Event & { which?: number }) {
      e.preventDefault();

      if ((e.which ?? 1) !== 1) {
        return;
      }

      self.onselectHandler?.(this.getAttribute('data-value'));
    } as unknown as (event: Event) => void);

    $$.on(this.element, 'mousedown', (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
    });

    $$.on(this.element, 'mousewheel', (e: Event & { originalEvent?: { wheelDelta?: number } }) => {
      e.preventDefault();
      e.stopPropagation();
      this.scroll(e.originalEvent?.wheelDelta ?? 0);
    });
  },

  getNode(this: BoxInstance) {
    return this.element;
  },

  setSelectHandler(this: BoxInstance, onselectHandler: (value: string | null) => void) {
    this.onselectHandler = onselectHandler;
  },

  scroll(this: BoxInstance, delta: number) {
    if (delta < 0) {
      this.scrollDown();
    } else {
      this.scrollUp();
      this.element.scrollTop -= 20;
    }
  },

  scrollDown(this: BoxInstance) {
    if (this.options.type === BOX_TYPE.DETACHED) {
      this.element.scrollTop += SCROLL_STEP;
    } else {
      this.getCurrentItemPanel().scrollTop += SCROLL_STEP;
    }
  },

  scrollUp(this: BoxInstance) {
    if (this.options.type === BOX_TYPE.DETACHED) {
      this.element.scrollTop -= SCROLL_STEP;
    } else {
      this.getCurrentItemPanel().scrollTop -= SCROLL_STEP;
    }
  },

  setChangeHandler(this: BoxInstance, changeHandler: (index: number) => void) {
    this.onchangeHandler = changeHandler;
  },

  createGroupContainer(this: BoxInstance) {
    return $$.ele(this.doc, 'div', {
      className: `${PREFIX}box-container`,
    }) as HTMLDivElement;
  },

  getPositionInfo(this: BoxInstance) {
    return $$.getRectBox(this.element);
  },

  createItemGroup(this: BoxInstance) {
    const itemGroup = this.createGroup();

    switch (this.options.type) {
      case BOX_TYPE.DETACHED:
        return itemGroup.items[0];
      case BOX_TYPE.OVERLAP:
        return this.createOverlapGroup(itemGroup);
      default:
        return null;
    }
  },

  enable(this: BoxInstance) {
    this.overlapButtonObject?.enable();
  },

  disable(this: BoxInstance) {
    this.overlapButtonObject?.disable();
  },

  hide(this: BoxInstance) {
    this.overlapButtonObject?.hideMount();
  },

  getOverlapContent(this: BoxInstance) {
    if (this.options.type !== BOX_TYPE.OVERLAP || this.overlapIndex < 0) {
      return null;
    }

    return this.options.group[this.overlapIndex].items;
  },

  createOverlapGroup(this: BoxInstance, itemGroup: BoxGroupResult) {
    const classifyList = itemGroup.title;
    const overlapContainer = createOverlapContainer(this.doc);
    const overlapButtonObject = createOverlapButton(this.doc, {
      fixOffset: this.options.fixOffset,
    });
    const overlapListObject = createOverlapList(this.doc, {
      width: 150,
      items: classifyList,
    });
    const wrapNode = $$.ele(this.doc, 'div', {
      className: `${PREFIX}wrap-group`,
    }) as HTMLDivElement;

    this.overlapButtonObject = overlapButtonObject;
    overlapButtonObject.mount(overlapListObject as any);
    overlapButtonObject.initEvent();
    overlapListObject.initEvent();

    kity.Utils.each(itemGroup.items, (itemArr: HTMLDivElement[], index: number) => {
      const itemWrapNode = wrapNode.cloneNode(false) as HTMLDivElement;

      kity.Utils.each(itemArr, (item: HTMLDivElement) => {
        itemWrapNode.appendChild(item);
      });

      itemGroup.items[index] = itemWrapNode as unknown as HTMLDivElement[];
    });

    this.itemPanels = itemGroup.items as unknown as HTMLDivElement[];

    overlapListObject.setSelectHandler((index: number, oldIndex: number) => {
      this.overlapIndex = index;
      overlapButtonObject.setLabel(classifyList[index]);
      overlapButtonObject.hideMount();
      (itemGroup.items[oldIndex] as unknown as HTMLDivElement).style.display = 'none';
      (itemGroup.items[index] as unknown as HTMLDivElement).style.display = 'block';

      if (index !== oldIndex) {
        this.updateSize();
      }

      this.onchangeHandler(index);
    });

    overlapContainer.appendChild(overlapButtonObject.getNode());

    kity.Utils.each(itemGroup.items, (group: unknown, index: number) => {
      const groupNode = group as HTMLDivElement;

      if (index > 0) {
        groupNode.style.display = 'none';
      }

      overlapContainer.appendChild(groupNode);
    });

    overlapListObject.select(0);

    return [overlapContainer];
  },

  getCurrentItemPanel(this: BoxInstance) {
    return this.itemPanels![this.overlapIndex];
  },

  getGroupList(this: BoxInstance) {
    const lists: string[] = [];

    kity.Utils.each(this.options.group, (group: BoxContentGroup) => {
      lists.push(group.title || '');
    });

    return {
      width: 150,
      items: lists,
    };
  },

  createGroup(this: BoxInstance) {
    const doc = this.doc;
    const result: BoxGroupResult = {
      title: [],
      items: [],
    };
    const baseGroupNode = $$.ele(this.doc, 'div', {
      className: `${PREFIX}box-group`,
    }) as HTMLDivElement;
    const baseItemContainer = baseGroupNode.cloneNode(false) as HTMLDivElement;
    baseItemContainer.className = `${PREFIX}box-group-item-container`;
    const itemType = BOX_TYPE.DETACHED === this.options.type ? ITEM_TYPE.BIG : ITEM_TYPE.SMALL;

    kity.Utils.each(this.options.group, (group: BoxContentGroup) => {
      result.title.push(group.title || '');
      const itemGroup: HTMLDivElement[] = [];

      kity.Utils.each(group.items, (item: { title: string; content: BoxItemImage[] }) => {
        const groupNode = baseGroupNode.cloneNode(false) as HTMLDivElement;
        const itemContainer = baseItemContainer.cloneNode(false) as HTMLDivElement;
        const groupTitle = $$.ele(doc, 'div', {
          className: `${PREFIX}box-group-title`,
          content: item.title,
        }) as HTMLDivElement;

        groupNode.appendChild(groupTitle);
        groupNode.appendChild(itemContainer);

        kity.Utils.each(createItems(doc, item.content, itemType), (boxItem: BoxItemInstance) => {
          boxItem.appendTo(itemContainer);
        });

        itemGroup.push(groupNode);
      });

      result.items.push(itemGroup);
    });

    return result;
  },

  mergeElement(this: BoxInstance) {
    const groupContainer = this.groupContainer;
    this.element.appendChild(groupContainer);

    kity.Utils.each(this.itemGroups, (group: HTMLDivElement) => {
      groupContainer.appendChild(group);
    });
  },

  mountTo(this: BoxInstance, container: HTMLElement) {
    container.appendChild(this.element);
  },

  appendTo(this: BoxInstance, container: HTMLElement) {
    container.appendChild(this.element);
  },
});

export default Box as new (doc: Document, options: BoxOptions) => BoxInstance;
