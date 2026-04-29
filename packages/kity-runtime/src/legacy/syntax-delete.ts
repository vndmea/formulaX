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

type TreeNode = {
  name: string;
  operand: Array<TreeNode | string>;
  attr?: Record<string, any>;
};

type SyntaxParent = {
  getCursorRecord: () => CursorState;
  getObjectTree: () => any;
  isRootTree: (tree: TreeNode) => boolean;
  updateCursor: (cursorInfo: CursorState) => void;
  isGroupNode: (groupId: string) => boolean;
  isSelectPlaceholder: () => boolean;
  isLeafTree: (tree: TreeNode | string) => boolean;
  getGroupObject: (id: string) => { node: Element & { id: string } } | null;
  isPlaceholder: (groupId: string) => boolean;
};

type DeleteComponentInstance = {
  parentComponent: SyntaxParent;
  kfEditor: LegacyEditorInstance;
  deleteGroup: () => boolean;
  deletePrevGroup: (tree: TreeNode, cursorInfo: CursorInfo) => CursorInfo;
  deleteSelection: (tree: TreeNode, cursorInfo: CursorInfo) => boolean;
  selectParentContainer: (groupId: string) => CursorInfo;
};

const kity = getLegacyKity();

const DeleteComponent = kity.createClass('DeleteComponent', {
  constructor(this: DeleteComponentInstance, parentComponent: SyntaxParent, kfEditor: LegacyEditorInstance) {
    this.parentComponent = parentComponent;
    this.kfEditor = kfEditor;
  },

  deleteGroup(this: DeleteComponentInstance) {
    let cursorInfo = this.parentComponent.getCursorRecord();
    const cursorGroupId = cursorInfo.groupId as string;
    const objTree = this.parentComponent.getObjectTree();
    const currentTree = objTree.mapping[cursorGroupId].strGroup as TreeNode;

    if (cursorInfo.startOffset === cursorInfo.endOffset) {
      if (cursorInfo.startOffset === 0) {
        if (this.parentComponent.isRootTree(currentTree)) {
          return false;
        }

        cursorInfo = this.selectParentContainer(cursorGroupId);
        this.parentComponent.updateCursor(cursorInfo);
        return false;
      }

      if (currentTree.operand.length > 1) {
        cursorInfo = this.deletePrevGroup(currentTree, cursorInfo as CursorInfo);
      } else {
        cursorInfo.startOffset = 0;
        cursorInfo.endOffset = 1;

        const operand0 = currentTree.operand[0] as TreeNode;

        if (operand0.attr && this.parentComponent.isGroupNode(operand0.attr.id)) {
          this.parentComponent.updateCursor(cursorInfo);
          return false;
        }

        currentTree.operand[0] = {
          name: 'placeholder',
          operand: [],
        };

        this.parentComponent.updateCursor(cursorInfo);
        return true;
      }
    } else if (this.parentComponent.isSelectPlaceholder()) {
      if (this.parentComponent.isRootTree(currentTree)) {
        return false;
      }

      cursorInfo = this.selectParentContainer(cursorGroupId);
      this.parentComponent.updateCursor(cursorInfo);
      return false;
    } else {
      return this.deleteSelection(currentTree, cursorInfo as CursorInfo);
    }

    this.parentComponent.updateCursor(cursorInfo);
    return cursorInfo.startOffset === cursorInfo.endOffset;
  },

  deletePrevGroup(this: DeleteComponentInstance, tree: TreeNode, cursorInfo: CursorInfo) {
    const index = cursorInfo.startOffset - 1;
    const group = tree.operand[index];

    if (this.parentComponent.isLeafTree(group)) {
      tree.operand.splice(index, 1);
      cursorInfo.startOffset -= 1;
      cursorInfo.endOffset -= 1;
    } else {
      cursorInfo.startOffset -= 1;
    }

    return cursorInfo;
  },

  deleteSelection(this: DeleteComponentInstance, tree: TreeNode, cursorInfo: CursorInfo) {
    if (cursorInfo.startOffset === 0 && cursorInfo.endOffset === tree.operand.length) {
      tree.operand.length = 1;
      tree.operand[0] = {
        name: 'placeholder',
        operand: [],
      };
      cursorInfo.endOffset = 1;
    } else {
      tree.operand.splice(cursorInfo.startOffset, cursorInfo.endOffset - cursorInfo.startOffset);
      cursorInfo.endOffset = cursorInfo.startOffset;
    }

    this.parentComponent.updateCursor(cursorInfo);
    return true;
  },

  selectParentContainer(this: DeleteComponentInstance, groupId: string) {
    const currentGroup = this.parentComponent.getGroupObject(groupId);

    if (!currentGroup) {
      throw new Error(`DeleteComponent: missing group object for ${groupId}`);
    }

    const currentGroupNode = currentGroup.node;
    const parentContainerInfo = this.kfEditor.requestService('position.get.group', currentGroupNode) as {
      id: string;
      groupObj: Element & { id: string };
    };
    const index = this.kfEditor.requestService('position.get.index', parentContainerInfo.groupObj, currentGroupNode) as number;

    return {
      groupId: parentContainerInfo.id,
      startOffset: index,
      endOffset: index + 1,
    };
  },
});

export default DeleteComponent as new (parentComponent: SyntaxParent, kfEditor: LegacyEditorInstance) => DeleteComponentInstance;
