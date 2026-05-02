import { createClass, extendClass, type KityCtor } from './class-system';
import utils from './utils';
import {
  Box,
  Point,
  g,
  Matrix,
  type BoxInstance,
  type PointInstance,
  type MatrixInstance,
  type PointConstructor,
  type MatrixConstructor,
} from './geometry';

const pc = Point as unknown as PointConstructor;
const mc = Matrix as unknown as MatrixConstructor;

/* ===== Interfaces ===== */

export interface EventHandlerInstance {
  _EVNET_UID: number;
  addEventListener(type: string | string[], handler: (...args: any[]) => any): EventHandlerInstance;
  addOnceEventListener(
    type: string | string[],
    handler: (...args: any[]) => any,
  ): EventHandlerInstance;
  removeEventListener(type: string, handler?: (...args: any[]) => any): EventHandlerInstance;
  on(type: string | string[], handler: (...args: any[]) => any): EventHandlerInstance;
  once(type: string | string[], handler: (...args: any[]) => any): EventHandlerInstance;
  off(type: string, handler?: (...args: any[]) => any): EventHandlerInstance;
  fire(type: string, params?: any): EventHandlerInstance;
  trigger(type: string, params?: any): EventHandlerInstance;
  callMixin: (...args: any[]) => any;
  callBase: (...args: any[]) => any;
}

export interface StyledInstance {
  node: SVGElement;
  addClass(name: string): StyledInstance;
  removeClass(name: string): StyledInstance;
  hasClass(name: string): boolean;
  setStyle(styleOrName: string | Record<string, string>, value?: string): StyledInstance;
}

export interface DataInstance {
  _data: Record<string, any>;
  setData(name: string, value: any): DataInstance;
  getData(name: string): any;
  removeData(name: string): DataInstance;
}

export interface ContainerInstance {
  container?: any;
  items: any[];
  getItems(): any[];
  getItem(index: number): any;
  getFirstItem(): any;
  getLastItem(): any;
  indexOf(item: any): number;
  eachItem(fn: (index: number, item: any) => void): ContainerInstance;
  addItem(item: any, pos?: number, noEvent?: boolean): ContainerInstance;
  addItems(items: any[]): ContainerInstance;
  setItems(items: any[]): ContainerInstance;
  appendItem(item: any): ContainerInstance;
  prependItem(item: any): ContainerInstance;
  removeItem(pos: any, noEvent?: boolean): ContainerInstance;
  clear(): ContainerInstance;
  onContainerChanged(type: string, items: any[]): void;
  handleAdd(item: any, index: number): void;
  handleRemove(item: any, index: number): void;
}

export interface ShapeInstance extends EventHandlerInstance, StyledInstance, DataInstance {
  node: SVGElement;
  container: ContainerInstance;
  transform: {
    translate: any;
    rotate: any;
    scale: any;
    matrix: any;
  };
  getId(): string;
  setId(id: string): ShapeInstance;
  getNode(): SVGElement;
  getBoundaryBox(): BoxInstance;
  getRenderBox(refer?: any): BoxInstance;
  getWidth(): number;
  getHeight(): number;
  getSize(): Omit<BoxInstance, 'x' | 'y'>;
  setOpacity(value: string | number): ShapeInstance;
  getOpacity(): number;
  setVisible(value: boolean): ShapeInstance;
  getVisible(): any;
  hasAncestor(node: any): boolean;
  getTransform(refer?: any): MatrixInstance;
  clearTransform(): ShapeInstance;
  _applyTransform(): ShapeInstance;
  setMatrix(m: any): ShapeInstance;
  setTranslate(t: any): ShapeInstance;
  setRotate(r: any): ShapeInstance;
  setScale(s: any): ShapeInstance;
  translate(dx: number, dy?: number): ShapeInstance;
  rotate(deg: number): ShapeInstance;
  scale(sx: number, sy?: number): ShapeInstance;
  skew(sx: number, sy?: number): ShapeInstance;
  stroke(pen: any, width?: number): ShapeInstance;
  fill(brush: any): ShapeInstance;
  setAttr(a: string | Record<string, any>, v?: string): ShapeInstance;
  getAttr(a: string): any;
  bringTo(index: number): ShapeInstance;
  bringFront(): ShapeInstance;
  bringBack(): ShapeInstance;
  bringTop(): ShapeInstance;
  bringRear(): ShapeInstance;
  bringRefer(referShape: any, offset?: number): ShapeInstance;
  bringAbove(referShape: any): ShapeInstance;
  bringBelow(referShape: any): ShapeInstance;
  replaceBy(newShape: any): ShapeInstance;
  use(): any;
  getPaper(): any;
  isAttached(): boolean;
  whenPaperReady(fn: (paper: any) => void): ShapeInstance;
  remove?: () => ShapeInstance;
}

export interface ShapeContainerInstance extends ContainerInstance {
  isShapeContainer: boolean;
  node: SVGElement;
  shapeNode?: SVGElement;
  getShape(index: number): any;
  addShape(shape: any, index?: number): ShapeContainerInstance;
  put(shape: any): any;
  appendShape(shape: any): ShapeContainerInstance;
  prependShape(shape: any): ShapeContainerInstance;
  replaceShape(replacer: any, origin: any): ShapeContainerInstance;
  addShapeBefore(shape: any, refer: any): ShapeContainerInstance;
  addShapeAfter(shape: any, refer: any): ShapeContainerInstance;
  addShapes(shapes: any[]): ShapeContainerInstance;
  removeShape(index: number): ShapeContainerInstance;
  getShapes(): any[];
  getShapesByType(name: string): any[];
  getShapeById(id: string): any;
  arrangeShape(shape: any, index: number): ShapeContainerInstance;
  getShapeNode(): SVGElement;
  notifyTreeModification(type: string, container: any): void;
}

