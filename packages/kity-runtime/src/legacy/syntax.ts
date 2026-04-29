import { legacyGroupType } from '../vendor/legacy-group-type';
import { legacySysconf } from '../vendor/legacy-sysconf';
import { getLegacyKity } from '../vendor/runtime-interop';
import type { LegacyEditorInstance } from './editor';
import DeleteComponent from './syntax-delete';
import MoveComponent from './syntax-move';

type CursorRecord = {
  groupId: string | null;
  startOffset: number;
  endOffset: number;
};

type GroupNode = Element & { id: string };

type StringTree = {
  name?: string;
  attr?: Record<string, any>;
  traversal?: string;
  operand: Array<StringTree | string>;
};

type ObjectGroup = {
  node: GroupNode;
  operands: Array<{ node: GroupNode }>;
};

type ObjectTreeMappingEntry = {
  strGroup: StringTree;
  objGroup: ObjectGroup;
};

type ObjectTree = {
  mapping: Record<string, ObjectTreeMappingEntry> & {
    root: ObjectTreeMappingEntry;
  };
  parsedTree: StringTree;
  select?: {
    groupId: string;
    startOffset: number;
    endOffset: number;
  };
};

type GroupContentInfo = {
  id: string;
  traversal: string;
  groupObj: GroupNode;
  content: GroupNode[];
};

type SyntaxComponentInstance = {
  kfEditor: LegacyEditorInstance;
  record: {
    cursor: CursorRecord;
  };
  components: {
    move: InstanceType<typeof MoveComponent>;
    delete: InstanceType<typeof DeleteComponent>;
  };
  objTree: ObjectTree | null;
  initComponents: () => void;
  initServices: () => void;
  initCommands: () => void;
  updateObjTree: (objTree: ObjectTree) => void;
  hasCursorInfo: () => boolean;
  isRootNode: (groupId: string) => boolean;
  isGroupNode: (groupId: string) => boolean;
  isVirtualNode: (groupId: string) => boolean;
  isPlaceholder: (groupId: string) => boolean;
  isBrackets: (groupId: string) => boolean;
  hasRootplaceholder: () => boolean;
  isSelectPlaceholder: () => boolean;
  isLeafTree: (tree: StringTree | string) => boolean;
  isRootTree: (tree: StringTree) => boolean;
  getObjectTree: () => ObjectTree;
  getGroupObject: (id: string) => ObjectGroup | null;
  getCursorRecord: () => CursorRecord;
  getGroupContent: (groupId: string) => GroupContentInfo;
  getRootObject: () => ObjectGroup;
  getRootGroupInfo: () => GroupContentInfo;
  updateSelection: (group: GroupContentInfo) => { str: string; startOffset: number; endOffset: number };
  getSource: () => string;
  isEmpty: () => boolean;
  serialization: () => { str: string; startOffset: number; endOffset: number };
  updateCursor: (groupId: string | CursorRecord, startOffset?: number, endOffset?: number) => void;
  leftMove: () => void;
  rightMove: () => void;
  deleteGroup: () => boolean;
  insertSubtree: (subtree: StringTree) => void;
  replaceTree: (subtree: StringTree) => void;
};

const CURSOR_CHAR = legacySysconf.cursorCharacter;
const kity = getLegacyKity();

