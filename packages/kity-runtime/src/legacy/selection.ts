import { legacyBaseUtils } from '../vendor/legacy-utils';
import { getLegacyKity } from '../vendor/runtime-interop';
import type { LegacyEditorInstance } from './editor';

type CursorInfo = {
  groupId: string;
  startOffset: number;
  endOffset: number;
};

type GroupContentInfo = {
  id: string;
  groupObj: Element & { id: string };
  content: Array<Element & { id: string }>;
};

type CommunityGroupInfo = {
  group: GroupContentInfo;
  startOffset: number;
  endOffset: number;
};

type SelectionState = {
  groupInfo: GroupContentInfo;
  offset: number;
};

type SelectionComponentInstance = {
  parentComponent: unknown;
  kfEditor: LegacyEditorInstance;
  isDrag: boolean;
  isMousedown: boolean;
  startPoint: {
    x: number;
    y: number;
  };
  startGroupIsPlaceholder: boolean;
  startGroup: SelectionState;
  initServices: () => void;
  initEvent: () => void;
  getDistance: (x: number, y: number) => number;
  updateStartPoint: (x: number, y: number) => void;
  updateStartGroup: () => void;
  startUpdateSelection: () => void;
  stopUpdateSelection: () => void;
  clearSelection: () => void;
  updateSelection: (target: EventTarget | null, x: number, y: number) => void;
  updateSelectionByTarget: (target: EventTarget | null) => void;
  selectAll: () => void;
  getGroupInof: (offset: number, target: EventTarget | null) => SelectionState;
  getIndex: (groupNode: Element & { id: string }, targetNode: EventTarget | null, offset: number) => number;
  getCommunityGroup: (startGroupInfo: GroupContentInfo, endGroupInfo: GroupContentInfo) => CommunityGroupInfo;
};

const MAX_DISTANCE = 10;
const kity = getLegacyKity();

