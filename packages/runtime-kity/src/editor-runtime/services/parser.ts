import { createKityBaseComponent } from '../../kity-compat/base-component';
import { kityGroupType } from '../../kity-compat/group-type';
import { kitySystemConfig } from '../../kity-compat/system-config';
import { getKityFormulaRuntime, getKityGraphicsRuntime } from '../../kity-compat/runtime-context';
import extensionModule from '../extensions/formula-extension';
import kityVirtualGroupMap from '../config/virtual-group-map';
import type { KityRuntimeEditorInstance } from './editor';

type KityFormulaTreeNode = {
  name: string;
  operand: Array<KityFormulaTreeNode | string | null>;
  attr?: Record<string, any>;
  traversal?: string;
};

type ParserLike = {
  parse: (input: string) => {
    tree: KityFormulaTreeNode;
    [key: string]: unknown;
  };
  serialization: (tree: KityFormulaTreeNode) => string;
  expand: (config: unknown) => void;
};

type KityFormulaParserRuntime = ReturnType<typeof getKityFormulaRuntime> & {
  Parser: {
    use: (type: string) => ParserLike;
  };
};

type ParserComponentInstance = {
  kfEditor: KityRuntimeEditorInstance;
  kfParser: ParserLike;
  pid: string;
  groupRecord: number;
  tree: KityFormulaTreeNode | null;
  isResetId: boolean;
  callBase: () => void;
  initServices: () => void;
  parse: (str: string, isResetId?: boolean) => {
    tree: KityFormulaTreeNode;
    [key: string]: unknown;
  };
  serialization: (tree: KityFormulaTreeNode) => string;
  getKFParser: () => ParserLike;
  initKFormulExtension: () => void;
  resetGroupId: () => void;
  getGroupId: () => string;
};

const CURSOR_CHAR = kitySystemConfig.cursorCharacter;
const COMBINATION_NAME = 'combination';
const PID_PREFIX = '_kf_editor_';

let pidSeed = 0;

const kity = getKityGraphicsRuntime();
const kf = getKityFormulaRuntime() as KityFormulaParserRuntime;
const BaseComponent = createKityBaseComponent(kity as { createClass: (name: string, definition: object) => unknown });

function generateId() {
  pidSeed += 1;
  return `${PID_PREFIX}${pidSeed}`;
}

function isVirtualGroup(tree: KityFormulaTreeNode) {
  return !!kityVirtualGroupMap[tree.name as keyof typeof kityVirtualGroupMap];
}

function isPlaceholder(tree: KityFormulaTreeNode) {
  return tree.name === 'placeholder';
}

function onlyPlaceholder(operands: Array<KityFormulaTreeNode | string | null>) {
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

function createGroup(parser: ParserComponentInstance): KityFormulaTreeNode {
  return {
    name: COMBINATION_NAME,
    attr: {
      'data-type': kityGroupType.GROUP,
      id: parser.getGroupId(),
    },
    operand: [],
  };
}

function getRootPlaceholderText() {
  return kitySystemConfig.rootPlaceholder.content;
}

function processRootGroup(parser: ParserComponentInstance, tree: KityFormulaTreeNode) {
  if (!parser.isResetId) {
    tree.attr!['data-type'] = kityGroupType.VIRTUAL;
  } else {
    tree.attr!['data-root'] = 'true';
  }
}

function processVirtualGroup(
  parser: ParserComponentInstance,
  index: number,
  tree: KityFormulaTreeNode,
  subtree: KityFormulaTreeNode | string | null,
) {
  if ((tree.name === 'brackets' && index < 2) || (tree.name === 'function' && index === 0)) {
    return;
  }

  tree.attr!['data-type'] = kityGroupType.VIRTUAL;

  if (!subtree) {
    tree.operand[index] = subtree;
    return;
  }

  if (typeof subtree === 'string') {
    tree.operand[index] = createGroup(parser);
    (tree.operand[index] as KityFormulaTreeNode).operand[0] = subtree;
    return;
  }

  if (isPlaceholder(subtree)) {
    tree.operand[index] = createGroup(parser);
    (tree.operand[index] as KityFormulaTreeNode).operand[0] = supplementTree(parser, subtree, tree.operand[index] as KityFormulaTreeNode);
    return;
  }

  tree.operand[index] = supplementTree(parser, subtree, tree);
}

function processGroup(parser: ParserComponentInstance, index: number, tree: KityFormulaTreeNode, subtree: KityFormulaTreeNode | string | null) {
  tree.attr!['data-type'] = kityGroupType.GROUP;

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

function supplementTree(parser: ParserComponentInstance, tree: KityFormulaTreeNode, parentTree?: KityFormulaTreeNode) {
  const isRoot = !parentTree;

  tree.attr = tree.attr || {};
  tree.attr.id = parser.getGroupId();

  if (isRoot) {
    processRootGroup(parser, tree);
  } else if (parentTree?.attr?.['data-root'] && tree.name === 'placeholder' && onlyPlaceholder(parentTree.operand)) {
    tree.attr.label = getRootPlaceholderText();
  }

  for (let i = 0; i < tree.operand.length; i += 1) {
    const currentOperand = tree.operand[i] as KityFormulaTreeNode | string | null;

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

  constructor(this: ParserComponentInstance, kfEditor: KityRuntimeEditorInstance) {
    this.kfEditor = kfEditor;

    if ((this as any).__formulaxNeverCallBase__) {
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

  serialization(this: ParserComponentInstance, tree: KityFormulaTreeNode) {
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

export default Parser as new (kfEditor: KityRuntimeEditorInstance) => ParserComponentInstance;
