import { getLegacyKity } from '../vendor/runtime-interop';
import type { LegacyEditorInstance } from './editor';

type CursorInfo = {
  groupId: string;
  startOffset: number;
  endOffset: number;
};

type CursorState = {
  groupId: string | null;
  startOffset: number;
  endOffset: number;
};

type GroupInfo = {
  id: string;
  groupObj: Element & { id: string };
  content: Array<Element & { id: string }>;
};

type ParentInfo = {
  group: GroupInfo;
  index: number;
};

type SyntaxParent = {
  getCursorRecord: () => CursorState;
  updateCursor: (cursorInfo: CursorState) => void;
  getGroupContent: (groupId: string) => GroupInfo;
  isSelectPlaceholder: () => boolean;
  isPlaceholder: (groupId: string) => boolean;
};

type MoveComponentInstance = {
  parentComponent: SyntaxParent;
  kfEditor: LegacyEditorInstance;
  leftMove: () => void;
  rightMove: () => void;
};

const kity = getLegacyKity();

function isRootNode(node: Element) {
  return !!node.getAttribute('data-root');
}

function isContainerNode(node: Element) {
  return node.getAttribute('data-type') === 'kf-editor-group';
}

function isGroupNode(node: Element) {
  const dataType = node.getAttribute('data-type');
  return dataType === 'kf-editor-group' || dataType === 'kf-editor-virtual-group';
}

function isPlaceholderNode(node: Element) {
  return node.getAttribute('data-flag') === 'Placeholder';
}

function isEmptyNode(node: Element) {
  return node.getAttribute('data-flag') === 'Empty';
}

function locateLeftIndex(moveComponent: MoveComponentInstance, groupNode: Element & { id: string }): CursorInfo | null {
  const syntaxComponent = moveComponent.parentComponent;

  if (isPlaceholderNode(groupNode) || isEmptyNode(groupNode)) {
    return locateOuterLeftIndex(moveComponent, groupNode);
  }

  if (!isGroupNode(groupNode)) {
    return null;
  }

  let groupInfo = syntaxComponent.getGroupContent(groupNode.id);
  let groupElement = groupInfo.content[groupInfo.content.length - 1];

  if (isEmptyNode(groupElement)) {
    return locateOuterLeftIndex(moveComponent, groupElement);
  }

  if (isContainerNode(groupNode)) {
    if (isPlaceholderNode(groupElement)) {
      return {
        groupId: groupNode.id,
        startOffset: groupInfo.content.length - 1,
        endOffset: groupInfo.content.length,
      };
    }

    if (isContainerNode(groupElement) && groupInfo.content.length === 1) {
      return locateLeftIndex(moveComponent, groupElement);
    }

    return {
      groupId: groupNode.id,
      startOffset: groupInfo.content.length,
      endOffset: groupInfo.content.length,
    };
  }

  while (!isContainerNode(groupElement) && !isEmptyNode(groupElement) && !isPlaceholderNode(groupElement)) {
    groupInfo = syntaxComponent.getGroupContent(groupElement.id);
    groupElement = groupInfo.content[groupInfo.content.length - 1];
  }

  if (isEmptyNode(groupElement)) {
    return locateOuterLeftIndex(moveComponent, groupElement);
  }

  if (isPlaceholderNode(groupElement)) {
    return {
      groupId: groupElement.id,
      startOffset: groupInfo.content.length,
      endOffset: groupInfo.content.length,
    };
  }

  return locateLeftIndex(moveComponent, groupElement);
}

