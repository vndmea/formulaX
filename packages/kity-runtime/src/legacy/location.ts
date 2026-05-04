import { getLegacyKity } from '../vendor/runtime-interop';
import { legacyBaseUtils } from '../vendor/legacy-utils';
import type { LegacyEditorInstance } from './editor';

type LegacyRectShape = {
  fill: (color: string) => LegacyRectShape;
  setAttr: (name: string, value: string) => void;
  setHeight: (height: number) => void;
  getTransform: (shape: LegacyRectShape) => {
    m: {
      e: number;
      f: number;
    };
  };
  setMatrix: (transform: unknown) => void;
  getRenderBox: (mode: string) => {
    x: number;
    y: number;
  };
};

type LegacyKityWithRect = ReturnType<typeof getLegacyKity> & {
  Rect: new (width: number, height: number, x: number, y: number) => LegacyRectShape;
};

type PaperLike = {
  container: {
    node: Element;
  };
  addShape: (shape: LegacyRectShape) => void;
  getZoom: () => number;
};

type CursorInfo = {
  groupId: string;
  startOffset: number;
  endOffset: number;
};

type GroupInfo = {
  id: string;
  content: Array<Element & { id: string }>;
};

type LocationComponentInstance = {
  parentComponent: unknown;
  kfEditor: LegacyEditorInstance;
  paper: PaperLike;
  cursorShape: LegacyRectShape;
  getPaper: () => PaperLike;
  initServices: () => void;
  initEvent: () => void;
  createCursor: () => LegacyRectShape;
  updateCursorInfo: (evt: MouseEvent) => false | void;
  hideCursor: () => void;
  reselect: () => void;
  updateCursor: () => void;
  getCursorLocation: () => { x: number; y: number };
  getIndex: (distance: number, groupInfo: GroupInfo) => number;
};

const kity = getLegacyKity() as LegacyKityWithRect;

