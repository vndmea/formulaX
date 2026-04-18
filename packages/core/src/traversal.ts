import type { FormulaDoc, FormulaNode, FormulaPath } from './ast';

type ContainerKey = 'body' | 'numerator' | 'denominator' | 'base' | 'sup' | 'sub' | 'value';

const resolveContainer = (node: FormulaNode, branch: number): FormulaNode[] => {
  switch (node.type) {
    case 'doc':
    case 'group':
      if (branch !== 0) throw new Error('Invalid branch');
      return node.body;
    case 'frac':
      if (branch === 0) return node.numerator;
      if (branch === 1) return node.denominator;
      break;
    case 'supsub':
      if (branch === 0) return node.base;
      if (branch === 1) return node.sup ?? (node.sup = []);
      if (branch === 2) return node.sub ?? (node.sub = []);
      break;
    case 'sqrt':
      if (branch !== 0) throw new Error('Invalid branch');
      return node.value;
    case 'fenced':
      if (branch !== 0) throw new Error('Invalid branch');
      return node.body;
    default:
      break;
  }
  throw new Error('Invalid branch');
};

export const cloneNode = <T extends FormulaNode>(node: T): T => structuredClone(node);

export const cloneDoc = (node: FormulaDoc): FormulaDoc => structuredClone(node);

export interface ResolvedParent {
  container: FormulaNode[];
  index: number;
}

export const resolveParent = (root: FormulaDoc, path: FormulaPath): ResolvedParent => {
  if (path.length === 0) {
    return { container: root.body, index: root.body.length };
  }

  if (path.length === 1) {
    return { container: root.body, index: path[0] };
  }

  let current = root.body[path[0]];
  if (!current) {
    return { container: root.body, index: path[0] };
  }

  let container = root.body;

  for (let i = 1; i < path.length - 2; i += 2) {
    const branch = path[i];
    const index = path[i + 1];
    container = resolveContainer(current, branch);
    current = container[index];
  }

  container = resolveContainer(current, path[path.length - 2]);

  return {
    container,
    index: path[path.length - 1] ?? container.length,
  };
};

export const insertAtPath = (root: FormulaDoc, path: FormulaPath, node: FormulaNode): FormulaDoc => {
  const next = cloneDoc(root);
  const { container, index } = resolveParent(next, path);
  container.splice(index, 0, node);
  return next;
};

export const removeAtPath = (root: FormulaDoc, path: FormulaPath): FormulaDoc => {
  const next = cloneDoc(root);
  const { container, index } = resolveParent(next, path);
  if (index > 0) {
    container.splice(index - 1, 1);
  }
  return next;
};

export const getNodeAtPath = (root: FormulaDoc, path: FormulaPath): FormulaNode | null => {
  if (path.length === 0) return root;
  if (path.length === 1) return root.body[path[0]] ?? null;

  let current = root.body[path[0]];
  if (!current) return null;

  for (let i = 1; i < path.length; i += 2) {
    const branch = path[i];
    const index = path[i + 1];
    const container = resolveContainer(current, branch);
    current = container[index];
    if (!current) {
      return null;
    }
  }

  return current;
};

export const containerKeyForBranch = (node: FormulaNode, branch: number): ContainerKey => {
  switch (node.type) {
    case 'doc':
    case 'group':
      return 'body';
    case 'frac':
      return branch === 0 ? 'numerator' : 'denominator';
    case 'supsub':
      return branch === 0 ? 'base' : branch === 1 ? 'sup' : 'sub';
    case 'sqrt':
      return 'value';
    case 'fenced':
      return 'body';
    default:
      return 'body';
  }
};