function locateOuterLeftIndex(moveComponent: MoveComponentInstance, groupNode: Element & { id: string }): CursorInfo | null {
  const kfEditor = moveComponent.kfEditor;
  let outerGroupInfo = kfEditor.requestService('position.get.parent.info', groupNode) as ParentInfo;

  if (isRootNode(groupNode)) {
    return null;
  }

  while (outerGroupInfo.index === 0) {
    if (isRootNode(outerGroupInfo.group.groupObj)) {
      return {
        groupId: outerGroupInfo.group.id,
        startOffset: 0,
        endOffset: 0,
      };
    }

    if (isContainerNode(outerGroupInfo.group.groupObj) && outerGroupInfo.group.content.length > 1) {
      return {
        groupId: outerGroupInfo.group.id,
        startOffset: 0,
        endOffset: 0,
      };
    }

    outerGroupInfo = kfEditor.requestService('position.get.parent.info', outerGroupInfo.group.groupObj) as ParentInfo;
  }

  groupNode = outerGroupInfo.group.content[outerGroupInfo.index - 1];

  if (isGroupNode(groupNode)) {
    return locateLeftIndex(moveComponent, groupNode);
  }

  if (isEmptyNode(groupNode)) {
    return locateOuterLeftIndex(moveComponent, groupNode);
  }

  return {
    groupId: outerGroupInfo.group.id,
    startOffset: outerGroupInfo.index,
    endOffset: outerGroupInfo.index,
  };
}

function locateRightIndex(moveComponent: MoveComponentInstance, groupNode: Element & { id: string }): CursorInfo | null {
  const syntaxComponent = moveComponent.parentComponent;

  if (!isGroupNode(groupNode)) {
    return null;
  }

  let groupInfo = syntaxComponent.getGroupContent(groupNode.id);
  let groupElement = groupInfo.content[0];

  if (isContainerNode(groupNode)) {
    if (isContainerNode(groupElement)) {
      return locateRightIndex(moveComponent, groupElement);
    }

    if (isPlaceholderNode(groupElement)) {
      return {
        groupId: groupNode.id,
        startOffset: 0,
        endOffset: 1,
      };
    }

    return {
      groupId: groupNode.id,
      startOffset: 0,
      endOffset: 0,
    };
  }

  while (!isContainerNode(groupElement) && !isPlaceholderNode(groupElement) && !isEmptyNode(groupElement)) {
    groupInfo = syntaxComponent.getGroupContent(groupElement.id);
    groupElement = groupInfo.content[0];
  }

  if (isPlaceholderNode(groupElement)) {
    return {
      groupId: groupElement.id,
      startOffset: 0,
      endOffset: 0,
    };
  }

  if (isEmptyNode(groupElement)) {
    return locateOuterRightIndex(moveComponent, groupElement);
  }

  return locateRightIndex(moveComponent, groupElement);
}

function locateOuterRightIndex(moveComponent: MoveComponentInstance, groupNode: Element & { id: string }): CursorInfo | null {
  const kfEditor = moveComponent.kfEditor;
  const syntaxComponent = moveComponent.parentComponent;

  if (isRootNode(groupNode)) {
    return null;
  }

  let outerGroupInfo = kfEditor.requestService('position.get.parent.info', groupNode) as ParentInfo;

  while (outerGroupInfo.index === outerGroupInfo.group.content.length - 1) {
    if (isRootNode(outerGroupInfo.group.groupObj)) {
      return {
        groupId: outerGroupInfo.group.id,
        startOffset: outerGroupInfo.group.content.length,
        endOffset: outerGroupInfo.group.content.length,
      };
    }

    if (isContainerNode(outerGroupInfo.group.groupObj) && outerGroupInfo.group.content.length > 1) {
      return {
        groupId: outerGroupInfo.group.id,
        startOffset: outerGroupInfo.group.content.length,
        endOffset: outerGroupInfo.group.content.length,
      };
    }

    outerGroupInfo = kfEditor.requestService('position.get.parent.info', outerGroupInfo.group.groupObj) as ParentInfo;
  }

  groupNode = outerGroupInfo.group.content[outerGroupInfo.index + 1];

  if (isEmptyNode(groupNode)) {
    return locateOuterRightIndex(moveComponent, groupNode);
  }

  if (isContainerNode(groupNode)) {
    const groupInfo = syntaxComponent.getGroupContent(groupNode.id);

    if (syntaxComponent.isPlaceholder(groupInfo.content[0].id)) {
      return {
        groupId: groupNode.id,
        startOffset: 0,
        endOffset: 1,
      };
    }

    return {
      groupId: groupNode.id,
      startOffset: 0,
      endOffset: 0,
    };
  }

  return {
    groupId: outerGroupInfo.group.id,
    startOffset: outerGroupInfo.index + 1,
    endOffset: outerGroupInfo.index + 1,
  };
}