const LocationComponent = kity.createClass('LocationComponent', {
  constructor(this: LocationComponentInstance, parentComponent: unknown, kfEditor: LegacyEditorInstance) {
    this.parentComponent = parentComponent;
    this.kfEditor = kfEditor;
    this.paper = this.getPaper();
    this.cursorShape = this.createCursor();
    this.initServices();
    this.initEvent();
  },

  getPaper(this: LocationComponentInstance) {
    return this.kfEditor.requestService('render.get.paper') as PaperLike;
  },

  initServices(this: LocationComponentInstance) {
    this.kfEditor.registerService('control.cursor.relocation', this, {
      relocationCursor: this.updateCursor,
    });

    this.kfEditor.registerService('control.cursor.hide', this, {
      hideCursor: this.hideCursor,
    });

    this.kfEditor.registerService('control.reselect', this, {
      reselect: this.reselect,
    });

    this.kfEditor.registerService('control.get.cursor.location', this, {
      getCursorLocation: this.getCursorLocation,
    });
  },

  createCursor(this: LocationComponentInstance) {
    const cursorShape = new kity.Rect(1, 0, 0, 0).fill('black');

    cursorShape.setAttr('style', 'display: none');
    this.paper.addShape(cursorShape);

    return cursorShape;
  },

  initEvent(this: LocationComponentInstance) {
    const eventServiceObject = this.kfEditor.request('ui.canvas.container.event');

    eventServiceObject.on('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      this.updateCursorInfo(e);
      this.kfEditor.requestService('control.update.input');
      this.reselect();
    });
  },

  updateCursorInfo(this: LocationComponentInstance, evt: MouseEvent) {
    if (this.kfEditor.requestService('syntax.has.root.placeholder')) {
      this.kfEditor.requestService('syntax.update.record.cursor', {
        groupId: (this.kfEditor.requestService('syntax.get.root.group.info') as GroupInfo).id,
        startOffset: 0,
        endOffset: 1,
      });

      return false;
    }

    const wrapNode = this.kfEditor.requestService('position.get.wrap', evt.target) as (Element & { id: string }) | null;

    if (wrapNode && this.kfEditor.requestService('syntax.is.placeholder.node', wrapNode.id)) {
      const groupInfo = this.kfEditor.requestService('position.get.group.info', wrapNode) as {
        group: GroupInfo;
        index: number;
      };

      this.kfEditor.requestService('syntax.update.record.cursor', groupInfo.group.id, groupInfo.index, groupInfo.index + 1);
      return;
    }

    let groupInfo = this.kfEditor.requestService('position.get.group', evt.target) as GroupInfo | null;

    if (groupInfo === null) {
      groupInfo = this.kfEditor.requestService('syntax.get.root.group.info') as GroupInfo;
    }

    const index = this.getIndex(evt.clientX, groupInfo);
    this.kfEditor.requestService('syntax.update.record.cursor', groupInfo.id, index);
  },

  hideCursor(this: LocationComponentInstance) {
    this.cursorShape.setAttr('style', 'display: none');
  },

  reselect(this: LocationComponentInstance) {
    const cursorInfo = this.kfEditor.requestService('syntax.get.record.cursor') as CursorInfo;

    this.hideCursor();

    if (this.kfEditor.requestService('syntax.is.select.placeholder')) {
      const groupInfo = this.kfEditor.requestService('syntax.get.group.content', cursorInfo.groupId) as GroupInfo;
      this.kfEditor.requestService('render.select.group', groupInfo.content[cursorInfo.startOffset].id);
      return;
    }

    if (cursorInfo.startOffset === cursorInfo.endOffset) {
      this.updateCursor();
      this.kfEditor.requestService('render.tint.current.cursor');
      return;
    }

    this.kfEditor.requestService('render.select.current.cursor');
  },

  updateCursor(this: LocationComponentInstance) {
    const cursorInfo = this.kfEditor.requestService('syntax.get.record.cursor') as CursorInfo;

    if (cursorInfo.startOffset !== cursorInfo.endOffset) {
      this.hideCursor();
      return;
    }

    const groupInfo = this.kfEditor.requestService('syntax.get.group.content', cursorInfo.groupId) as GroupInfo;
    const isBefore = cursorInfo.endOffset === 0;
    const index = isBefore ? 0 : cursorInfo.endOffset - 1;
    const focusChild = groupInfo.content[index];
    const paperContainerRect = legacyBaseUtils.getRect(this.paper.container.node);
    const focusChildRect = legacyBaseUtils.getRect(focusChild);
    const cursorTransform = this.cursorShape.getTransform(this.cursorShape);
    const canvasZoom = this.kfEditor.requestService('render.get.canvas.zoom') as number;
    const formulaZoom = this.paper.getZoom();

    this.cursorShape.setHeight(focusChildRect.height / canvasZoom / formulaZoom);

    let cursorOffset = isBefore ? focusChildRect.left - 2 : focusChildRect.left + focusChildRect.width - 2;
    cursorOffset -= paperContainerRect.left;

    cursorTransform.m.e = Math.floor(cursorOffset / canvasZoom / formulaZoom) + 0.5;
    cursorTransform.m.f = (focusChildRect.top - paperContainerRect.top) / canvasZoom / formulaZoom;

    this.cursorShape.setMatrix(cursorTransform);
    this.cursorShape.setAttr('style', 'display: block');
  },

  getCursorLocation(this: LocationComponentInstance) {
    const rect = this.cursorShape.getRenderBox('paper');

    return {
      x: rect.x,
      y: rect.y,
    };
  },

  getIndex(this: LocationComponentInstance, distance: number, groupInfo: GroupInfo) {
    let index = -1;

    for (let i = groupInfo.content.length - 1; i >= 0; i -= 1) {
      index = i;

      const child = groupInfo.content[i];
      const boundingRect = legacyBaseUtils.getRect(child);

      if (boundingRect.left < distance) {
        if (boundingRect.left + boundingRect.width / 2 < distance) {
          index += 1;
        }

        break;
      }
    }

    return index;
  },
});

export default LocationComponent as new (parentComponent: unknown, kfEditor: LegacyEditorInstance) => LocationComponentInstance;