const SelectionComponent = kity.createClass('SelectionComponent', {
  constructor(this: SelectionComponentInstance, parentComponent: unknown, kfEditor: LegacyEditorInstance) {
    this.parentComponent = parentComponent;
    this.kfEditor = kfEditor;
    this.isDrag = false;
    this.isMousedown = false;
    this.startPoint = { x: -1, y: -1 };
    this.startGroupIsPlaceholder = false;
    this.startGroup = {} as SelectionState;
    this.initServices();
    this.initEvent();
  },

  initServices(this: SelectionComponentInstance) {
    this.kfEditor.registerService('control.select.all', this, {
      selectAll: this.selectAll,
    });
  },

  initEvent(this: SelectionComponentInstance) {
    const eventServiceObject = this.kfEditor.request('ui.canvas.container.event');

    eventServiceObject.on('mousedown', (e: MouseEvent) => {
      e.preventDefault();

      if (this.kfEditor.requestService('syntax.has.root.placeholder')) {
        return false;
      }

      this.isMousedown = true;
      this.updateStartPoint(e.clientX, e.clientY);
      this.updateStartGroup();
    });

    eventServiceObject.on('mouseup', (e: MouseEvent) => {
      e.preventDefault();
      this.stopUpdateSelection();
    });

    eventServiceObject.on('mousemove', (e: MouseEvent) => {
      e.preventDefault();

      if (!this.isDrag) {
        if (this.isMousedown && MAX_DISTANCE < this.getDistance(e.clientX, e.clientY)) {
          this.kfEditor.requestService('control.cursor.hide');
          this.startUpdateSelection();
        }
        return;
      }

      if (e.which !== 1) {
        this.stopUpdateSelection();
        return;
      }

      this.updateSelection(e.target, e.clientX, e.clientY);
    });

    eventServiceObject.on('dblclick', (e: MouseEvent) => {
      this.updateSelectionByTarget(e.target);
    });
  },

  getDistance(this: SelectionComponentInstance, x: number, y: number) {
    const distanceX = Math.abs(x - this.startPoint.x);
    const distanceY = Math.abs(y - this.startPoint.y);

    return Math.max(distanceX, distanceY);
  },

  updateStartPoint(this: SelectionComponentInstance, x: number, y: number) {
    this.startPoint.x = x;
    this.startPoint.y = y;
  },

  updateStartGroup(this: SelectionComponentInstance) {
    const cursorInfo = this.kfEditor.requestService('syntax.get.record.cursor') as CursorInfo;

    this.startGroupIsPlaceholder = this.kfEditor.requestService('syntax.is.select.placeholder') as boolean;
    this.startGroup = {
      groupInfo: this.kfEditor.requestService('syntax.get.group.content', cursorInfo.groupId) as GroupContentInfo,
      offset: cursorInfo.startOffset,
    };
  },

  startUpdateSelection(this: SelectionComponentInstance) {
    this.isDrag = true;
    this.isMousedown = false;
    this.clearSelection();
  },

  stopUpdateSelection(this: SelectionComponentInstance) {
    this.isDrag = false;
    this.isMousedown = false;
    this.kfEditor.requestService('control.update.input');
  },

  clearSelection(this: SelectionComponentInstance) {
    this.kfEditor.requestService('render.clear.select');
  },

  updateSelection(this: SelectionComponentInstance, target: EventTarget | null, x: number) {
    const dir = x > this.startPoint.x;
    const startGroupInfo = this.startGroup;
    const currentGroupInfo = this.getGroupInof(x, target);
    let cursorInfo: CursorInfo;

    if (currentGroupInfo.groupInfo.id === startGroupInfo.groupInfo.id) {
      cursorInfo = {
        groupId: currentGroupInfo.groupInfo.id,
        startOffset: startGroupInfo.offset,
        endOffset: currentGroupInfo.offset,
      };

      if (this.startGroupIsPlaceholder) {
        if (!dir) {
          cursorInfo.startOffset += 1;
        } else if (cursorInfo.startOffset === cursorInfo.endOffset) {
          cursorInfo.endOffset += 1;
        }
      }
    } else if (legacyBaseUtils.contains(startGroupInfo.groupInfo.groupObj, currentGroupInfo.groupInfo.groupObj)) {
      cursorInfo = {
        groupId: startGroupInfo.groupInfo.id,
        startOffset: startGroupInfo.offset,
        endOffset: this.getIndex(startGroupInfo.groupInfo.groupObj, target, x),
      };
    } else if (legacyBaseUtils.contains(currentGroupInfo.groupInfo.groupObj, startGroupInfo.groupInfo.groupObj)) {
      cursorInfo = {
        groupId: currentGroupInfo.groupInfo.id,
        startOffset: this.kfEditor.requestService(
          'position.get.index',
          currentGroupInfo.groupInfo.groupObj,
          startGroupInfo.groupInfo.groupObj,
        ) as number,
        endOffset: currentGroupInfo.offset,
      };

      if (!dir) {
        cursorInfo.startOffset += 1;
      }
    } else {
      const communityGroupInfo = this.getCommunityGroup(startGroupInfo.groupInfo, currentGroupInfo.groupInfo);

      if (communityGroupInfo.startOffset === communityGroupInfo.endOffset) {
        communityGroupInfo.endOffset += 1;
      } else {
        const currentGroupNode = communityGroupInfo.group.content[communityGroupInfo.endOffset];
        const inRightArea = this.kfEditor.requestService('position.get.area', currentGroupNode, x) as boolean;

        if (inRightArea) {
          communityGroupInfo.endOffset += 1;
        }

        if (!dir) {
          communityGroupInfo.startOffset += 1;
        }
      }

      cursorInfo = {
        groupId: communityGroupInfo.group.id,
        startOffset: communityGroupInfo.startOffset,
        endOffset: communityGroupInfo.endOffset,
      };
    }

    this.kfEditor.requestService('syntax.update.record.cursor', cursorInfo.groupId, cursorInfo.startOffset, cursorInfo.endOffset);
    this.kfEditor.requestService('control.reselect');
  },

  updateSelectionByTarget(this: SelectionComponentInstance, target: EventTarget | null) {
    const parentGroupInfo = this.kfEditor.requestService('position.get.parent.group', target) as GroupContentInfo | null;

    if (parentGroupInfo === null) {
      return;
    }

    if (this.kfEditor.requestService('syntax.is.root.node', parentGroupInfo.id)) {
      this.selectAll();
      return;
    }

    let cursorInfo: CursorInfo;

    if (!this.kfEditor.requestService('syntax.is.virtual.node', parentGroupInfo.id)) {
      cursorInfo = {
        groupId: parentGroupInfo.id,
        startOffset: 0,
        endOffset: parentGroupInfo.content.length,
      };
    } else {
      const containerInfo = this.kfEditor.requestService('position.get.group.info', parentGroupInfo.groupObj) as {
        group: GroupContentInfo;
        index: number;
      };

      cursorInfo = {
        groupId: containerInfo.group.id,
        startOffset: containerInfo.index,
        endOffset: containerInfo.index + 1,
      };
    }

    this.kfEditor.requestService('syntax.update.record.cursor', cursorInfo);
    this.kfEditor.requestService('control.reselect');
    this.kfEditor.requestService('control.update.input');
  },

  selectAll(this: SelectionComponentInstance) {
    const rootGroupInfo = this.kfEditor.requestService('syntax.get.root.group.info') as GroupContentInfo;

    const cursorInfo = {
      groupId: rootGroupInfo.id,
      startOffset: 0,
      endOffset: rootGroupInfo.content.length,
    };

    this.kfEditor.requestService('syntax.update.record.cursor', cursorInfo);
    this.kfEditor.requestService('control.reselect');
    this.kfEditor.requestService('control.update.input');
  },

  getGroupInof(this: SelectionComponentInstance, offset: number, target: EventTarget | null) {
    let groupInfo = this.kfEditor.requestService('position.get.group', target) as GroupContentInfo | null;

    if (groupInfo === null) {
      groupInfo = this.kfEditor.requestService('syntax.get.root.group.info') as GroupContentInfo;
    }

    const index = this.kfEditor.requestService('position.get.location.info', offset, groupInfo) as number;

    return {
      groupInfo,
      offset: index,
    };
  },

  getIndex(this: SelectionComponentInstance, groupNode: Element & { id: string }, targetNode: EventTarget | null, offset: number) {
    let index = this.kfEditor.requestService('position.get.index', groupNode, targetNode) as number;
    const groupInfo = this.kfEditor.requestService('syntax.get.group.content', groupNode.id) as GroupContentInfo;
    const targetWrapNode = groupInfo.content[index];
    const targetRect = legacyBaseUtils.getRect(targetWrapNode);

    if (targetRect.left + targetRect.width / 2 < offset) {
      index += 1;
    }

    return index;
  },

  getCommunityGroup(this: SelectionComponentInstance, startGroupInfo: GroupContentInfo, endGroupInfo: GroupContentInfo) {
    let targetGroup = startGroupInfo.groupObj;
    let bigBoundingGroup: { group: GroupContentInfo; index: number } | null = null;

    while ((bigBoundingGroup = this.kfEditor.requestService('position.get.group.info', targetGroup) as { group: GroupContentInfo; index: number } | null)) {
      targetGroup = bigBoundingGroup.group.groupObj;

      if (legacyBaseUtils.contains(bigBoundingGroup.group.groupObj, endGroupInfo.groupObj)) {
        break;
      }
    }

    if (!bigBoundingGroup) {
      throw new Error('SelectionComponent: failed to find community group');
    }

    const groupNode = bigBoundingGroup.group.groupObj;

    return {
      group: bigBoundingGroup.group,
      startOffset: bigBoundingGroup.index,
      endOffset: this.kfEditor.requestService('position.get.index', groupNode, endGroupInfo.groupObj) as number,
    };
  },
});

export default SelectionComponent as new (parentComponent: unknown, kfEditor: LegacyEditorInstance) => SelectionComponentInstance;
