import type {
  FormulaDoc,
  FormulaNode,
  FormulaPlaceholderNode,
  FormulaRowNode,
  FormulaScriptNode,
  FormulaSelection,
} from './types';

export interface FormulaRowOwner {
  parentRowId: string | null;
  parentNodeId: string | null;
  field:
    | 'root'
    | 'row-child'
    | 'frac-numerator'
    | 'frac-denominator'
    | 'sqrt-index'
    | 'sqrt-value'
    | 'script-base'
    | 'script-sup'
    | 'script-sub'
    | 'fence-body'
    | 'matrix-cell';
  childIndex?: number;
  matrixRowIndex?: number;
  matrixColumnIndex?: number;
}

export interface FormulaPlaceholderTarget {
  rowId: string;
  offset: number;
  placeholder: FormulaPlaceholderNode;
}

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
  return findFirstPlaceholderTarget(doc) ?? createSelection(doc.root.id, doc.root.children.length);
}

export function findRowById(doc: FormulaDoc, rowId: string): FormulaRowNode | null {
  return findRowInNode(doc.root, rowId);
}

export function findRowOwner(doc: FormulaDoc, rowId: string): FormulaRowOwner | null {
  return findRowOwnerInNode(doc.root, rowId, {
    parentRowId: null,
    parentNodeId: null,
    field: 'root',
  });
}

export function isPlaceholderRow(row: FormulaRowNode | null | undefined): row is FormulaRowNode {
  return Boolean(row?.placeholder && row.children.length === 0);
}

export function findFirstPlaceholderTarget(doc: FormulaDoc): FormulaSelection | null {
  const targets = collectPlaceholderTargets(doc);
  const first = targets[0];
  return first ? createSelection(first.rowId, first.offset) : null;
}

export function findAdjacentPlaceholderTarget(
  doc: FormulaDoc,
  selection: FormulaSelection,
  direction: 1 | -1,
): FormulaSelection | null {
  const targets = collectPlaceholderTargets(doc);
  if (targets.length === 0) {
    return null;
  }

  const index = targets.findIndex((target) => target.rowId === selection.rowId);
  if (index === -1) {
    return direction === 1
      ? createSelection(targets[0].rowId, targets[0].offset)
      : createSelection(targets[targets.length - 1].rowId, targets[targets.length - 1].offset);
  }

  const next = targets[index + direction];
  return next ? createSelection(next.rowId, next.offset) : null;
}

export function collectPlaceholderTargets(doc: FormulaDoc): FormulaPlaceholderTarget[] {
  const targets: FormulaPlaceholderTarget[] = [];
  collectPlaceholderTargetsInRow(doc.root, targets);
  return targets;
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
    return (node.index ? findRowInNode(node.index, rowId) : null) ?? findRowInNode(node.value, rowId);
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

function findRowOwnerInNode(
  node: FormulaNode,
  rowId: string,
  owner: FormulaRowOwner,
): FormulaRowOwner | null {
  if (node.type === 'row') {
    if (node.id === rowId) {
      return owner;
    }

    for (let index = 0; index < node.children.length; index += 1) {
      const found = findRowOwnerInNode(node.children[index], rowId, {
        parentRowId: node.id,
        parentNodeId: node.children[index].id,
        field: 'row-child',
        childIndex: index,
      });
      if (found) {
        return found;
      }
    }

    return null;
  }

  if (node.type === 'frac') {
    return findRowOwnerInNode(node.numerator, rowId, {
      parentRowId: owner.parentRowId,
      parentNodeId: node.id,
      field: 'frac-numerator',
    }) ?? findRowOwnerInNode(node.denominator, rowId, {
      parentRowId: owner.parentRowId,
      parentNodeId: node.id,
      field: 'frac-denominator',
    });
  }

  if (node.type === 'sqrt') {
    return (node.index
      ? findRowOwnerInNode(node.index, rowId, {
        parentRowId: owner.parentRowId,
        parentNodeId: node.id,
        field: 'sqrt-index',
      })
      : null) ?? findRowOwnerInNode(node.value, rowId, {
      parentRowId: owner.parentRowId,
      parentNodeId: node.id,
      field: 'sqrt-value',
    });
  }

  if (node.type === 'script') {
    if (node.base.type === 'row') {
      const baseOwner = findRowOwnerInNode(node.base, rowId, {
        parentRowId: owner.parentRowId,
        parentNodeId: node.id,
        field: 'script-base',
      });
      if (baseOwner) {
        return baseOwner;
      }
    }

    return (node.sup
      ? findRowOwnerInNode(node.sup, rowId, {
        parentRowId: owner.parentRowId,
        parentNodeId: node.id,
        field: 'script-sup',
      })
      : null) ?? (node.sub
      ? findRowOwnerInNode(node.sub, rowId, {
        parentRowId: owner.parentRowId,
        parentNodeId: node.id,
        field: 'script-sub',
      })
      : null);
  }

  if (node.type === 'fence') {
    return findRowOwnerInNode(node.body, rowId, {
      parentRowId: owner.parentRowId,
      parentNodeId: node.id,
      field: 'fence-body',
    });
  }

  if (node.type === 'matrix') {
    for (let rowIndex = 0; rowIndex < node.rows.length; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < node.rows[rowIndex].length; columnIndex += 1) {
        const found = findRowOwnerInNode(node.rows[rowIndex][columnIndex], rowId, {
          parentRowId: owner.parentRowId,
          parentNodeId: node.id,
          field: 'matrix-cell',
          matrixRowIndex: rowIndex,
          matrixColumnIndex: columnIndex,
        });
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

function collectPlaceholderTargetsInRow(row: FormulaRowNode, targets: FormulaPlaceholderTarget[]): void {
  if (row.placeholder && row.children.length === 0) {
    targets.push({
      rowId: row.id,
      offset: 0,
      placeholder: row.placeholder,
    });
  }

  for (const child of row.children) {
    collectPlaceholderTargetsInNode(child, targets);
  }
}

function collectPlaceholderTargetsInNode(node: FormulaNode, targets: FormulaPlaceholderTarget[]): void {
  switch (node.type) {
    case 'row':
      collectPlaceholderTargetsInRow(node, targets);
      return;
    case 'frac':
      collectPlaceholderTargetsInRow(node.numerator, targets);
      collectPlaceholderTargetsInRow(node.denominator, targets);
      return;
    case 'sqrt':
      if (node.index) {
        collectPlaceholderTargetsInRow(node.index, targets);
      }
      collectPlaceholderTargetsInRow(node.value, targets);
      return;
    case 'script':
      collectPlaceholderTargetsInNode(node.base, targets);
      if (node.sup) {
        collectPlaceholderTargetsInRow(node.sup, targets);
      }
      if (node.sub) {
        collectPlaceholderTargetsInRow(node.sub, targets);
      }
      return;
    case 'fence':
      collectPlaceholderTargetsInRow(node.body, targets);
      return;
    case 'matrix':
      for (const rowGroup of node.rows) {
        for (const row of rowGroup) {
          collectPlaceholderTargetsInRow(row, targets);
        }
      }
      return;
    default:
      return;
  }
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
      const index = node.index ? updateNodeRow(node.index, rowId, updater) as FormulaRowNode : undefined;
      const value = updateNodeRow(node.value, rowId, updater) as FormulaRowNode;
      return index !== node.index || value !== node.value ? { ...node, index, value } : node;
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
