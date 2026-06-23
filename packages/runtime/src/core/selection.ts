import type {
  FormulaDoc,
  FormulaNode,
  FormulaRowNode,
  FormulaSelection,
  FormulaScriptNode,
} from './types';

export function createSelection(rowId: string, offset = 0): FormulaSelection {
  return { rowId, offset };
}

export function clampSelection(doc: FormulaDoc, selection: FormulaSelection): FormulaSelection {
  const row = findRowById(doc, selection.rowId) ?? doc.root;
  return {
    rowId: row.id,
    offset: Math.max(0, Math.min(selection.offset, row.children.length)),
  };
}

export function getInitialSelection(doc: FormulaDoc): FormulaSelection {
  return createSelection(doc.root.id, doc.root.children.length);
}

export function findRowById(doc: FormulaDoc, rowId: string): FormulaRowNode | null {
  return findRowInNode(doc.root, rowId);
}

function findRowInNode(node: FormulaNode, rowId: string): FormulaRowNode | null {
  if (node.type === 'row') {
    if (node.id === rowId) {
      return node;
    }
    for (const child of node.children) {
      const found = findRowInNode(child, rowId);
      if (found) {
        return found;
      }
    }
    return null;
  }

  if (node.type === 'frac') {
    return findRowInNode(node.numerator, rowId) ?? findRowInNode(node.denominator, rowId);
  }

  if (node.type === 'sqrt') {
    return findRowInNode(node.value, rowId);
  }

  if (node.type === 'script') {
    return findRowInScript(node, rowId);
  }

  if (node.type === 'fence') {
    return findRowInNode(node.body, rowId);
  }

  if (node.type === 'matrix') {
    for (const rowGroup of node.rows) {
      for (const row of rowGroup) {
        const found = findRowInNode(row, rowId);
        if (found) {
          return found;
        }
      }
    }
  }

  return null;
}

function findRowInScript(node: FormulaScriptNode, rowId: string): FormulaRowNode | null {
  return findRowInNode(node.base, rowId)
    ?? (node.sup ? findRowInNode(node.sup, rowId) : null)
    ?? (node.sub ? findRowInNode(node.sub, rowId) : null);
}

export function updateRowById(
  doc: FormulaDoc,
  rowId: string,
  updater: (row: FormulaRowNode) => FormulaRowNode,
): FormulaDoc {
  const nextRoot = updateNodeRow(doc.root, rowId, updater);
  if (nextRoot === doc.root) {
    return doc;
  }

  return {
    ...doc,
    version: doc.version + 1,
    root: nextRoot as FormulaRowNode,
  };
}

function updateNodeRow(
  node: FormulaNode,
  rowId: string,
  updater: (row: FormulaRowNode) => FormulaRowNode,
): FormulaNode {
  switch (node.type) {
    case 'row': {
      if (node.id === rowId) {
        return updater(node);
      }

      let changed = false;
      const children = node.children.map((child) => {
        const nextChild = updateNodeRow(child, rowId, updater);
        if (nextChild !== child) {
          changed = true;
        }
        return nextChild;
      });

      return changed ? { ...node, children } : node;
    }
    case 'frac': {
      const numerator = updateNodeRow(node.numerator, rowId, updater) as FormulaRowNode;
      const denominator = updateNodeRow(node.denominator, rowId, updater) as FormulaRowNode;
      return numerator !== node.numerator || denominator !== node.denominator
        ? { ...node, numerator, denominator }
        : node;
    }
    case 'sqrt': {
      const value = updateNodeRow(node.value, rowId, updater) as FormulaRowNode;
      return value !== node.value ? { ...node, value } : node;
    }
    case 'script': {
      const base = updateNodeRow(node.base, rowId, updater);
      const sup = node.sup ? updateNodeRow(node.sup, rowId, updater) as FormulaRowNode : undefined;
      const sub = node.sub ? updateNodeRow(node.sub, rowId, updater) as FormulaRowNode : undefined;
      return base !== node.base || sup !== node.sup || sub !== node.sub
        ? { ...node, base, sup, sub }
        : node;
    }
    case 'fence': {
      const body = updateNodeRow(node.body, rowId, updater) as FormulaRowNode;
      return body !== node.body ? { ...node, body } : node;
    }
    case 'matrix': {
      let changed = false;
      const rows = node.rows.map((rowGroup) => rowGroup.map((row) => {
        const nextRow = updateNodeRow(row, rowId, updater) as FormulaRowNode;
        if (nextRow !== row) {
          changed = true;
        }
        return nextRow;
      }));

      return changed ? { ...node, rows } : node;
    }
    default:
      return node;
  }
}