const SyntaxComponent = kity.createClass('SyntaxComponenet', {
  constructor(this: SyntaxComponentInstance, kfEditor: LegacyEditorInstance) {
    this.kfEditor = kfEditor;
    this.record = {
      cursor: {
        groupId: null,
        startOffset: -1,
        endOffset: -1,
      },
    };
    this.components = {} as SyntaxComponentInstance['components'];
    this.objTree = null;
    this.initComponents();
    this.initServices();
    this.initCommands();
  },

  initComponents(this: SyntaxComponentInstance) {
    this.components.move = new MoveComponent(this, this.kfEditor);
    this.components.delete = new DeleteComponent(this, this.kfEditor);
  },

  initServices(this: SyntaxComponentInstance) {
    this.kfEditor.registerService('syntax.update.objtree', this, { updateObjTree: this.updateObjTree });
    this.kfEditor.registerService('syntax.get.objtree', this, { getObjectTree: this.getObjectTree });
    this.kfEditor.registerService('syntax.get.group.object', this, { getGroupObject: this.getGroupObject });
    this.kfEditor.registerService('syntax.is.root.node', this, { isRootNode: this.isRootNode });
    this.kfEditor.registerService('syntax.is.group.node', this, { isGroupNode: this.isGroupNode });
    this.kfEditor.registerService('syntax.is.virtual.node', this, { isVirtualNode: this.isVirtualNode });
    this.kfEditor.registerService('syntax.is.placeholder.node', this, { isPlaceholder: this.isPlaceholder });
    this.kfEditor.registerService('syntax.is.select.placeholder', this, { isSelectPlaceholder: this.isSelectPlaceholder });
    this.kfEditor.registerService('syntax.has.root.placeholder', this, { hasRootplaceholder: this.hasRootplaceholder });
    this.kfEditor.registerService('syntax.valid.brackets', this, { isBrackets: this.isBrackets });
    this.kfEditor.registerService('syntax.get.group.content', this, { getGroupContent: this.getGroupContent });
    this.kfEditor.registerService('syntax.get.root.group.info', this, { getRootGroupInfo: this.getRootGroupInfo });
    this.kfEditor.registerService('syntax.get.root', this, { getRootObject: this.getRootObject });
    this.kfEditor.registerService('syntax.update.record.cursor', this, { updateCursor: this.updateCursor });
    this.kfEditor.registerService('syntax.update.selection', this, { updateSelection: this.updateSelection });
    this.kfEditor.registerService('syntax.get.record.cursor', this, { getCursorRecord: this.getCursorRecord });
    this.kfEditor.registerService('syntax.has.cursor.info', this, { hasCursorInfo: this.hasCursorInfo });
    this.kfEditor.registerService('syntax.serialization', this, { serialization: this.serialization });
    this.kfEditor.registerService('syntax.cursor.move.left', this, { leftMove: this.leftMove });
    this.kfEditor.registerService('syntax.cursor.move.right', this, { rightMove: this.rightMove });
    this.kfEditor.registerService('syntax.delete.group', this, { deleteGroup: this.deleteGroup });
  },

  initCommands(this: SyntaxComponentInstance) {
    this.kfEditor.registerCommand('get.source', this, this.getSource);
    this.kfEditor.registerCommand('content.is.empty', this, this.isEmpty);
  },

  updateObjTree(this: SyntaxComponentInstance, objTree: ObjectTree) {
    const selectInfo = objTree.select;

    if (selectInfo?.groupId) {
      this.updateCursor(selectInfo.groupId, selectInfo.startOffset, selectInfo.endOffset);
    }

    this.objTree = objTree;
  },

  hasCursorInfo(this: SyntaxComponentInstance) {
    return this.record.cursor.groupId !== null;
  },

  isRootNode(this: SyntaxComponentInstance, groupId: string) {
    return this.objTree!.mapping.root.strGroup.attr!.id === groupId;
  },

  isGroupNode(this: SyntaxComponentInstance, groupId: string) {
    const type = this.objTree!.mapping[groupId].strGroup.attr!['data-type'];
    return type === legacyGroupType.GROUP || type === legacyGroupType.VIRTUAL;
  },

  isVirtualNode(this: SyntaxComponentInstance, groupId: string) {
    return this.objTree!.mapping[groupId].strGroup.attr!['data-type'] === legacyGroupType.VIRTUAL;
  },

  isPlaceholder(this: SyntaxComponentInstance, groupId: string) {
    const currentNode = this.objTree!.mapping[groupId];

    if (!currentNode) {
      return false;
    }

    return currentNode.objGroup.node.getAttribute('data-flag') === 'Placeholder';
  },

  isBrackets(this: SyntaxComponentInstance, groupId: string) {
    return !!this.objTree!.mapping[groupId].objGroup.node.getAttribute('data-brackets');
  },

  hasRootplaceholder(this: SyntaxComponentInstance) {
    return (this.objTree!.mapping.root.strGroup.operand[0] as StringTree).name === 'placeholder';
  },

  isSelectPlaceholder(this: SyntaxComponentInstance) {
    const cursorInfo = this.record.cursor;

    if (cursorInfo.endOffset - cursorInfo.startOffset !== 1 || !cursorInfo.groupId) {
      return false;
    }

    const groupInfo = this.getGroupContent(cursorInfo.groupId);
    return this.isPlaceholder(groupInfo.content[cursorInfo.startOffset].id);
  },

  isLeafTree(this: SyntaxComponentInstance, tree: StringTree | string) {
    return typeof tree === 'string';
  },

  isRootTree(this: SyntaxComponentInstance, tree: StringTree) {
    return !!tree.attr?.['data-root'];
  },

  getObjectTree(this: SyntaxComponentInstance) {
    return this.objTree!;
  },

  getGroupObject(this: SyntaxComponentInstance, id: string) {
    return this.objTree!.mapping[id].objGroup || null;
  },

  getCursorRecord(this: SyntaxComponentInstance) {
    return kity.Utils.extend({}, this.record.cursor) as CursorRecord;
  },

  getGroupContent(this: SyntaxComponentInstance, groupId: string) {
    const groupInfo = this.objTree!.mapping[groupId];
    const operands = groupInfo.objGroup.operands;
    const offset = operands.length - 1;
    const isLtr = groupInfo.strGroup.traversal !== 'rtl';
    const content: GroupNode[] = [];

    kity.Utils.each(operands, (operand: { node: GroupNode }, i: number) => {
      if (isLtr) {
        content.push(operand.node);
      } else {
        content[offset - i] = operand.node;
      }
    });

    return {
      id: groupId,
      traversal: groupInfo.strGroup.traversal || 'ltr',
      groupObj: groupInfo.objGroup.node,
      content,
    };
  },

  getRootObject(this: SyntaxComponentInstance) {
    return this.objTree!.mapping.root.objGroup;
  },

  getRootGroupInfo(this: SyntaxComponentInstance) {
    const rootGroupId = this.objTree!.mapping.root.strGroup.attr!.id as string;
    return this.getGroupContent(rootGroupId);
  },

  updateSelection(this: SyntaxComponentInstance, group: GroupContentInfo) {
    let groupObj = this.objTree!.mapping[group.id];
    let curStrGroup = groupObj.strGroup;
    let parentGroup = group;
    let parentGroupObj = groupObj;

    if (curStrGroup.name === 'combination') {
      this.record.cursor = {
        groupId: parentGroup.id,
        startOffset: 0,
        endOffset: curStrGroup.operand.length,
      };

      curStrGroup.operand.unshift(CURSOR_CHAR);
      curStrGroup.operand.push(CURSOR_CHAR);
    } else {
      while (parentGroupObj.strGroup.name !== 'combination' || (parentGroup as any).content === 1) {
        group = parentGroup;
        groupObj = parentGroupObj;
        parentGroup = this.kfEditor.requestService('position.get.parent.group', groupObj.objGroup.node) as GroupContentInfo;
        parentGroupObj = this.objTree!.mapping[parentGroup.id];
      }

      const parentIndex = parentGroup.content.indexOf(group.groupObj);

      this.record.cursor = {
        groupId: parentGroup.id,
        startOffset: parentIndex,
        endOffset: parentIndex + 1,
      };

      parentGroupObj.strGroup.operand.splice(parentIndex + 1, 0, CURSOR_CHAR);
      parentGroupObj.strGroup.operand.splice(parentIndex, 0, CURSOR_CHAR);
    }

    let resultStr = this.kfEditor.requestService('parser.latex.serialization', this.objTree!.parsedTree) as string;
    const startOffset = resultStr.indexOf(CURSOR_CHAR);
    resultStr = resultStr.replace(CURSOR_CHAR, '');
    const endOffset = resultStr.indexOf(CURSOR_CHAR);

    parentGroupObj.strGroup.operand.splice(this.record.cursor.startOffset, 1);
    parentGroupObj.strGroup.operand.splice(this.record.cursor.endOffset, 1);

    return { str: resultStr, startOffset, endOffset };
  },

  getSource(this: SyntaxComponentInstance) {
    return this.serialization().str.replace(CURSOR_CHAR, '').replace(CURSOR_CHAR, '');
  },

  isEmpty(this: SyntaxComponentInstance) {
    return this.hasRootplaceholder();
  },

  serialization(this: SyntaxComponentInstance) {
    const cursor = this.record.cursor;
    const objGroup = this.objTree!.mapping[cursor.groupId as string];
    const curStrGroup = objGroup.strGroup;
    let strStartIndex = Math.min(cursor.endOffset, cursor.startOffset);
    let strEndIndex = Math.max(cursor.endOffset, cursor.startOffset);

    curStrGroup.operand.splice(strEndIndex, 0, CURSOR_CHAR);
    curStrGroup.operand.splice(strStartIndex, 0, CURSOR_CHAR);
    strEndIndex += 1;

    let resultStr = this.kfEditor.requestService('parser.latex.serialization', this.objTree!.parsedTree) as string;

    curStrGroup.operand.splice(strEndIndex, 1);
    curStrGroup.operand.splice(strStartIndex, 1);

    strStartIndex = resultStr.indexOf(CURSOR_CHAR);

    if (cursor.startOffset === cursor.endOffset) {
      resultStr = resultStr.replace(CURSOR_CHAR, '');
    }

    strEndIndex = resultStr.lastIndexOf(CURSOR_CHAR);

    return {
      str: resultStr,
      startOffset: strStartIndex,
      endOffset: strEndIndex,
    };
  },

  updateCursor(this: SyntaxComponentInstance, groupId: string | CursorRecord, startOffset?: number, endOffset?: number) {
    if (arguments.length === 1) {
      endOffset = (groupId as CursorRecord).endOffset;
      startOffset = (groupId as CursorRecord).startOffset;
      groupId = (groupId as CursorRecord).groupId as string;
    }

    if (endOffset === undefined) {
      endOffset = startOffset;
    }

    if ((startOffset as number) > (endOffset as number)) {
      const tmp = endOffset as number;
      endOffset = startOffset as number;
      startOffset = tmp;
    }

    this.record.cursor = {
      groupId: groupId as string,
      startOffset: startOffset as number,
      endOffset: endOffset as number,
    };
  },

  leftMove(this: SyntaxComponentInstance) {
    this.components.move.leftMove();
  },

  rightMove(this: SyntaxComponentInstance) {
    this.components.move.rightMove();
  },

  deleteGroup(this: SyntaxComponentInstance) {
    return this.components.delete.deleteGroup();
  },

  insertSubtree(this: SyntaxComponentInstance, subtree: StringTree) {
    const cursorInfo = this.record.cursor;

    if (this.isPlaceholder(cursorInfo.groupId as string)) {
      this.replaceTree(subtree);
      return;
    }

    const startOffset = Math.min(cursorInfo.startOffset, cursorInfo.endOffset);
    const endOffset = Math.max(cursorInfo.startOffset, cursorInfo.endOffset);
    const diff = endOffset - startOffset;
    const currentTree = this.objTree!.mapping[cursorInfo.groupId as string].strGroup;

    currentTree.operand.splice(startOffset, diff, subtree);
    cursorInfo.startOffset += 1;
    cursorInfo.endOffset = cursorInfo.startOffset;
  },

  replaceTree(this: SyntaxComponentInstance, subtree: StringTree) {
    const cursorInfo = this.record.cursor;
    const groupNode = this.objTree!.mapping[cursorInfo.groupId as string].objGroup.node;
    const parentInfo = this.kfEditor.requestService('position.get.parent.info', groupNode) as { group: GroupContentInfo; index: number };
    const currentTree = this.objTree!.mapping[parentInfo.group.id].strGroup;

    currentTree.operand[parentInfo.index] = subtree;
    cursorInfo.groupId = parentInfo.group.id;
    cursorInfo.startOffset = parentInfo.index + 1;
    cursorInfo.endOffset = parentInfo.index + 1;
  },
});

export default SyntaxComponent as new (kfEditor: LegacyEditorInstance) => SyntaxComponentInstance;
