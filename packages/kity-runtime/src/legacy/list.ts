import { createLegacyUiUtils } from '../vendor/legacy-ui-utils';
import { getLegacyKity } from '../vendor/runtime-interop';

type ListOptions = {
  width?: number;
  items: string[];
};

type ListItemGroups = {
  container: HTMLDivElement;
  items: HTMLDivElement[];
};

type ListInstance = {
  options: ListOptions;
  doc: Document;
  onselectHandler: (index: number, oldIndex: number) => void;
  currentSelect: number;
  element: HTMLDivElement;
  itemGroups: ListItemGroups;
  setSelectHandler: (selectHandler: (index: number, oldIndex: number) => void) => void;
  createBox: () => HTMLDivElement;
  select: (index: number) => void;
  unselect: (index: number) => void;
  setOffset: (x: number, y: number) => void;
  initEvent: () => void;
  getPositionInfo: () => DOMRect;
  createItems: () => ListItemGroups;
  mergeElement: () => void;
  mountTo: (container: HTMLElement) => void;
};

const PREFIX = 'kf-editor-ui-';
const $$ = createLegacyUiUtils();
const kity = getLegacyKity();

const List = kity.createClass('List', {
  constructor(this: ListInstance, doc: Document, options: ListOptions) {
    this.options = options;
    this.doc = doc;
    this.onselectHandler = function () {};
    this.currentSelect = -1;
    this.element = this.createBox();
    this.itemGroups = this.createItems();
    this.mergeElement();
  },

  setSelectHandler(this: ListInstance, selectHandler: (index: number, oldIndex: number) => void) {
    this.onselectHandler = selectHandler;
  },

  createBox(this: ListInstance) {
    const boxNode = $$.ele(this.doc, 'div', {
      className: `${PREFIX}list`,
    }) as HTMLDivElement;
    const bgNode = $$.ele(this.doc, 'div', {
      className: `${PREFIX}list-bg`,
    }) as HTMLDivElement;

    if ('width' in this.options && this.options.width !== undefined) {
      boxNode.style.width = `${this.options.width}px`;
    }

    boxNode.appendChild(bgNode);
    return boxNode;
  },

  select(this: ListInstance, index: number) {
    let oldSelect = this.currentSelect;

    if (oldSelect === -1) {
      oldSelect = index;
    }

    this.unselect(oldSelect);
    this.currentSelect = index;
    $$.getClassList(this.itemGroups.items[index]).add(`${PREFIX}list-item-select`);
    this.onselectHandler(index, oldSelect);
  },

  unselect(this: ListInstance, index: number) {
    if (!this.itemGroups.items[index]) {
      return;
    }

    $$.getClassList(this.itemGroups.items[index]).remove(`${PREFIX}list-item-select`);
  },

  setOffset(this: ListInstance, x: number, y: number) {
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  },

  initEvent(this: ListInstance) {
    const className = `.${PREFIX}list-item`;
    const self = this;

    $$.delegate(this.itemGroups.container, className, 'mousedown', function (this: Element, e: Event & { which?: number }) {
      e.preventDefault();

      if ((e.which ?? 1) !== 1) {
        return;
      }

      const index = Number(this.getAttribute('data-index'));
      if (!Number.isNaN(index)) {
        self.select(index);
      }
    } as unknown as (event: Event) => void);

    $$.on(this.element, 'mousedown', (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
    });
  },

  getPositionInfo(this: ListInstance) {
    return $$.getRectBox(this.element);
  },

  createItems(this: ListInstance) {
    const doc = this.doc;
    const groupNode = $$.ele(this.doc, 'div', {
      className: `${PREFIX}list-item`,
    }) as HTMLDivElement;
    const itemContainer = groupNode.cloneNode(false) as HTMLDivElement;
    const items: HTMLDivElement[] = [];

    itemContainer.className = `${PREFIX}list-item-container`;

    kity.Utils.each(this.options.items, (itemText: string, i: number) => {
      const itemNode = groupNode.cloneNode(false) as HTMLDivElement;
      const iconNode = groupNode.cloneNode(false) as HTMLDivElement;
      iconNode.className = `${PREFIX}list-item-icon`;

      itemNode.appendChild(iconNode);
      itemNode.appendChild($$.ele(doc, 'text', itemText) as Node);
      itemNode.setAttribute('data-index', String(i));

      items.push(itemNode);
      itemContainer.appendChild(itemNode);
    });

    return {
      container: itemContainer,
      items,
    };
  },

  mergeElement(this: ListInstance) {
    this.element.appendChild(this.itemGroups.container);
  },

  mountTo(this: ListInstance, container: HTMLElement) {
    container.appendChild(this.element);
  },
});

export default List as new (doc: Document, options: ListOptions) => ListInstance;