export interface ViewBoxInstance {
  node: SVGElement;
  getViewBox(): {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  setViewBox(x: number, y: number, width: number, height: number): ViewBoxInstance;
}

export interface TextContentInstance extends ShapeInstance {
  shapeNode: SVGElement;
  clearContent(): TextContentInstance;
  setContent(content: string): TextContentInstance;
  getContent(): string;
  appendContent(content: string): TextContentInstance;
  setSize(value: number): TextContentInstance;
  setFontSize(value: number): TextContentInstance;
  setFontFamily(value: string): TextContentInstance;
  setFontBold(bold: boolean): TextContentInstance;
  setFontItalic(italic: boolean): TextContentInstance;
  setFont(font: any): TextContentInstance;
  getExtentOfChar(index: number): DOMRect;
  getRotationOfChar(index: number): number;
  getCharNumAtPosition(x: number, y: number): number;
}

export interface TextInstance
  extends TextContentInstance, Omit<ShapeContainerInstance, keyof TextContentInstance> {
  _cachedFontHash: string;
  _lastFont: any;
  __fixedPosition?: boolean;
  verticalAlign?: string;
  fixPosition(): void;
  _buildFontHash(): void;
  _fontChanged(font: any): boolean;
  setX(x: number): TextInstance;
  setPosition(x: number, y: number): TextInstance;
  setY(y: number): TextInstance;
  getX(): number;
  getY(): number;
  setTextAnchor(anchor: string): TextInstance;
  getTextAnchor(): string;
  setVerticalAlign(align: string): TextInstance;
  getVerticalAlign(): string;
  setStartOffset(offset: number): void;
  addSpan(span: any): TextInstance;
  setPath(path: any): TextInstance;
}

export interface PathInstance extends ShapeInstance {
  pathdata: string;
  setPathData(data: any): PathInstance;
  getPathData(): string;
  getDrawer(): any;
  isClosed(): boolean;
}

export interface RectInstance extends PathInstance {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  update(): RectInstance;
  setWidth(width: number): RectInstance;
  setHeight(height: number): RectInstance;
  setSize(width: number, height: number): RectInstance;
  setBox(box: any): RectInstance;
  getBox(): BoxInstance;
  getRadius(): number;
  setRadius(radius: number): RectInstance;
  getPosition(): PointInstance;
  setPosition(xOrP: any, y?: number): RectInstance;
  getPositionX(): number;
  getPositionY(): number;
  setPositionX(x: number): RectInstance;
  setPositionY(y: number): RectInstance;
}

export interface GroupInstance extends Omit<ShapeInstance, 'container'>, ShapeContainerInstance {}

export interface PaperInstance
  extends ShapeContainerInstance, EventHandlerInstance, StyledInstance, ViewBoxInstance {
  node: SVGSVGElement;
  resourceNode: SVGDefsElement;
  shapeNode: SVGGElement;
  resources: ContainerInstance;
  container: HTMLElement;
  viewport: any;
  createSVGNode(): SVGSVGElement;
  renderTo(container: HTMLElement | string): void;
  getNode(): SVGSVGElement;
  getContainer(): HTMLElement;
  getWidth(): number;
  setWidth(width: string | number): PaperInstance;
  getHeight(): number;
  setHeight(height: string | number): PaperInstance;
  setViewPort(cx: any, cy?: number, zoom?: number): PaperInstance;
  getViewPort(): any;
  getViewPortMatrix(): MatrixInstance;
  getViewPortTransform(): MatrixInstance;
  getTransform(): MatrixInstance;
  addResource(resource: any): PaperInstance;
  removeResource(resource: any): PaperInstance;
  getPaper(): PaperInstance;
}

export interface PaperConstructor extends KityCtor<PaperInstance> {}

/* ===== SVG ===== */

const _svgId = { id: 0 };

const svg = {
  ns: 'http://www.w3.org/2000/svg',
  xlink: 'http://www.w3.org/1999/xlink',
  defaults: {
    stroke: 'none',
    fill: 'none',
  },
  createNode(name: string): SVGElement {
    const node = document.createElementNS(svg.ns, name);
    node.id = 'kity_' + name + '_' + _svgId.id++;
    return node as SVGElement;
  },
};

/* ===== EventHandler ===== */

const INNER_HANDLER_CACHE: Record<string, Record<string, any>> = {};
const USER_HANDLER_CACHE: Record<string, Record<string, any[]>> = {};
let _guid = 0;

function bindDomEvent(node: any, type: string, handler: any) {
  node.addEventListener(type, handler, false);
}

function deleteDomEvent(node: any, type: string, handler: any) {
  node.removeEventListener(type, handler, false);
}

function sendMessage(messageObj: any, type: string, msg?: any) {
  const handlers = INNER_HANDLER_CACHE[messageObj._EVNET_UID];
  if (!handlers) {
    return;
  }
  const handler = handlers[type];
  if (!handler) {
    return;
  }
  const event = utils.extend({ type, target: messageObj }, msg || {});
  handler.call(messageObj, event);
}

function listen(node: any, type: string, handler: any, isOnce: boolean, targetObject: any) {
  const eid = targetObject._EVNET_UID;

  if (!INNER_HANDLER_CACHE[eid]) {
    INNER_HANDLER_CACHE[eid] = {};
  }
  if (!INNER_HANDLER_CACHE[eid]![type]) {
    INNER_HANDLER_CACHE[eid]![type] = function kityEventHandler(e: any) {
      e = new ShapeEvent(e || window.event);
      const list = USER_HANDLER_CACHE[eid]![type];
      if (!list) {
        return;
      }
      for (let i = 0; i < list.length; i++) {
        const fn = list[i];
        if (fn) {
          const result = fn.call(targetObject, e);
          if (isOnce) {
            targetObject.off(type, fn);
          }
          if (result === false) {
            return false;
          }
        }
      }
      return;
    };
  }

  if (!USER_HANDLER_CACHE[eid]) {
    USER_HANDLER_CACHE[eid] = {};
  }
  if (!USER_HANDLER_CACHE[eid]![type]) {
    USER_HANDLER_CACHE[eid]![type] = [handler];
    if (!!node && 'on' + type in node) {
      bindDomEvent(node, type, INNER_HANDLER_CACHE[eid]![type]);
    }
  } else {
    USER_HANDLER_CACHE[eid]![type].push(handler);
  }
}

function _addEvent(this: any, type: string | string[], handler: any, isOnce?: boolean) {
  isOnce = !!isOnce;
  if (utils.isString(type)) {
    type = (type as string).match(/\S+/g) || [];
  }
  utils.each(type, (currentType: string) => {
    listen(this.node, currentType, handler, isOnce, this);
  });
  return this;
}

function _removeEvent(this: any, type: string, handler?: any) {
  const eventId = this._EVNET_UID as string;
  const userHandlerList = USER_HANDLER_CACHE[eventId]![type];
  let isRemoveAll = handler === undefined;

  if (!isRemoveAll && userHandlerList) {
    isRemoveAll = true;
    utils.each(userHandlerList, (fn: any, index: number) => {
      if (fn === handler) {
        delete userHandlerList[index];
      } else {
        isRemoveAll = false;
      }
    });
  }

  if (isRemoveAll) {
    deleteDomEvent(this.node, type, INNER_HANDLER_CACHE[eventId]![type]);
    delete USER_HANDLER_CACHE[eventId]![type];
    delete INNER_HANDLER_CACHE[eventId]![type];
  }
  return this;
}

const EventHandler = createClass<EventHandlerInstance>('EventHandler', {
  constructor() {
    this._EVNET_UID = ++_guid;
  },

  addEventListener(type: any, handler: any) {
    return _addEvent.call(this, type, handler, false);
  },

  addOnceEventListener(type: any, handler: any) {
    return _addEvent.call(this, type, handler, true);
  },

  removeEventListener(type: any, handler?: any) {
    return _removeEvent.call(this, type, handler);
  },

  on(type: any, handler: any) {
    return this.addEventListener(type, handler);
  },

  once(type: any, handler: any) {
    return this.addOnceEventListener(type, handler);
  },

  off(type: any, handler?: any) {
    return this.removeEventListener(type, handler);
  },

  fire(type: string, params?: any) {
    return this.trigger(type, params);
  },

  trigger(type: string, params?: any) {
    sendMessage(this, type, params);
    return this;
  },
});

/* ===== ShapeEvent ===== */

const ShapeEvent = createClass<any>('ShapeEvent', {
  constructor(event: any) {
    let target: any = null;

    if (!utils.isObject(event.target)) {
      this.type = event.type;
      target = event.target;
      if (target.correspondingUseElement) {
        target = target.correspondingUseElement;
      }
      this.originEvent = event;
      this.targetShape =
        target.shape ||
        target.paper ||
        (event.currentTarget && (event.currentTarget.shape || event.currentTarget.paper));
      if (event._kityParam) {
        utils.extend(this, event._kityParam);
      }
    } else {
      utils.extend(this, event);
    }
  },

  preventDefault() {
    const evt = this.originEvent;
    if (!evt) {
      return true;
    }

    evt.preventDefault();
    return evt.cancelable;
  },

  getPosition(refer?: any, touchIndex?: number) {
    if (!this.originEvent) {
      return null;
    }
    const eventClient = this.originEvent.touches
      ? this.originEvent.touches[touchIndex || 0]
      : this.originEvent;
    const target = this.targetShape;
    const targetNode = target.shapeNode || target.node;
    const pScreen = new pc(
      (eventClient && eventClient.clientX) || 0,
      (eventClient && eventClient.clientY) || 0,
    );
    const pTarget = mc.transformPoint(pScreen, targetNode.getScreenCTM().inverse());
    const pRefer = mc.getCTM(target, refer || 'view').transformPoint(pTarget);
    return pRefer;
  },

  stopPropagation() {
    const evt = this.originEvent;
    if (!evt) {
      return true;
    }

    evt.stopPropagation();
  },
});

/* ===== Styled ===== */

const _ClassListProto: any = {
  constructor(node: HTMLElement) {
    this._node = node;
    this._list = node.className.toString().split(' ');
  },
  _update() {
    this._node.className = this._list.join(' ');
  },
  add(name: string) {
    this._list.push(name);
    this._update();
  },
  remove(name: string) {
    const index = this._list.indexOf(name);
    if (~index) {
      this._list.splice(index, 1);
    }
    this._update();
  },
  contains(name: string) {
    return !!~this._list.indexOf(name);
  },
};

function _getClassList(node: any) {
  if (!node.classList) {
    node.classList = new (createClass('ClassList', _ClassListProto))(node);
  }
  return node.classList;
}

const Styled = createClass<StyledInstance>('Styled', {
  addClass(name: string) {
    _getClassList(this.node).add(name);
    return this;
  },

  removeClass(name: string) {
    _getClassList(this.node).remove(name);
    return this;
  },

  hasClass(name: string) {
    return _getClassList(this.node).contains(name);
  },

  setStyle(styleOrName: string | Record<string, string>, value?: string) {
    if (arguments.length === 2 && typeof styleOrName === 'string') {
      (this.node.style as any)[styleOrName as string] = value;
      return this;
    }
    if (typeof styleOrName === 'object') {
      for (const name in styleOrName) {
        if (Object.prototype.hasOwnProperty.call(styleOrName, name)) {
          (this.node.style as any)[name] = (styleOrName as any)[name];
        }
      }
    }
    return this;
  },
});

/* ===== Data ===== */

const Data = createClass<DataInstance>('Data', {
  constructor() {
    this._data = {};
  },

  setData(name: string, value: any) {
    this._data[name] = value;
    return this;
  },

  getData(name: string) {
    return this._data[name];
  },

  removeData(name: string) {
    delete this._data[name];
    return this;
  },
});

/* ===== Container ===== */

function itemRemove(this: any) {
  this.container.removeItem(this);
  return this;
}

const Container = createClass<ContainerInstance>('Container', {
  getItems() {
    return this.items || (this.items = []);
  },

  getItem(index: number) {
    return this.getItems()[index];
  },

  getFirstItem() {
    return this.getItem(0);
  },

  getLastItem() {
    return this.getItem(this.getItems().length - 1);
  },

  indexOf(item: any) {
    return this.getItems().indexOf(item);
  },

  eachItem(fn: any) {
    const items = this.getItems();
    for (let i = 0; i < items.length; i++) {
      fn.call(this, i, items[i]);
    }
    return this;
  },

  addItem(item: any, pos?: number, noEvent?: boolean) {
    const items = this.getItems();
    const length = items.length;

    if (~items.indexOf(item)) {
      return this;
    }

    if (!(pos! >= 0 && pos! < length)) {
      pos = length;
    }

    items.splice(pos!, 0, item);

    if (typeof item === 'object') {
      item.container = this;
      item.remove = itemRemove;
    }

    this.handleAdd(item, pos!);

    if (!noEvent) {
      this.onContainerChanged('add', [item]);
    }

    return this;
  },

  addItems(items: any[]) {
    for (let i = 0, l = items.length; i < l; i++) {
      this.addItem(items[i], -1, true);
    }
    this.onContainerChanged('add', items);
    return this;
  },

  setItems(items: any[]) {
    return this.clear().addItems(items);
  },

  appendItem(item: any) {
    return this.addItem(item);
  },

  prependItem(item: any) {
    return this.addItem(item, 0);
  },

  removeItem(pos: any, noEvent?: boolean) {
    if (typeof pos !== 'number') {
      return this.removeItem(this.indexOf(pos));
    }

    const items = this.getItems();
    const item = items[pos];

    if (item === undefined) {
      return this;
    }

    items.splice(pos, 1);

    if (item.container) {
      delete item.container;
    }
    if (item.remove) {
      delete item.remove;
    }

    this.handleRemove(item, pos);

    if (!noEvent) {
      this.onContainerChanged('remove', [item]);
    }

    return this;
  },

  clear() {
    const removed: any[] = [];
    let item: any;
    while ((item = this.getFirstItem()) !== undefined) {
      removed.push(item);
      this.removeItem(0, true);
    }
    this.onContainerChanged('remove', removed);
    return this;
  },

  onContainerChanged(_type: string, _items: any[]) {},

  handleAdd(_item: any, _index: number) {},

  handleRemove(_item: any, _index: number) {},
});

/* ===== Shape ===== */

const Shape = createClass<ShapeInstance>('Shape', {
  mixins: [EventHandler, Styled, Data],

  constructor(tagName: string) {
    this.node = svg.createNode(tagName);
    (this.node as any).shape = this;
    this.transform = {
      translate: null,
      rotate: null,
      scale: null,
      matrix: null,
    };
    this.callMixin();
  },

  getId() {
    return this.node.id;
  },

  setId(id: string) {
    this.node.id = id;
    return this;
  },

  getNode() {
    return this.node;
  },

  getBoundaryBox() {
    let box: any;
    try {
      box = (this.node as SVGGraphicsElement).getBBox();
    } catch {
      box = {
        x: this.node.clientLeft,
        y: this.node.clientTop,
        width: this.node.clientWidth,
        height: this.node.clientHeight,
      };
    }
    return new Box(box);
  },

  getRenderBox(refer?: any) {
    const box = this.getBoundaryBox();
    const matrix = this.getTransform(refer);
    return matrix.transformBox(box);
  },

  getWidth() {
    return this.getRenderBox().width;
  },

  getHeight() {
    return this.getRenderBox().height;
  },

  getSize() {
    const box = this.getRenderBox();
    delete (box as any).x;
    delete (box as any).y;
    return box;
  },

  setOpacity(value: string | number) {
    this.node.setAttribute('opacity', String(value));
    return this;
  },

  getOpacity() {
    const opacity = this.node.getAttribute('opacity');
    return opacity ? +opacity : 1;
  },

  setVisible(value: boolean) {
    if (value) {
      this.node.removeAttribute('display');
    } else {
      this.node.setAttribute('display', 'none');
    }
    return this;
  },

  getVisible() {
    this.node.getAttribute('display');
  },

  hasAncestor(node: any) {
    let parent = this.container;
    while (parent) {
      if (parent === node) {
        return true;
      }
      parent = parent.container;
    }
    return false;
  },

  getTransform(refer?: any) {
    return mc.getCTM(this, refer);
  },

  clearTransform() {
    this.node.removeAttribute('transform');
    this.transform = {
      translate: null,
      rotate: null,
      scale: null,
      matrix: null,
    };
    this.trigger('shapeupdate', {
      type: 'transform',
    });
    return this;
  },

  _applyTransform() {
    const t = this.transform;
    const result: any[] = [];
    if (t.translate) {
      result.push(['translate(', t.translate, ')']);
    }
    if (t.rotate) {
      result.push(['rotate(', t.rotate, ')']);
    }
    if (t.scale) {
      result.push(['scale(', t.scale, ')']);
    }
    if (t.matrix) {
      result.push(['matrix(', t.matrix, ')']);
    }
    this.node.setAttribute('transform', utils.flatten(result).join(' '));
    return this;
  },

  setMatrix(m: any) {
    this.transform.matrix = m;
    return this._applyTransform();
  },

  setTranslate(t: any) {
    this.transform.translate = (t !== null && [].slice.call(arguments)) || null;
    return this._applyTransform();
  },

  setRotate(r: any) {
    this.transform.rotate = (r !== null && [].slice.call(arguments)) || null;
    return this._applyTransform();
  },

  setScale(s: any) {
    this.transform.scale = (s !== null && [].slice.call(arguments)) || null;
    return this._applyTransform();
  },

  translate(dx: number, dy?: number) {
    let m = this.transform.matrix || new mc();
    if (dy === undefined) {
      dy = 0;
    }
    this.transform.matrix = m.translate(dx, dy);
    return this._applyTransform();
  },

  rotate(deg: number) {
    let m = this.transform.matrix || new mc();
    this.transform.matrix = m.rotate(deg);
    return this._applyTransform();
  },

  scale(sx: number, sy?: number) {
    let m = this.transform.matrix || new mc();
    if (sy === undefined) {
      sy = sx;
    }
    this.transform.matrix = m.scale(sx, sy);
    return this._applyTransform();
  },

  skew(sx: number, sy?: number) {
    let m = this.transform.matrix || new mc();
    if (sy === undefined) {
      sy = sx;
    }
    this.transform.matrix = m.skew(sx, sy);
    return this._applyTransform();
  },

  stroke(pen: any, width?: number) {
    if (pen && pen.stroke) {
      pen.stroke(this);
    } else if (pen) {
      this.node.setAttribute('stroke', pen.toString());
      if (width) {
        this.node.setAttribute('stroke-width', String(width));
      }
    } else if (pen === null) {
      this.node.removeAttribute('stroke');
    }
    return this;
  },

  fill(brush: any) {
    if (brush) {
      this.node.setAttribute('fill', brush.toString());
    }
    if (brush === null) {
      this.node.removeAttribute('fill');
    }
    return this;
  },

  setAttr(a: string | Record<string, any>, v?: string) {
    if (utils.isObject(a)) {
      utils.each(a, (val: any, key: string) => {
        this.setAttr(key, val);
      });
      return this;
    }
    if (v === undefined || v === null || v === '') {
      this.node.removeAttribute(a as string);
    } else {
      this.node.setAttribute(a as string, v);
    }
    return this;
  },

  getAttr(a: string) {
    return this.node.getAttribute(a);
  },
});

/* ===== ShapeContainer ===== */

const ShapeContainer = createClass<ShapeContainerInstance>('ShapeContainer', {
  base: Container,

  isShapeContainer: true,

  handleAdd(shape: any, index: number) {
    const parent = this.getShapeNode();
    parent.insertBefore(shape.node, parent.childNodes[index] || null);
    shape.trigger('add', { container: this });
    if (shape.notifyTreeModification) {
      shape.notifyTreeModification('treeadd', this);
    }
  },

  handleRemove(shape: any, _index: number) {
    const parent = this.getShapeNode();
    parent.removeChild(shape.node);
    shape.trigger('remove', {
      container: this,
    });
    if (shape.notifyTreeModification) {
      shape.notifyTreeModification('treeremove', this);
    }
  },

  notifyTreeModification(type: string, container: any) {
    this.eachItem((_index: number, shape: any) => {
      if (shape.notifyTreeModification) {
        shape.notifyTreeModification(type, container);
      }
      shape.trigger(type, { container });
    });
  },

  getShape(index: number) {
    return this.getItem(index);
  },

  addShape(shape: any, index?: number) {
    return this.addItem(shape, index);
  },

  put(shape: any) {
    this.addShape(shape);
    return shape;
  },

  appendShape(shape: any) {
    return this.addShape(shape);
  },

  prependShape(shape: any) {
    return this.addShape(shape, 0);
  },

  replaceShape(replacer: any, origin: any) {
    const index = this.indexOf(origin);
    if (index === -1) {
      return;
    }
    this.removeShape(index);
    this.addShape(replacer, index);
    return this;
  },

  addShapeBefore(shape: any, refer: any) {
    const index = this.indexOf(refer);
    return this.addShape(shape, index);
  },

  addShapeAfter(shape: any, refer: any) {
    const index = this.indexOf(refer);
    return this.addShape(shape, index === -1 ? undefined : index + 1);
  },

  addShapes(shapes: any[]) {
    return this.addItems(shapes);
  },

  removeShape(index: number) {
    return this.removeItem(index);
  },

  getShapes() {
    return this.getItems();
  },

  getShapesByType(name: string): any[] {
    const shapes: any[] = [];
    const getShapes = (shape: any) => {
      if (name.toLowerCase() === shape.getType().toLowerCase()) {
        shapes.push(shape);
      }
      if (shape.isShapeContainer) {
        utils.each(shape.getShapes(), (n: any) => {
          getShapes(n);
        });
      }
    };
    getShapes(this);
    return shapes;
  },

  getShapeById(id: string) {
    return ((this.getShapeNode() as SVGSVGElement).getElementById(id) as any).shape;
  },

  arrangeShape(shape: any, index: number) {
    return this.removeShape(shape).addShape(shape, index);
  },

  getShapeNode() {
    return this.shapeNode || this.node;
  },
});

/* ===== Shape extensions via ShapeContainer ===== */

extendClass(Shape, {
  bringTo(index: number) {
    this.container.arrangeShape(this, index);
    return this;
  },

  bringFront() {
    return this.bringTo(this.container.indexOf(this) + 1);
  },

  bringBack() {
    return this.bringTo(this.container.indexOf(this) - 1);
  },

  bringTop() {
    this.container.removeShape(this).addShape(this);
    return this;
  },

  bringRear() {
    return this.bringTo(0);
  },

  bringRefer(referShape: any, offset?: number) {
    if (referShape.container) {
      if (this.remove) {
        this.remove();
      }
      referShape.container.addShape(this, referShape.container.indexOf(referShape) + (offset || 0));
    }
    return this;
  },

  bringAbove(referShape: any) {
    return this.bringRefer(referShape);
  },

  bringBelow(referShape: any) {
    return this.bringRefer(referShape, 1);
  },

  replaceBy(newShape: any) {
    if (this.container) {
      newShape.bringAbove(this);
      this.remove();
    }
    return this;
  },
});

/* ===== ViewBox ===== */

const ViewBox = createClass<ViewBoxInstance>('ViewBox', {
  getViewBox() {
    const attr = this.node.getAttribute('viewBox');
    if (attr === null) {
      return {
        x: 0,
        y: 0,
        width: this.node.clientWidth || (this.node.parentNode as Element)?.clientWidth || 0,
        height: this.node.clientHeight || (this.node.parentNode as Element)?.clientHeight || 0,
      };
    } else {
      const parts = attr.split(' ');
      return {
        x: +parts[0],
        y: +parts[1],
        width: +parts[2],
        height: +parts[3],
      };
    }
  },

  setViewBox(x: number, y: number, width: number, height: number) {
    this.node.setAttribute('viewBox', [x, y, width, height].join(' '));
    return this;
  },
});

/* ===== TextContent ===== */

const TextContent = createClass<TextContentInstance>('TextContent', {
  base: Shape,

  constructor(nodeType: string) {
    this.callBase(nodeType);
    this.shapeNode = this.shapeNode || this.node;
    this.shapeNode.setAttribute('text-rendering', 'geometricPrecision');
  },

  clearContent() {
    while (this.shapeNode.firstChild) {
      this.shapeNode.removeChild(this.shapeNode.firstChild);
    }
    return this;
  },

  setContent(content: string) {
    this.shapeNode.textContent = content;
    return this;
  },

  getContent() {
    return this.shapeNode.textContent;
  },

  appendContent(content: string) {
    this.shapeNode.textContent += content;
    return this;
  },

  setSize(value: number) {
    return this.setFontSize(value);
  },

  setFontSize(value: number) {
    return this.setFont({
      size: value,
    });
  },

  setFontFamily(value: string) {
    return this.setFont({
      family: value,
    });
  },

  setFontBold(bold: boolean) {
    return this.setFont({
      weight: bold ? 'bold' : 'normal',
    });
  },

  setFontItalic(italic: boolean) {
    return this.setFont({
      style: italic ? 'italic' : 'normal',
    });
  },

  setFont(font: any) {
    const node = this.node;
    ['family', 'size', 'weight', 'style'].forEach((section) => {
      if (font[section] === null) {
        node.removeAttribute('font-' + section);
      } else if (font[section]) {
        node.setAttribute('font-' + section, font[section]);
      }
    });
    return this;
  },

  getExtentOfChar(index: number) {
    return (this.node as SVGTextContentElement).getExtentOfChar(index);
  },

  getRotationOfChar(index: number) {
    return (this.node as SVGTextContentElement).getRotationOfChar(index);
  },

  getCharNumAtPosition(x: number, y: number) {
    return (this.node as SVGTextContentElement).getCharNumAtPosition({ x, y });
  },
});

/* ===== Text ===== */

const _offsetHash: Record<string, any> = {};

function _getTextBoundOffset(text: any) {
  const font = text._cachedFontHash;
  if (_offsetHash[font]) {
    return _offsetHash[font];
  }
  const textContent = text.getContent();
  text.setContent('\u767e\u5ea6Fex');
  const bbox = text.getBoundaryBox();
  const y = text.getY();
  if (!bbox.height) {
    return { top: 0, bottom: 0, middle: 0 };
  }
  const topOffset = y - bbox.y + +text.node.getAttribute('dy');
  const bottomOffset = topOffset - bbox.height;
  text.setContent(textContent);
  _offsetHash[font] = {
    top: topOffset,
    bottom: bottomOffset,
    middle: (topOffset + bottomOffset) / 2,
  };
  return _offsetHash[font];
}

const Text = createClass<TextInstance>('Text', {
  base: TextContent,
  mixins: [ShapeContainer],

  constructor(content?: string) {
    this.callBase('text');
    if (content !== undefined) {
      this.setContent(content);
    }
    this._buildFontHash();
  },

  fixPosition() {
    if (!this.__fixedPosition) {
      this.setVerticalAlign(this.getVerticalAlign());
    }
  },

  _buildFontHash() {
    const style = window.getComputedStyle(this.node);
    this._cachedFontHash = [
      style.fontFamily,
      style.fontSize,
      style.fontStretch,
      style.fontStyle,
      style.fontVariant,
      style.fontWeight,
    ].join('-');
  },

  _fontChanged(font: any) {
    const last = this._lastFont;
    const current = utils.extend({}, last, font);
    if (!last) {
      this._lastFont = font;
      return true;
    }
    const changed =
      last.family !== current.family ||
      last.size !== current.size ||
      last.style !== current.style ||
      last.weight !== current.weight;
    this._lastFont = current;
    return changed;
  },

  setX(x: number) {
    this.node.setAttribute('x', String(x));
    return this;
  },

  setPosition(x: number, y: number) {
    return this.setX(x).setY(y);
  },

  setY(y: number) {
    this.node.setAttribute('y', String(y));
    return this;
  },

  getX() {
    return +(this.node.getAttribute('x') || '0');
  },

  getY() {
    return +(this.node.getAttribute('y') || '0');
  },

  setFont(font: any) {
    this.callBase(font);
    if (this._fontChanged(font)) {
      this._buildFontHash();
      this.setVerticalAlign(this.getVerticalAlign());
    }
    return this;
  },

  setTextAnchor(anchor: string) {
    this.node.setAttribute('text-anchor', anchor);
    return this;
  },

  getTextAnchor() {
    return this.node.getAttribute('text-anchor') || 'start';
  },

  setVerticalAlign(align: string) {
    this.whenPaperReady(() => {
      let dy: number;
      switch (align) {
        case 'top':
          dy = _getTextBoundOffset(this).top;
          break;
        case 'bottom':
          dy = _getTextBoundOffset(this).bottom;
          break;
        case 'middle':
          dy = _getTextBoundOffset(this).middle;
          break;
        default:
          dy = 0;
      }
      if (dy) {
        this.__fixedPosition = true;
      }
      this.node.setAttribute('dy', dy as any);
    });
    this.verticalAlign = align;
    return this;
  },

  getVerticalAlign() {
    return this.verticalAlign || 'baseline';
  },

  setStartOffset(offset: number) {
    if (this.shapeNode !== this.node) {
      this.shapeNode.setAttribute('startOffset', offset * 100 + '%');
    }
  },

  addSpan(span: any) {
    this.addShape(span);
    return this;
  },

  setPath(path: any) {
    let textpath = this.shapeNode;
    if (this.shapeNode === this.node) {
      textpath = this.shapeNode = svg.createNode('textPath');
      while (this.node.firstChild) {
        this.shapeNode.appendChild(this.node.firstChild);
      }
      this.node.appendChild(textpath);
    }
    textpath.setAttributeNS(svg.xlink, 'xlink:href', '#' + path.node.id);
    this.setTextAnchor(this.getTextAnchor());
    return this;
  },
});

/* ===== PathDrawer ===== */

const PathDrawer = createClass<any>('PathDrawer', {
  constructor(path: any) {
    this.segment = [];
    this.path = path;
    this.__clear = false;
  },

  getPath() {
    return this.path;
  },

  redraw() {
    this._transation = this._transation || [];
    return this.clear();
  },

  done() {
    const transation = this._transation;
    this._transation = null;
    this.push(transation);
    return this;
  },

  clear() {
    if (this._transation) {
      this._transation = [];
    } else {
      this.path.setPathData('M 0 0');
    }
    this._clear = true;
    return this;
  },

  push() {
    const segment = [].slice.call(arguments);
    let originData;
    if (this._transation) {
      this._transation.push(segment);
      return this;
    }
    if (this._clear) {
      originData = '';
      this._clear = false;
    } else {
      originData = this.path.getPathData();
    }
    originData = originData || '';
    this.path.setPathData(originData + g.pathToString(segment));
    return this;
  },

  moveTo(_x: number, _y: number) {
    return this.push('M', [].slice.call(arguments));
  },

  moveBy(_dx: number, _dy: number) {
    return this.push('m', [].slice.call(arguments));
  },

  lineTo(_x: number, _y: number) {
    return this.push('L', [].slice.call(arguments));
  },

  lineBy(_dx: number, _dy: number) {
    return this.push('l', [].slice.call(arguments));
  },

  arcTo(
    _rx: number,
    _ry: number,
    _xr: number,
    _laf: number,
    _sf: number,
    _x: number,
    _y: number,
  ) {
    return this.push('A', [].slice.call(arguments));
  },

  arcBy(
    _rx: number,
    _ry: number,
    _xr: number,
    _laf: number,
    _sf: number,
    _dx: number,
    _dy: number,
  ) {
    return this.push('a', arguments);
  },

  carcTo(r: number, _laf: number, _sf: number, _x: number, _y: number) {
    return this.push('A', [r, r, 0].concat([].slice.call(arguments, 1)));
  },

  carcBy(r: number, _laf: number, _sf: number, _dx: number, _dy: number) {
    return this.push('a', [r, r, 0].concat([].slice.call(arguments, 1)));
  },

  bezierTo(_x1: number, _y1: number, _x2: number, _y2: number, _x: number, _y: number) {
    return this.push('C', [].slice.call(arguments));
  },

  bezierBy(
    _dx1: number,
    _dy1: number,
    _dx2: number,
    _dy2: number,
    _dx: number,
    _dy: number,
  ) {
    return this.push('c', [].slice.call(arguments));
  },

  close() {
    return this.push('z');
  },
});

/* ===== Path ===== */

const Path = createClass<PathInstance>('Path', {
  base: Shape,

  constructor(data?: string) {
    this.callBase('path');
    if (data) {
      this.setPathData(data);
    }
    this.node.setAttribute('fill', svg.defaults.fill);
    this.node.setAttribute('stroke', svg.defaults.stroke);
  },

  setPathData(data: any) {
    data = data || 'M0,0';
    this.pathdata = g.pathToString(data);
    this.node.setAttribute('d', this.pathdata);
    this.trigger('shapeupdate', {
      type: 'pathdata',
    });
    return this;
  },

  getPathData() {
    return this.pathdata || '';
  },

  getDrawer() {
    return new PathDrawer(this);
  },

  isClosed() {
    const data = this.getPathData();
    return !!~data.indexOf('z') || !!~data.indexOf('Z');
  },
});

/* ===== Rect ===== */

const RectUtils = {
  formatRadius(width: number, height: number, radius: number) {
    const minValue = Math.floor(Math.min(width / 2, height / 2));
    return Math.min(minValue, radius);
  },
};

const Rect = createClass<RectInstance>('Rect', {
  base: Path,

  constructor(width?: number, height?: number, x?: number, y?: number, radius?: number) {
    this.callBase();
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.radius = RectUtils.formatRadius(this.width, this.height, radius || 0);
    this.update();
  },

  update() {
    const x = this.x,
      y = this.y,
      w = this.width,
      h = this.height,
      r = this.radius;
    const drawer = this.getDrawer().redraw();

    if (!r) {
      drawer.push('M', x, y);
      drawer.push('h', w);
      drawer.push('v', h);
      drawer.push('h', -w);
      drawer.push('z');
    } else {
      const w2 = w - 2 * r;
      const h2 = h - 2 * r;
      drawer.push('M', x + r, y);
      drawer.push('h', w2);
      drawer.push('a', r, r, 0, 0, 1, r, r);
      drawer.push('v', h2);
      drawer.push('a', r, r, 0, 0, 1, -r, r);
      drawer.push('h', -w2);
      drawer.push('a', r, r, 0, 0, 1, -r, -r);
      drawer.push('v', -h2);
      drawer.push('a', r, r, 0, 0, 1, r, -r);
      drawer.push('z');
    }
    drawer.done();
    return this;
  },

  setWidth(width: number) {
    this.width = width;
    return this.update();
  },

  setHeight(height: number) {
    this.height = height;
    return this.update();
  },

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    return this.update();
  },

  setBox(box: any) {
    this.x = box.x;
    this.y = box.y;
    this.width = box.width;
    this.height = box.height;
    return this.update();
  },

  getBox() {
    return new Box(this.x, this.y, this.width, this.height);
  },

  getRadius() {
    return this.radius;
  },

  setRadius(radius: number) {
    this.radius = RectUtils.formatRadius(this.width, this.height, radius || 0);
    return this.update();
  },

  getPosition() {
    return new pc(this.x, this.y);
  },

  setPosition(xOrP: any, y?: number) {
    if (arguments.length === 1) {
      const p = pc.parse(arguments[0]);
      y = p.y;
      xOrP = p.x;
    }
    this.x = xOrP;
    this.y = y as number;
    return this.update();
  },

  getWidth() {
    return this.width;
  },

  getHeight() {
    return this.height;
  },

  getPositionX() {
    return this.x;
  },

  getPositionY() {
    return this.y;
  },

  setPositionX(x: number) {
    this.x = x;
    return this.update();
  },

  setPositionY(y: number) {
    this.y = y;
    return this.update();
  },
});