function updateCursorGoLeft(moveComponent: MoveComponentInstance, cursorInfo: CursorInfo) {
  const syntaxComponent = moveComponent.parentComponent;
  const containerInfo = syntaxComponent.getGroupContent(cursorInfo.groupId);

  if (syntaxComponent.isSelectPlaceholder()) {
    return locateOuterLeftIndex(moveComponent, containerInfo.content[cursorInfo.startOffset]);
  }

  if (cursorInfo.startOffset === cursorInfo.endOffset) {
    if (cursorInfo.startOffset > 0) {
      const prevGroupNode = containerInfo.content[cursorInfo.startOffset - 1];

      if (isGroupNode(prevGroupNode)) {
        return locateLeftIndex(moveComponent, prevGroupNode);
      }

      cursorInfo.startOffset -= 1;

      if (!isPlaceholderNode(prevGroupNode)) {
        cursorInfo.endOffset = cursorInfo.startOffset;
      }

      return cursorInfo;
    }

    return locateOuterLeftIndex(moveComponent, containerInfo.groupObj);
  }

  cursorInfo.startOffset = Math.min(cursorInfo.startOffset, cursorInfo.endOffset);
  cursorInfo.endOffset = cursorInfo.startOffset;
  return cursorInfo;
}

function updateCursorGoRight(moveComponent: MoveComponentInstance, cursorInfo: CursorInfo) {
  const syntaxComponent = moveComponent.parentComponent;
  const containerInfo = syntaxComponent.getGroupContent(cursorInfo.groupId);

  if (syntaxComponent.isSelectPlaceholder()) {
    return locateOuterRightIndex(moveComponent, containerInfo.content[cursorInfo.startOffset]);
  }

  if (cursorInfo.startOffset === cursorInfo.endOffset) {
    if (cursorInfo.startOffset < containerInfo.content.length) {
      const nextGroupNode = containerInfo.content[cursorInfo.startOffset];

      if (isGroupNode(nextGroupNode)) {
        return locateRightIndex(moveComponent, nextGroupNode);
      }

      cursorInfo.startOffset += 1;

      if (!isPlaceholderNode(nextGroupNode)) {
        cursorInfo.endOffset = cursorInfo.startOffset;
      }

      return cursorInfo;
    }

    return locateOuterRightIndex(moveComponent, containerInfo.groupObj);
  }

  cursorInfo.endOffset = Math.max(cursorInfo.startOffset, cursorInfo.endOffset);
  cursorInfo.startOffset = cursorInfo.endOffset;
  return cursorInfo;
}

const MoveComponent = kity.createClass('MoveComponent', {
  constructor(this: MoveComponentInstance, parentComponent: SyntaxParent, kfEditor: LegacyEditorInstance) {
    this.parentComponent = parentComponent;
    this.kfEditor = kfEditor;
  },

  leftMove(this: MoveComponentInstance) {
    let cursorInfo = this.parentComponent.getCursorRecord();
    cursorInfo = updateCursorGoLeft(this, cursorInfo as CursorInfo) as CursorState;

    if (cursorInfo) {
      this.parentComponent.updateCursor(cursorInfo);
    }
  },

  rightMove(this: MoveComponentInstance) {
    let cursorInfo = this.parentComponent.getCursorRecord();
    cursorInfo = updateCursorGoRight(this, cursorInfo as CursorInfo) as CursorState;

    if (cursorInfo) {
      this.parentComponent.updateCursor(cursorInfo);
    }
  },
});

export default MoveComponent as new (parentComponent: SyntaxParent, kfEditor: LegacyEditorInstance) => MoveComponentInstance;
