import { legacyBaseUtils } from '../vendor/legacy-utils';
import { getLegacyKity } from '../vendor/runtime-interop';
import type { LegacyEditorInstance } from './editor';

type GroupNode = Element & { id: string };
type SvgLinkedNode = Element & { ownerSVGElement?: SVGElement | null };

type GroupContentInfo = {
  id: string;
  groupObj: GroupNode;
  content: GroupNode[];
};

type PositionComponentInstance = {
  kfEditor: LegacyEditorInstance;
  initServices: () => void;
  getGroupByTarget: (target: EventTarget | null) => GroupContentInfo | null;
  getIndexByTargetInGroup: (groupNode: GroupNode, targetNode: EventTarget | null) => number;
  getLocationInfo: (distance: number, groupInfo: GroupContentInfo) => number;
  getParentGroupByTarget: (target: EventTarget | null) => GroupContentInfo | null;
  getWrap: (node: EventTarget | null) => GroupNode | null;
  getAreaByCursorInGroup: (groupNode: Element, offset: number) => boolean;
  getGroupInfoByNode: (target: EventTarget | null) => { group: GroupContentInfo; index: number } | null;
  getParentInfoByNode: (target: GroupNode) => { group: GroupContentInfo; index: number };
};

const kity = getLegacyKity();

function getGroup(node: EventTarget | null, isAllowVirtual: boolean, isAllowWrap: boolean): GroupNode | null {
  const target = node as SvgLinkedNode | null;

  if (!target || !target.ownerSVGElement) {
    return null;
  }

  const parentNode = target.parentNode as Element | null;

  if (!parentNode) {
    return null;
  }

  const tagName = parentNode.tagName.toLowerCase();

  if (tagName === 'body' || tagName === 'svg') {
    return null;
  }

  if (parentNode.getAttribute('data-type') === 'kf-editor-group') {
    return parentNode as GroupNode;
  }

  if (isAllowVirtual && parentNode.getAttribute('data-type') === 'kf-editor-virtual-group') {
    return parentNode as GroupNode;
  }

  if (isAllowWrap && parentNode.getAttribute('data-flag') !== null) {
    return parentNode as GroupNode;
  }

  return getGroup(parentNode, isAllowVirtual, isAllowWrap);
}

const PositionComponent = kity.createClass('PositionComponenet', {
  constructor(this: PositionComponentInstance, kfEditor: LegacyEditorInstance) {
    this.kfEditor = kfEditor;
    this.initServices();
  },

  initServices(this: PositionComponentInstance) {
    this.kfEditor.registerService('position.get.group', this, {
      getGroupByTarget: this.getGroupByTarget,
    });

    this.kfEditor.registerService('position.get.index', this, {
      getIndexByTargetInGroup: this.getIndexByTargetInGroup,
    });

    this.kfEditor.registerService('position.get.location.info', this, {
      getLocationInfo: this.getLocationInfo,
    });

    this.kfEditor.registerService('position.get.parent.group', this, {
      getParentGroupByTarget: this.getParentGroupByTarget,
    });

    this.kfEditor.registerService('position.get.wrap', this, {
      getWrap: this.getWrap,
    });

    this.kfEditor.registerService('position.get.area', this, {
      getAreaByCursorInGroup: this.getAreaByCursorInGroup,
    });

    this.kfEditor.registerService('position.get.group.info', this, {
      getGroupInfoByNode: this.getGroupInfoByNode,
    });

    this.kfEditor.registerService('position.get.parent.info', this, {
      getParentInfoByNode: this.getParentInfoByNode,
    });
  },

  getGroupByTarget(this: PositionComponentInstance, target: EventTarget | null) {
    const groupDom = getGroup(target, false, false);

    if (!groupDom) {
      return null;
    }

    return this.kfEditor.requestService('syntax.get.group.content', groupDom.id) as GroupContentInfo;
  },

  getIndexByTargetInGroup(this: PositionComponentInstance, groupNode: GroupNode, targetNode: EventTarget | null) {
    const groupInfo = this.kfEditor.requestService('syntax.get.group.content', groupNode.id) as GroupContentInfo;
    let index = -1;

    kity.Utils.each(groupInfo.content, (child: GroupNode, i: number) => {
      index = i;

      if (legacyBaseUtils.contains(child, targetNode as Node)) {
        return false;
      }

      return undefined;
    });

    return index;
  },

  getAreaByCursorInGroup(this: PositionComponentInstance, groupNode: Element, offset: number) {
    const groupRect = legacyBaseUtils.getRect(groupNode);
    return groupRect.left + groupRect.width / 2 < offset;
  },

  getLocationInfo(this: PositionComponentInstance, distance: number, groupInfo: GroupContentInfo) {
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

  getParentGroupByTarget(this: PositionComponentInstance, target: EventTarget | null) {
    const groupDom = getGroup(target, true, false);

    if (!groupDom) {
      return null;
    }

    return this.kfEditor.requestService('syntax.get.group.content', groupDom.id) as GroupContentInfo;
  },

  getWrap(this: PositionComponentInstance, node: EventTarget | null) {
    return getGroup(node, true, true);
  },

  getGroupInfoByNode(this: PositionComponentInstance, target: EventTarget | null) {
    const containerNode = getGroup(target, false, false);

    if (!containerNode) {
      return null;
    }

    const containerInfo = this.kfEditor.requestService('syntax.get.group.content', containerNode.id) as GroupContentInfo;
    let index = 0;

    for (let i = 0, len = containerInfo.content.length; i < len; i += 1) {
      index = i;

      if (legacyBaseUtils.contains(containerInfo.content[i], target as Node)) {
        break;
      }
    }

    return {
      group: containerInfo,
      index,
    };
  },

  getParentInfoByNode(this: PositionComponentInstance, target: GroupNode) {
    const groupNode = getGroup(target, true, false);

    if (!groupNode) {
      throw new Error('PositionComponent: failed to resolve parent group');
    }

    const group = this.kfEditor.requestService('syntax.get.group.content', groupNode.id) as GroupContentInfo;

    return {
      group,
      index: group.content.indexOf(target),
    };
  },
});

export default PositionComponent as new (kfEditor: LegacyEditorInstance) => PositionComponentInstance;