/* ===== Group ===== */

const Group = createClass<GroupInstance>('Group', {
  mixins: [ShapeContainer],
  base: Shape,

  constructor() {
    this.callBase('g');
  },
});

/* ===== Use ===== */

const Use = createClass<any>('Use', {
  base: Shape,

  constructor(shape?: any) {
    this.callBase('use');
    this.ref(shape);
  },

  ref(shape: any) {
    if (!shape) {
      this.node.removeAttributeNS(svg.xlink, 'xlink:href');
      return this;
    }
    const shapeId = shape.getId();
    if (shapeId) {
      this.node.setAttributeNS(svg.xlink, 'xlink:href', '#' + shapeId);
    }
    if (shape.node.getAttribute('fill') === 'none') {
      shape.node.removeAttribute('fill');
    }
    if (shape.node.getAttribute('stroke') === 'none') {
      shape.node.removeAttribute('stroke');
    }
    return this;
  },
});

extendClass(Shape, {
  use() {
    return new Use(this);
  },
});

/* ===== Paper ===== */

const Paper = createClass<PaperInstance>('Paper', {
  mixins: [ShapeContainer, EventHandler, Styled, ViewBox],

  constructor(container?: HTMLElement | string) {
    this.callBase();
    this.node = this.createSVGNode();
    (this.node as any).paper = this;
    this.node.appendChild((this.resourceNode = svg.createNode('defs') as SVGDefsElement));
    this.node.appendChild((this.shapeNode = svg.createNode('g') as SVGGElement));
    this.resources = new Container();
    this.setWidth('100%').setHeight('100%');
    if (container) {
      this.renderTo(container);
    }
    this.callMixin();
  },

  renderTo(container: HTMLElement | string) {
    if (utils.isString(container)) {
      container = document.getElementById(container as string) as HTMLElement;
    }
    this.container = container as HTMLElement;
    (container as HTMLElement).appendChild(this.node);
  },

  createSVGNode() {
    const node = svg.createNode('svg');
    node.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    node.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    node.setAttribute('version', '1.1');
    return node;
  },

  getNode() {
    return this.node;
  },

  getContainer() {
    return this.container;
  },

  getWidth() {
    return this.node.clientWidth;
  },

  setWidth(width: string | number) {
    this.node.setAttribute('width', String(width));
    return this;
  },

  getHeight() {
    return this.node.clientHeight;
  },

  setHeight(height: string | number) {
    this.node.setAttribute('height', String(height));
    return this;
  },

  setViewPort(cx: any, cy?: number, zoom?: number) {
    let viewport: any, box: any;
    if (arguments.length === 1) {
      viewport = arguments[0];
      cx = viewport.center.x;
      cy = viewport.center.y;
      zoom = viewport.zoom;
    }
    zoom = zoom || 1;
    box = this.getViewBox();
    const matrix = new mc();
    const dx = box.x + box.width / 2 - (cx as number);
    const dy = box.y + box.height / 2 - (cy as number);
    matrix.translate(-(cx as number), -(cy as number));
    matrix.scale(zoom);
    matrix.translate(cx as number, cy as number);
    matrix.translate(dx, dy);
    this.shapeNode.setAttribute('transform', 'matrix(' + matrix + ')');
    this.viewport = {
      center: { x: cx, y: cy },
      offset: { x: dx, y: dy },
      zoom,
    };
    return this;
  },

  getViewPort() {
    if (!this.viewport) {
      const box = this.getViewBox();
      return {
        zoom: 1,
        center: {
          x: box.x + box.width / 2,
          y: box.y + box.height / 2,
        },
        offset: { x: 0, y: 0 },
      };
    }
    return this.viewport;
  },

  getViewPortMatrix() {
    return mc.parse(this.shapeNode.getAttribute('transform'));
  },

  getViewPortTransform() {
    const m = this.shapeNode.getCTM()!;
    return new mc(m.a, m.b, m.c, m.d, m.e, m.f);
  },

  getTransform() {
    return this.getViewPortTransform().reverse();
  },

  addResource(resource: any) {
    this.resources.appendItem(resource);
    if (resource.node) {
      this.resourceNode.appendChild(resource.node);
    }
    return this;
  },

  removeResource(resource: any) {
    if (resource.remove) {
      resource.remove();
    }
    if (resource.node) {
      this.resourceNode.removeChild(resource.node);
    }
    return this;
  },

  getPaper() {
    return this;
  },
}) as unknown as PaperConstructor;

/* ===== Paper extensions on Shape ===== */

extendClass(Shape, {
  getPaper() {
    let parent = this.container;
    while (parent && parent instanceof Paper === false) {
      parent = parent.container;
    }
    return parent;
  },

  isAttached() {
    return !!this.getPaper();
  },

  whenPaperReady(fn: (paper: any) => void) {
    const me = this;
    function check(): any {
      const paper = me.getPaper();
      if (paper && fn) {
        fn.call(me, paper);
      }
      return paper;
    }
    if (!check()) {
      this.on('add treeadd', function listen() {
        if (check()) {
          me.off('add', listen);
          me.off('treeadd', listen);
        }
      });
    }
    return this;
  },
});

export {
  svg,
  EventHandler,
  Styled,
  Data,
  Container,
  Shape,
  ShapeContainer,
  ViewBox,
  PathDrawer,
  Path,
  Rect,
  Group,
  Text,
  Paper,
  Use,
  ShapeEvent,
};
