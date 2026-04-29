import { createLegacyBaseComponent } from '../vendor/legacy-component';
import { getLegacyKf, getLegacyKity } from '../vendor/runtime-interop';
import type { LegacyEditorInstance } from './editor';

type LegacyViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type LegacyViewport = {
  zoom: number;
  [key: string]: unknown;
};

type LegacyRenderBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type LegacyContainerTranslate = {
  x: number;
  y: number;
};

type LegacyFormulaContainer = {
  getRenderBox: (scope?: string) => LegacyRenderBox;
  setTranslate: (x: number | LegacyContainerTranslate, y?: number) => void;
  getTranslate: () => LegacyContainerTranslate;
};

type LegacyFormula = {
  container: LegacyFormulaContainer;
  node: {
    removeAttribute: (name: string) => void;
  };
  getViewBox: () => LegacyViewBox;
  setViewBox: (x: number, y: number, width: number, height: number) => void;
  getViewPort: () => LegacyViewport;
  setViewPort: (viewPort: LegacyViewport) => void;
  getContentContainer: () => {
    getRenderBox: (scope?: string) => LegacyRenderBox;
  };
};

type LegacyAssembly = {
  formula: LegacyFormula;
  regenerateBy: (parsedTree: unknown) => unknown;
};

type LegacyKfWithAssembly = ReturnType<typeof getLegacyKf> & {
  Assembly: new (formula: unknown) => LegacyAssembly;
};

type SelectableGroupObject = {
  node: Element & {
    ownerSVGElement?: SVGSVGElement | null;
  };
  operands: Array<{
    getRenderBox: (group: SelectableGroupObject) => LegacyRenderBox;
    node: Element;
  }>;
  getOperand: (index: number) => {
    getRenderBox: (group: SelectableGroupObject) => LegacyRenderBox;
    node: Element;
  };
  select: () => void;
  selectAll: () => void;
  unselect: () => void;
  getRenderBox: (group: SelectableGroupObject) => LegacyRenderBox;
  setBoxWidth: (width: number) => void;
  getBox: () => {
    setTranslate: (x: number, y: number) => void;
  };
};

type CursorRecord = {
  groupId: string;
  startOffset: number;
  endOffset: number;
};

type GroupInfo = {
  id: string;
  groupObj: Element;
  content: Array<{ id: string }>;
};

type RenderComponentRecord = {
  select: {
    lastSelect?: SelectableGroupObject | null;
  };
  cursor: Record<string, unknown>;
  canvas: {
    viewBox?: LegacyViewBox | null;
    contentOffset?: LegacyContainerTranslate | null;
  };
};

type RenderComponentInstance = {
  options: typeof DEFAULT_OPTIONS & Record<string, unknown>;
  kfEditor: LegacyEditorInstance;
  assembly: LegacyAssembly | null;
  formula: LegacyFormula;
  relDisabled: boolean;
  canvasZoom: number;
  record: RenderComponentRecord;
  callBase: () => void;
  initCanvas: () => void;
  setCanvasOffset: (offsetX: number, offsetY?: number) => void;
  setCanvasToCenter: () => void;
  initServices: () => void;
  initCommands: () => void;
  relocation: () => void;
  relocationToCenter: () => void;
  relocationToLeft: () => void;
  selectGroup: (groupId: string) => void;
  selectGroupContent: (group: GroupInfo) => void;
  selectAllGroup: (group: GroupInfo) => void;
  selectCurrentCursor: () => void;
  tintCurrentGroup: () => void;
  reselect: () => void;
  clearSelect: () => void;
  getPaper: () => LegacyFormula;
  getPaperOffset: () => LegacyContainerTranslate;
  render: (latexStr: string) => void;
  enableRelocation: () => void;
  disableRelocation: () => void;
  setCanvasZoom: (zoom: number) => void;
  getCanvas: () => LegacyFormula;
  getContentSize: () => LegacyRenderBox;
  clearCanvasTransform: () => void;
  revertCanvasTransform: () => boolean;
  getCanvasZoom: () => number;
  insertString: (value: string) => string;
  insertGroup: (value: unknown) => unknown;
};

const DEFAULT_OPTIONS = {
  autoresize: false,
  fontsize: 50,
  padding: [20, 50],
};

