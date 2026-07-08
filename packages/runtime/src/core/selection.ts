import type {
  FormulaCaretSelection,
  FormulaDoc,
  FormulaNode,
  FormulaNodeSelection,
  FormulaPlaceholderNode,
  FormulaRangeSelection,
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

export interface FormulaNodeLocation {
  rowId: string;
  index: number;
  node: FormulaNode;
}

export interface FormulaSelectionPoint {
  rowId: string;
  offset: number;
}

export interface FormulaSelectionProjection {
  rowId: string;
  startOffset: number;
  endOffset: number;
  nodeId?: string;
  exact: boolean;
}

export function createSelection(rowId: string, offset = 0): FormulaCaretSelection {
  return { kind: 'caret', rowId, offset };
}

export function createRangeSelection(
  rowId: string,
  anchorOffset: number,
  focusOffset: number,
): FormulaRangeSelection {
  return {
    kind: 'range',
    rowId,
    anchorOffset,
    focusOffset,
    startOffset: Math.min(anchorOffset, focusOffset),
    endOffset: Math.max(anchorOffset, focusOffset),
  };
}

export function createNodeSelection(
  rowId: string,
  nodeId: string,
  startOffset: number,
  endOffset: number,
): FormulaNodeSelection {
  return {
    kind: 'node',
    rowId,
    nodeId,
    startOffset: Math.min(startOffset, endOffset),
    endOffset: Math.max(startOffset, endOffset),
  };
}

export function isCaretSelection(selection: FormulaSelection | null | undefined): selection is FormulaCaretSelection {
  return Boolean(selection && selection.kind === 'caret');
}

export function isRangeSelection(selection: FormulaSelection | null | undefined): selection is FormulaRangeSelection {
  return Boolean(selection && selection.kind === 'range');
}

export function isNodeSelection(selection: FormulaSelection | null | undefined): selection is FormulaNodeSelection {
  return Boolean(selection && selection.kind === 'node');
}

export function isCollapsedSelection(selection: FormulaSelection): boolean {
  if (selection.kind === 'caret') {
    return true;
  }

  return selection.startOffset === selection.endOffset;
}

export function getSelectionRowId(selection: FormulaSelection): string {
  return selection.rowId;
}

export function getSelectionAnchorOffset(selection: FormulaSelection): number {
  switch (selection.kind) {
    case 'caret':
      return selection.offset;
    case 'range':
      return selection.anchorOffset;
    case 'node':
      return selection.startOffset;
  }
}

export function getSelectionFocusOffset(selection: FormulaSelection): number {
  switch (selection.kind) {
    case 'caret':
      return selection.offset;
    case 'range':
      return selection.focusOffset;
    case 'node':
      return selection.endOffset;
  }
}

export function getSelectionStartOffset(selection: FormulaSelection): number {
  switch (selection.kind) {
    case 'caret':
      return selection.offset;
    case 'range':
      return selection.startOffset;
    case 'node':
      return selection.startOffset;
  }
}

export function getSelectionEndOffset(selection: FormulaSelection): number {
  switch (selection.kind) {
    case 'caret':
      return selection.offset;
    case 'range':
      return selection.endOffset;
    case 'node':
      return selection.endOffset;
  }
}

export function collapseSelectionToStart(selection: FormulaSelection): FormulaCaretSelection {
  return createSelection(selection.rowId, getSelectionStartOffset(selection));
}

export function collapseSelectionToEnd(selection: FormulaSelection): FormulaCaretSelection {
  return createSelection(selection.rowId, getSelectionEndOffset(selection));
}

export function clampSelection(doc: FormulaDoc, selection: FormulaSelection): FormulaSelection {
  const rowId = getSelectionRowId(selection);
  const row = findRowById(doc, rowId) ?? doc.root;
  const clampOffset = (value: number) => Math.max(0, Math.min(value, row.children.length));

  switch (selection.kind) {
    case 'caret':
      return createSelection(row.id, clampOffset(selection.offset));
    case 'range':
      return createRangeSelection(row.id, clampOffset(selection.anchorOffset), clampOffset(selection.focusOffset));
    case 'node': {
      const startOffset = clampOffset(selection.startOffset);
      const endOffset = clampOffset(selection.endOffset);
      const nodeId = row.children[startOffset]?.id ?? selection.nodeId;
      return createNodeSelection(row.id, nodeId, startOffset, endOffset);
    }
  }
}

export function normalizeSelection(doc: FormulaDoc, selection: FormulaSelection): FormulaSelection {
  const clamped = clampSelection(doc, selection);

  if (clamped.kind === 'range' && clamped.startOffset === clamped.endOffset) {
    return createSelection(clamped.rowId, clamped.startOffset);
  }

  if (clamped.kind === 'node' && clamped.startOffset + 1 !== clamped.endOffset) {
    return createRangeSelection(clamped.rowId, clamped.startOffset, clamped.endOffset);
  }

  return clamped;
}

export function createSelectionPoint(rowId: string, offset: number): FormulaSelectionPoint {
  return { rowId, offset };
}

export function projectSelectionPoint(
  doc: FormulaDoc,
  point: FormulaSelectionPoint,
): FormulaSelectionProjection[] {
  const projections: FormulaSelectionProjection[] = [{
    rowId: point.rowId,
    startOffset: point.offset,
    endOffset: point.offset,
    exact: true,
  }];

  let currentRowId = point.rowId;
  let owner = findRowOwner(doc, currentRowId);
  while (owner?.parentRowId && owner.parentNodeId) {
    const parentRow = findRowById(doc, owner.parentRowId);
    if (!parentRow) {
      break;
    }

    const parentNodeId = owner.parentNodeId;

    const childIndex = parentRow.children.findIndex((child) => child.id === parentNodeId);
    if (childIndex === -1) {
      break;
    }

    projections.push({
      rowId: parentRow.id,
      startOffset: childIndex,
      endOffset: childIndex + 1,
      nodeId: parentNodeId,
      exact: false,
    });

    currentRowId = parentRow.id;
    owner = findRowOwner(doc, currentRowId);
  }

  return projections;
}

export function createStructuralSelectionFromPoints(
  doc: FormulaDoc,
  anchor: FormulaSelectionPoint,
  focus: FormulaSelectionPoint,
): FormulaSelection {
  const anchorProjections = projectSelectionPoint(doc, anchor);
  const focusProjections = projectSelectionPoint(doc, focus);
  const focusByRow = new Map(focusProjections.map((projection) => [projection.rowId, projection] as const));
  const common = anchorProjections.find((projection) => focusByRow.has(projection.rowId));

  if (!common) {
    return createSelection(doc.root.id, doc.root.children.length);
  }

  const focusProjection = focusByRow.get(common.rowId)!;
  if (common.exact && focusProjection.exact) {
    return createSelectionFromOffsets(common.rowId, common.startOffset, focusProjection.startOffset);
  }

  const anchorBeforeFocus = common.startOffset < focusProjection.startOffset
    || (common.startOffset === focusProjection.startOffset && common.endOffset <= focusProjection.endOffset);
  const anchorOffset = common.exact
    ? common.startOffset
    : (anchorBeforeFocus ? common.startOffset : common.endOffset);
  const focusOffset = focusProjection.exact
    ? focusProjection.startOffset
    : (anchorBeforeFocus ? focusProjection.endOffset : focusProjection.startOffset);
  const startOffset = Math.min(anchorOffset, focusOffset);
  const endOffset = Math.max(anchorOffset, focusOffset);

  if (endOffset - startOffset === 1) {
    const nodeId = common.nodeId === focusProjection.nodeId
      ? common.nodeId
      : (anchorBeforeFocus ? focusProjection.nodeId : common.nodeId);
    if (nodeId) {
      return createNodeSelection(common.rowId, nodeId, startOffset, endOffset);
    }
  }

  return createSelectionFromOffsets(common.rowId, anchorOffset, focusOffset);
}

export function getInitialSelection(doc: FormulaDoc): FormulaSelection {
  return findFirstPlaceholderTarget(doc) ?? createSelection(doc.root.id, doc.root.children.length);
}

export function createSelectionFromOffsets(
  rowId: string,
  anchorOffset: number,
  focusOffset: number,
): FormulaSelection {
  return anchorOffset === focusOffset
    ? createSelection(rowId, focusOffset)
    : createRangeSelection(rowId, anchorOffset, focusOffset);
}

export function findRowById(doc: FormulaDoc, rowId: string): FormulaRowNode | null {
  return findRowInNode(doc.root, rowId);
}

export function findNodeLocationById(doc: FormulaDoc, nodeId: string): FormulaNodeLocation | null {
  return findNodeLocationInRow(doc.root, nodeId);
}

export function findNodeById(doc: FormulaDoc, nodeId: string): FormulaNode | null {
  return findNodeInTree(doc.root, nodeId);
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

  const focusRowId = getSelectionRowId(selection);
  const index = targets.findIndex((target) => target.rowId === focusRowId);
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

function findNodeLocationInRow(row: FormulaRowNode, nodeId: string): FormulaNodeLocation | null {
  for (let index = 0; index < row.children.length; index += 1) {
    const child = row.children[index];
    if (child.id === nodeId) {
      return { rowId: row.id, index, node: child };
    }

    const nested = findNodeLocationInNode(child, nodeId);
    if (nested) {
      return nested;
    }
  }

  return null;
}

function findNodeLocationInNode(node: FormulaNode, nodeId: string): FormulaNodeLocation | null {
  switch (node.type) {
    case 'row':
      return findNodeLocationInRow(node, nodeId);
    case 'frac':
      return findNodeLocationInRow(node.numerator, nodeId) ?? findNodeLocationInRow(node.denominator, nodeId);
    case 'sqrt':
      return (node.index ? findNodeLocationInRow(node.index, nodeId) : null) ?? findNodeLocationInRow(node.value, nodeId);
    case 'script':
      return findNodeLocationInNode(node.base, nodeId)
        ?? (node.sup ? findNodeLocationInRow(node.sup, nodeId) : null)
        ?? (node.sub ? findNodeLocationInRow(node.sub, nodeId) : null);
    case 'fence':
      return findNodeLocationInRow(node.body, nodeId);
    case 'matrix':
      for (const row of node.rows) {
        for (const cell of row) {
          const found = findNodeLocationInRow(cell, nodeId);
          if (found) {
            return found;
          }
        }
      }
      return null;
    default:
      return null;
  }
}

function findNodeInTree(node: FormulaNode, nodeId: string): FormulaNode | null {
  if (node.id === nodeId) {
    return node;
  }

  switch (node.type) {
    case 'row':
      for (const child of node.children) {
        const found = findNodeInTree(child, nodeId);
        if (found) {
          return found;
        }
      }
      return null;
    case 'frac':
      return findNodeInTree(node.numerator, nodeId) ?? findNodeInTree(node.denominator, nodeId);
    case 'sqrt':
      return (node.index ? findNodeInTree(node.index, nodeId) : null) ?? findNodeInTree(node.value, nodeId);
    case 'script':
      return findNodeInTree(node.base, nodeId)
        ?? (node.sup ? findNodeInTree(node.sup, nodeId) : null)
        ?? (node.sub ? findNodeInTree(node.sub, nodeId) : null);
    case 'fence':
      return findNodeInTree(node.body, nodeId);
    case 'matrix':
      for (const row of node.rows) {
        for (const cell of row) {
          const found = findNodeInTree(cell, nodeId);
          if (found) {
            return found;
          }
        }
      }
      return null;
    default:
      return null;
  }
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
