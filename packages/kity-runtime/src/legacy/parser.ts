import { createLegacyBaseComponent } from '../vendor/legacy-component';
import { legacyGroupType } from '../vendor/legacy-group-type';
import { legacySysconf } from '../vendor/legacy-sysconf';
import { getLegacyKf, getLegacyKity } from '../vendor/runtime-interop';
import extensionModule from './kf-ext-extension';
import legacyVirtualGroupMap from './vgroup-def';
import type { LegacyEditorInstance } from './editor';

type LegacyTreeNode = {
  name: string;
  operand: Array<LegacyTreeNode | string | null>;
  attr?: Record<string, any>;
  traversal?: string;
};

type ParserLike = {
  parse: (input: string) => {
    tree: LegacyTreeNode;
    [key: string]: unknown;
  };
  serialization: (tree: LegacyTreeNode) => string;
  expand: (config: unknown) => void;
};

type LegacyKfWithParser = ReturnType<typeof getLegacyKf> & {
  Parser: {
    use: (type: string) => ParserLike;
  };
};

type ParserComponentInstance = {
  kfEditor: LegacyEditorInstance;
  kfParser: ParserLike;
  pid: string;
  groupRecord: number;
  tree: LegacyTreeNode | null;
  isResetId: boolean;
  callBase: () => void;
  initServices: () => void;
  parse: (str: string, isResetId?: boolean) => {
    tree: LegacyTreeNode;
    [key: string]: unknown;
  };
  serialization: (tree: LegacyTreeNode) => string;
  getKFParser: () => ParserLike;
  initKFormulExtension: () => void;
  resetGroupId: () => void;
  getGroupId: () => string;
};

const CURSOR_CHAR = legacySysconf.cursorCharacter;
const ROOT_P_TEXT = legacySysconf.rootPlaceholder.content;
const COMBINATION_NAME = 'combination';
const PID_PREFIX = '_kf_editor_';

let pidSeed = 0;

const kity = getLegacyKity();
const kf = getLegacyKf() as LegacyKfWithParser;
const BaseComponent = createLegacyBaseComponent(kity as { createClass: (name: string, definition: object) => unknown });

function generateId() {
  pidSeed += 1;
  return `${PID_PREFIX}${pidSeed}`;
}

function isVirtualGroup(tree: LegacyTreeNode) {
  return !!legacyVirtualGroupMap[tree.name as keyof typeof legacyVirtualGroupMap];
}

function isPlaceholder(tree: LegacyTreeNode) {
  return tree.name === 'placeholder';
}

function onlyPlaceholder(operands: Array<LegacyTreeNode | string | null>) {
  let result = 1;

  if (operands.length > 3) {
    return false;
  }

  for (const operand of operands) {
    if (operand === CURSOR_CHAR) {
      continue;
    }

    if (operand && typeof operand !== 'string' && operand.name === 'placeholder') {
      result -= 1;
    }
  }

  return !result;
}

function createGroup(parser: ParserComponentInstance): LegacyTreeNode {
  return {
    name: COMBINATION_NAME,
    attr: {
      'data-type': legacyGroupType.GROUP,
      id: parser.getGroupId(),
    },
    operand: [],
  };
}

function processRootGroup(parser: ParserComponentInstance, tree: LegacyTreeNode) {
  if (!parser.isResetId) {
    tree.attr!['data-type'] = legacyGroupType.VIRTUAL;
  } else {
    tree.attr!['data-root'] = 'true';
  }
}

function processVirtualGroup(
  parser: ParserComponentInstance,
  index: number,
  tree: LegacyTreeNode,
  subtree: LegacyTreeNode | string | null,
) {
  if ((tree.name === 'brackets' && index < 2) || (tree.name === 'function' && index === 0)) {
    return;
  }

  tree.attr!['data-type'] = legacyGroupType.VIRTUAL;

  if (!subtree) {
    tree.operand[index] = subtree;
    return;
  }

  if (typeof subtree === 'string') {
    tree.operand[index] = createGroup(parser);
    (tree.operand[index] as LegacyTreeNode).operand[0] = subtree;
    return;
  }

  if (isPlaceholder(subtree)) {
    tree.operand[index] = createGroup(parser);
    (tree.operand[index] as LegacyTreeNode).operand[0] = supplementTree(parser, subtree, tree.operand[index] as LegacyTreeNode);
    return;
  }

  tree.operand[index] = supplementTree(parser, subtree, tree);
}

function processGroup(parser: ParserComponentInstance, index: number, tree: LegacyTreeNode, subtree: LegacyTreeNode | string | null) {
  tree.attr!['data-type'] = legacyGroupType.GROUP;

  if (!subtree || typeof subtree === 'string') {
    tree.operand[index] = subtree;
    return;
  }

  if (subtree.name === 'text') {
    tree.operand[index] = subtree;
    return;
  }

  tree.operand[index] = supplementTree(parser, subtree, tree);
}

function supplementTree(parser: ParserComponentInstance, tree: LegacyTreeNode, parentTree?: LegacyTreeNode) {
  const isRoot = !parentTree;

  tree.attr = tree.attr || {};
  tree.attr.id = parser.getGroupId();

  if (isRoot) {
    processRootGroup(parser, tree);
  } else if (parentTree?.attr?.['data-root'] && tree.name === 'placeholder' && onlyPlaceholder(parentTree.operand)) {
    tree.attr.label = ROOT_P_TEXT;
  }

  for (let i = 0; i < tree.operand.length; i += 1) {
    const currentOperand = tree.operand[i] as LegacyTreeNode | string | null;

    if (isVirtualGroup(tree)) {
      processVirtualGroup(parser, i, tree, currentOperand);
    } else {
      processGroup(parser, i, tree, currentOperand);
    }
  }

  return tree;
}

const Parser = kity.createClass('Parser', {
  base: BaseComponent,

  constructor(this: ParserComponentInstance, kfEditor: LegacyEditorInstance) {
    this.kfEditor = kfEditor;

    if (false) {
      this.callBase();
    }
    (BaseComponent as any).call(this);

    this.kfParser = kf.Parser.use('latex');
    this.initKFormulExtension();
    this.pid = generateId();
    this.groupRecord = 0;
    this.tree = null;
    this.isResetId = true;
    this.initServices();
  },

  parse(this: ParserComponentInstance, str: string, isResetId?: boolean) {
    this.isResetId = !!isResetId;

    if (this.isResetId) {
      this.resetGroupId();
    }

    const parsedResult = this.kfParser.parse(str);
    supplementTree(this, parsedResult.tree);

    return parsedResult;
  },

  serialization(this: ParserComponentInstance, tree: LegacyTreeNode) {
    return this.kfParser.serialization(tree);
  },

  initServices(this: ParserComponentInstance) {
    this.kfEditor.registerService('parser.parse', this, {
      parse: this.parse,
    });

    this.kfEditor.registerService('parser.latex.serialization', this, {
      serialization: this.serialization,
    });
  },

  getKFParser(this: ParserComponentInstance) {
    return this.kfParser;
  },

  initKFormulExtension(this: ParserComponentInstance) {
    extensionModule.ext(this);
  },

  resetGroupId(this: ParserComponentInstance) {
    this.groupRecord = 0;
  },

  getGroupId(this: ParserComponentInstance) {
    this.groupRecord += 1;
    return `${this.pid}_${this.groupRecord}`;
  },
});

export default Parser as new (kfEditor: LegacyEditorInstance) => ParserComponentInstance;