const kity = getLegacyKity() as ReturnType<typeof getLegacyKity> & {
  Utils: {
    extend: <T>(deep: boolean | T, target?: T, ...sources: Array<Record<string, unknown>>) => T;
  };
};
const kf = getLegacyKf() as LegacyKfWithAssembly;
const BaseComponent = createLegacyBaseComponent(kity as { createClass: (name: string, definition: object) => unknown });

const RenderComponent = kity.createClass('RenderComponent', {
  base: BaseComponent,

  constructor(this: RenderComponentInstance, kfEditor: LegacyEditorInstance, options?: Record<string, unknown>) {
    if (false) {
      this.callBase();
    }
    (BaseComponent as any).call(this);

    this.options = kity.Utils.extend({}, DEFAULT_OPTIONS, options) as typeof DEFAULT_OPTIONS & Record<string, unknown>;
    this.kfEditor = kfEditor;
    this.assembly = null;
    this.formula = null as unknown as LegacyFormula;
    this.relDisabled = false;
    this.canvasZoom = 1;
    this.record = {
      select: {},
      cursor: {},
      canvas: {},
    };

    this.initCanvas();
    this.initServices();
    this.initCommands();
  },

  initCanvas(this: RenderComponentInstance) {
    const canvasContainer = this.kfEditor.requestService('ui.get.canvas.container') as HTMLElement;
    const Formula = this.kfEditor.getFormulaClass() as new (container: HTMLElement, options: unknown) => LegacyFormula;

    this.assembly = new kf.Assembly(new Formula(canvasContainer, this.options)) as LegacyAssembly;
    this.formula = this.assembly.formula;
    this.setCanvasToCenter();
  },

  setCanvasOffset(this: RenderComponentInstance, offsetX: number, offsetY?: number) {
    const viewBox = this.formula.getViewBox();
    const nextOffsetY = offsetY !== undefined ? offsetY : -viewBox.height / 2;

    this.formula.setViewBox(offsetX, nextOffsetY, viewBox.width, viewBox.height);
  },

  setCanvasToCenter(this: RenderComponentInstance) {
    const viewBox = this.formula.getViewBox();
    this.formula.setViewBox(-viewBox.width / 2, -viewBox.height / 2, viewBox.width, viewBox.height);
  },

  initServices(this: RenderComponentInstance) {
    this.kfEditor.registerService('render.get.canvas', this, {
      getCanvas: this.getCanvas,
    });
    this.kfEditor.registerService('render.get.content.size', this, {
      getContentSize: this.getContentSize,
    });
    this.kfEditor.registerService('render.clear.canvas.transform', this, {
      clearCanvasOffset: this.clearCanvasTransform,
    });
    this.kfEditor.registerService('render.set.canvas.offset', this, {
      setCanvasOffset: this.setCanvasOffset,
    });
    this.kfEditor.registerService('render.set.canvas.to.center', this, {
      setCanvasToCenter: this.setCanvasToCenter,
    });
    this.kfEditor.registerService('render.revert.canvas.transform', this, {
      revertCanvasTransform: this.revertCanvasTransform,
    });
    this.kfEditor.registerService('render.relocation', this, {
      relocation: this.relocation,
    });
    this.kfEditor.registerService('render.disable.relocation', this, {
      disableRelocation: this.disableRelocation,
    });
    this.kfEditor.registerService('render.enable.relocation', this, {
      enableRelocation: this.enableRelocation,
    });
    this.kfEditor.registerService('render.select.group.content', this, {
      selectGroupContent: this.selectGroupContent,
    });
    this.kfEditor.registerService('render.select.group', this, {
      selectGroup: this.selectGroup,
    });
    this.kfEditor.registerService('render.select.group.all', this, {
      selectAllGroup: this.selectAllGroup,
    });
    this.kfEditor.registerService('render.tint.current.cursor', this, {
      tintCurrentGroup: this.tintCurrentGroup,
    });
    this.kfEditor.registerService('render.select.current.cursor', this, {
      selectCurrentCursor: this.selectCurrentCursor,
    });
    this.kfEditor.registerService('render.reselect', this, {
      reselect: this.reselect,
    });
    this.kfEditor.registerService('render.clear.select', this, {
      clearSelect: this.clearSelect,
    });
    this.kfEditor.registerService('render.set.canvas.zoom', this, {
      setCanvasZoom: this.setCanvasZoom,
    });
    this.kfEditor.registerService('render.get.canvas.zoom', this, {
      getCanvasZoom: this.getCanvasZoom,
    });
    this.kfEditor.registerService('render.get.paper.offset', this, {
      getPaperOffset: this.getPaperOffset,
    });
    this.kfEditor.registerService('render.draw', this, {
      render: this.render,
    });
    this.kfEditor.registerService('render.insert.string', this, {
      insertString: this.insertString,
    });
    this.kfEditor.registerService('render.insert.group', this, {
      insertGroup: this.insertGroup,
    });
    this.kfEditor.registerService('render.get.paper', this, {
      getPaper: this.getPaper,
    });
  },

  initCommands(this: RenderComponentInstance) {
    this.kfEditor.registerCommand('render', this, function (this: RenderComponentInstance, str: string) {
      this.render(str);
      this.kfEditor.requestService('ui.update.canvas.view');
    });

    this.kfEditor.registerCommand('getPaper', this, this.getPaper);
  },

  relocation(this: RenderComponentInstance) {
    if (!this.relDisabled) {
      this.relocationToCenter();
      return;
    }

    this.relocationToLeft();
  },

  relocationToCenter(this: RenderComponentInstance) {
    const formulaSpace = this.formula.container.getRenderBox();

    this.formula.container.setTranslate(-formulaSpace.width / 2, -formulaSpace.height / 2);
    this.setCanvasToCenter();
  },

  relocationToLeft(this: RenderComponentInstance) {
    const formulaSpace = this.formula.container.getRenderBox();

    this.formula.container.setTranslate(0, -formulaSpace.height / 2);
    this.setCanvasOffset(0);
  },

  selectGroup(this: RenderComponentInstance, groupId: string) {
    const groupObject = this.kfEditor.requestService('syntax.get.group.object', groupId) as SelectableGroupObject;

    this.clearSelect();

    if (groupObject.node.getAttribute('data-root')) {
      return;
    }

    this.record.select.lastSelect = groupObject;
    groupObject.select();
  },

  selectGroupContent(this: RenderComponentInstance, group: GroupInfo) {
    let nextGroup = group;

    if (group.groupObj.getAttribute('data-placeholder') !== null) {
      nextGroup = {
        id: group.content[0].id,
        groupObj: group.groupObj,
        content: group.content,
      };
    }

    const groupObject = this.kfEditor.requestService('syntax.get.group.object', nextGroup.id) as SelectableGroupObject;

    this.clearSelect();
    this.record.select.lastSelect = groupObject;

    if (groupObject.node.getAttribute('data-root')) {
      return;
    }

    groupObject.select();
  },

  selectAllGroup(this: RenderComponentInstance, group: GroupInfo) {
    let nextGroup = group;

    if (group.groupObj.getAttribute('data-placeholder') !== null) {
      nextGroup = {
        id: group.content[0].id,
        groupObj: group.groupObj,
        content: group.content,
      };
    }

    const groupObject = this.kfEditor.requestService('syntax.get.group.object', nextGroup.id) as SelectableGroupObject;

    this.clearSelect();
    this.record.select.lastSelect = groupObject;
    groupObject.selectAll();
  },

  selectCurrentCursor(this: RenderComponentInstance) {
    const cursorInfo = this.kfEditor.requestService('syntax.get.record.cursor') as CursorRecord;
    const group = this.kfEditor.requestService('syntax.get.group.object', cursorInfo.groupId) as SelectableGroupObject;
    let offset = -1;
    let width = 0;
    const startIndex = Math.min(cursorInfo.startOffset, cursorInfo.endOffset);
    const endIndex = Math.max(cursorInfo.startOffset, cursorInfo.endOffset);

    this.clearSelect();
    this.record.select.lastSelect = group;

    for (let i = startIndex; i < endIndex; i += 1) {
      const box = group.getOperand(i).getRenderBox(group);

      if (offset === -1) {
        offset = box.x;
      }

      width += box.width;
    }

    group.setBoxWidth(width);
    group.selectAll();
    group.getBox().setTranslate(offset, 0);
  },

  tintCurrentGroup(this: RenderComponentInstance) {
    const groupId = (this.kfEditor.requestService('syntax.get.record.cursor') as CursorRecord).groupId;
    let groupObject = this.kfEditor.requestService('syntax.get.group.object', groupId) as SelectableGroupObject;
    const isPlaceholder = this.kfEditor.requestService('syntax.is.placeholder.node', groupId) as boolean;

    this.clearSelect();

    if (groupObject.node.getAttribute('data-root')) {
      return;
    }

    if (isPlaceholder) {
      groupObject = this.kfEditor.requestService(
        'syntax.get.group.object',
        (groupObject.operands[0].node as Element & { id: string }).id,
      ) as SelectableGroupObject;
    }

    this.record.select.lastSelect = groupObject;
    groupObject.select();
  },

  reselect(this: RenderComponentInstance) {
    const cursorInfo = this.kfEditor.requestService('syntax.get.record.cursor') as CursorRecord;
    const groupObject = this.kfEditor.requestService('syntax.get.group.object', cursorInfo.groupId) as SelectableGroupObject;

    this.clearSelect();
    this.record.select.lastSelect = groupObject;

    if (groupObject.node.getAttribute('data-root')) {
      return;
    }

    groupObject.select();
  },

  clearSelect(this: RenderComponentInstance) {
    const currentSelect = this.record.select.lastSelect;

    if (!currentSelect || !currentSelect.node.ownerSVGElement) {
      return;
    }

    currentSelect.unselect();
    const box = currentSelect.getRenderBox(currentSelect);
    currentSelect.setBoxWidth(box.width);
    currentSelect.getBox().setTranslate(0, 0);
  },

  getPaper(this: RenderComponentInstance) {
    return this.formula;
  },

  getPaperOffset(this: RenderComponentInstance) {
    return this.formula.container.getTranslate();
  },

  render(this: RenderComponentInstance, latexStr: string) {
    const parsedTree = this.kfEditor.requestService('parser.parse', latexStr, true);
    const objTree = this.assembly!.regenerateBy(parsedTree);

    this.kfEditor.requestService('syntax.update.objtree', objTree);
  },

  enableRelocation(this: RenderComponentInstance) {
    this.relDisabled = false;
  },

  disableRelocation(this: RenderComponentInstance) {
    this.relDisabled = true;
  },

  setCanvasZoom(this: RenderComponentInstance, zoom: number) {
    const viewPort = this.formula.getViewPort();

    this.canvasZoom = zoom;
    viewPort.zoom = zoom;
    this.formula.setViewPort(viewPort);
  },

  getCanvas(this: RenderComponentInstance) {
    return this.formula;
  },

  getContentSize(this: RenderComponentInstance) {
    return this.formula.container.getRenderBox();
  },

  clearCanvasTransform(this: RenderComponentInstance) {
    const canvasInfo = this.record.canvas;

    canvasInfo.viewBox = this.formula.getViewBox();
    canvasInfo.contentOffset = this.formula.container.getTranslate();

    this.setCanvasToCenter();
    this.formula.node.removeAttribute('viewBox');
    this.formula.container.setTranslate(0, 0);
  },

  revertCanvasTransform(this: RenderComponentInstance) {
    const canvasInfo = this.record.canvas;
    const viewBox = canvasInfo.viewBox;

    if (!viewBox) {
      return false;
    }

    this.formula.setViewBox(viewBox.x, viewBox.y, viewBox.width, viewBox.height);
    this.formula.container.setTranslate(canvasInfo.contentOffset!);

    canvasInfo.viewBox = null;
    canvasInfo.contentOffset = null;

    return true;
  },

  getCanvasZoom(this: RenderComponentInstance) {
    return this.canvasZoom;
  },

  insertString(this: RenderComponentInstance, value: string) {
    return value;
  },

  insertGroup(this: RenderComponentInstance, value: unknown) {
    return value;
  },
});

export default RenderComponent as new (kfEditor: LegacyEditorInstance, options?: Record<string, unknown>) => RenderComponentInstance;
