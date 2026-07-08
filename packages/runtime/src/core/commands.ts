import { parseLatexToFormulaDoc } from '../latex/parse';
import { createFormulaNodeId } from './ids';
import {
  clampSelection,
  collectPlaceholderTargets,
  collapseSelectionToEnd,
  collapseSelectionToStart,
  createSelection,
  createSelectionFromOffsets,
  findAdjacentPlaceholderTarget,
  findNodeLocationById,
  findRowById,
  findRowOwner,
  getSelectionEndOffset,
  getInitialSelection,
  getSelectionRowId,
  getSelectionStartOffset,
  isCollapsedSelection,
  updateRowById,
} from './selection';
import type {
  FormulaCommand,
  FormulaDispatchOptions,
  FormulaDoc,
  FormulaFractionNode,
  FormulaNode,
  FormulaPlaceholderNode,
  FormulaRowNode,
  FormulaScriptNode,
  FormulaSelection,
  FormulaSqrtNode,
} from './types';

export interface FormulaEditResult {
  doc: FormulaDoc;
  selection: FormulaSelection;
  changed: boolean;
  dispatchOptions?: FormulaDispatchOptions;
}

export const DEFAULT_ROOT_PLACEHOLDER_LABEL = 'Type formula here';

export function createPlaceholderNode(
  options: Omit<FormulaPlaceholderNode, 'type' | 'id'> = {},
): FormulaPlaceholderNode {
  return {
    type: 'placeholder',
    id: createFormulaNodeId('placeholder'),
    role: options.role,
    label: options.label,
    required: options.required ?? true,
    isRoot: options.isRoot,
  };
}

export function createRow(
  children: FormulaNode[] = [],
  placeholder?: FormulaPlaceholderNode,
): FormulaRowNode {
  return {
    type: 'row',
    id: createFormulaNodeId('row'),
    children,
    placeholder,
  };
}

export function createPlaceholderRow(
  role: string,
  options: Omit<FormulaPlaceholderNode, 'type' | 'id' | 'role'> = {},
): FormulaRowNode {
  return createRow([], createPlaceholderNode({
    ...options,
    role,
  }));
}

export function ensureRuntimeEditableDoc(
  doc: FormulaDoc,
  options: { rootPlaceholderLabel?: string } = {},
): FormulaDoc {
  const rootPlaceholderLabel = options.rootPlaceholderLabel ?? DEFAULT_ROOT_PLACEHOLDER_LABEL;
  const hasContent = doc.root.children.length > 0;
  const placeholder = hasContent
    ? undefined
    : (doc.root.placeholder ?? createPlaceholderNode({
      role: 'root',
      label: rootPlaceholderLabel,
      required: false,
      isRoot: true,
    }));

  if (doc.root.placeholder === placeholder) {
    return doc;
  }

  return {
    ...doc,
    root: {
      ...doc.root,
      placeholder,
    },
  };
}

export function createEmptyFormulaDoc(latex = ''): FormulaDoc {
  return ensureRuntimeEditableDoc(parseLatexToFormulaDoc(latex));
}

export function insertTextAtSelection(
  doc: FormulaDoc,
  selection: FormulaSelection,
  text: string,
): FormulaEditResult {
  const safeSelection = clampSelection(doc, selection);
  const normalizedDoc = isCollapsedSelection(safeSelection)
    ? doc
    : removeExpandedSelection(doc, safeSelection).doc;
  const collapsedSelection = isCollapsedSelection(safeSelection)
    ? safeSelection
    : collapseSelectionToStart(safeSelection);
  const row = findRowById(normalizedDoc, collapsedSelection.rowId);
  const selectionOffset = getSelectionStartOffset(collapsedSelection);

  if (!row || !text) {
    return { doc: normalizedDoc, selection: collapsedSelection, changed: false };
  }

  const nodes = [...text].map((value) => ({
    type: 'symbol' as const,
    id: createFormulaNodeId('sym'),
    value,
  }));

  const nextDoc = updateRowById(normalizedDoc, row.id, (currentRow) => ({
    ...currentRow,
    children: [
      ...currentRow.children.slice(0, selectionOffset),
      ...nodes,
      ...currentRow.children.slice(selectionOffset),
    ],
  }));

  return {
    doc: ensureRuntimeEditableDoc(nextDoc),
    selection: createSelection(row.id, selectionOffset + nodes.length),
    changed: nextDoc !== doc || normalizedDoc !== doc,
    dispatchOptions: {
      addToHistory: true,
      historyReason: 'insert',
      mergeWithPrevious: nodes.length > 0,
    },
  };
}

export function insertLatexAtSelection(
  doc: FormulaDoc,
  selection: FormulaSelection,
  latex: string,
): FormulaEditResult {
  const normalizedLatex = normalizeToolbarLatex(latex);
  if (!normalizedLatex) {
    return {
      doc,
      selection: clampSelection(doc, selection),
      changed: false,
    };
  }

  const safeSelection = clampSelection(doc, selection);
  const normalizedDoc = isCollapsedSelection(safeSelection)
    ? doc
    : removeExpandedSelection(doc, safeSelection).doc;
  const collapsedSelection = isCollapsedSelection(safeSelection)
    ? safeSelection
    : collapseSelectionToStart(safeSelection);
  const row = findRowById(normalizedDoc, collapsedSelection.rowId);
  const selectionOffset = getSelectionStartOffset(collapsedSelection);

  if (!row) {
    return { doc: normalizedDoc, selection: collapsedSelection, changed: false };
  }

  const fragment = ensureRuntimeEditableDoc(parseLatexToFormulaDoc(normalizedLatex), {
    rootPlaceholderLabel: '',
  });
  const cursorSelection = stripToolbarCursorMarkers(fragment.root);
  const insertedChildren = fragment.root.children;

  if (insertedChildren.length === 0) {
    return { doc, selection: safeSelection, changed: false };
  }

  const nextDoc = updateRowById(normalizedDoc, row.id, (currentRow) => ({
    ...currentRow,
    children: [
      ...currentRow.children.slice(0, selectionOffset),
      ...insertedChildren,
      ...currentRow.children.slice(selectionOffset),
    ],
  }));

  return {
    doc: ensureRuntimeEditableDoc(nextDoc),
    selection: resolveInsertedSelection(
      insertedChildren,
      row.id,
      selectionOffset,
      cursorSelection,
      fragment.root.id,
    ),
    changed: nextDoc !== doc || normalizedDoc !== doc,
    dispatchOptions: {
      addToHistory: true,
      historyReason: normalizedLatex.includes('\\') ? 'structure' : 'insert',
    },
  };
}

export function deleteBackwardAtSelection(
  doc: FormulaDoc,
  selection: FormulaSelection,
): FormulaEditResult {
  const safeSelection = clampSelection(doc, selection);
  if (!isCollapsedSelection(safeSelection)) {
    return removeExpandedSelection(doc, safeSelection);
  }
  const row = findRowById(doc, safeSelection.rowId);
  const selectionOffset = getSelectionStartOffset(safeSelection);

  if (!row) {
    return { doc, selection: safeSelection, changed: false };
  }

  if (selectionOffset === 0) {
    return moveSelectionLeft(doc, safeSelection);
  }

  const nextDoc = updateRowById(doc, row.id, (currentRow) => ({
    ...currentRow,
    children: [
      ...currentRow.children.slice(0, selectionOffset - 1),
      ...currentRow.children.slice(selectionOffset),
    ],
  }));

  const nextRow = findRowById(nextDoc, row.id) ?? row;
  const nextSelection = createSelection(nextRow.id, Math.max(0, Math.min(selectionOffset - 1, nextRow.children.length)));

  return {
    doc: ensureRuntimeEditableDoc(nextDoc),
    selection: nextSelection,
    changed: nextDoc !== doc,
    dispatchOptions: {
      addToHistory: true,
      historyReason: 'delete',
    },
  };
}

export function moveSelectionLeft(doc: FormulaDoc, selection: FormulaSelection): FormulaEditResult {
  const safeSelection = clampSelection(doc, selection);
  if (!isCollapsedSelection(safeSelection)) {
    return {
      doc,
      selection: collapseSelectionToStart(safeSelection),
      changed: false,
      dispatchOptions: { addToHistory: false },
    };
  }
  const row = findRowById(doc, safeSelection.rowId) ?? doc.root;
  const selectionOffset = getSelectionStartOffset(safeSelection);

  if (selectionOffset > 0) {
    const previous = row.children[selectionOffset - 1];
    const target = previous ? findLastEditableSelection(previous) : null;
    return {
      doc,
      selection: target ?? createSelection(safeSelection.rowId, Math.max(0, selectionOffset - 1)),
      changed: false,
      dispatchOptions: { addToHistory: false },
    };
  }

  const boundarySelection = resolveBoundarySelection(doc, safeSelection, -1);
  return {
    doc,
    selection: boundarySelection ?? safeSelection,
    changed: false,
    dispatchOptions: { addToHistory: false },
  };
}

export function moveSelectionRight(doc: FormulaDoc, selection: FormulaSelection): FormulaEditResult {
  const safeSelection = clampSelection(doc, selection);
  if (!isCollapsedSelection(safeSelection)) {
    return {
      doc,
      selection: collapseSelectionToEnd(safeSelection),
      changed: false,
      dispatchOptions: { addToHistory: false },
    };
  }
  const row = findRowById(doc, safeSelection.rowId) ?? doc.root;
  const selectionOffset = getSelectionStartOffset(safeSelection);

  if (selectionOffset < row.children.length) {
    const next = row.children[selectionOffset];
    const target = next ? findFirstEditableSelection(next) : null;
    return {
      doc,
      selection: target ?? createSelection(safeSelection.rowId, Math.min(row.children.length, selectionOffset + 1)),
      changed: false,
      dispatchOptions: { addToHistory: false },
    };
  }

  const boundarySelection = resolveBoundarySelection(doc, safeSelection, 1);
  return {
    doc,
    selection: boundarySelection ?? safeSelection,
    changed: false,
    dispatchOptions: { addToHistory: false },
  };
}

export function moveSelectionToAdjacentPlaceholder(
  doc: FormulaDoc,
  selection: FormulaSelection,
  direction: 1 | -1,
): FormulaEditResult {
  const safeSelection = clampSelection(doc, isCollapsedSelection(selection) ? selection : collapseSelectionToEnd(selection));
  const nextSelection = findAdjacentPlaceholderTarget(doc, safeSelection, direction);
  return {
    doc,
    selection: nextSelection ?? safeSelection,
    changed: false,
    dispatchOptions: { addToHistory: false },
  };
}

export function selectAll(doc: FormulaDoc): FormulaEditResult {
  return {
    doc,
    selection: createSelectionFromOffsets(doc.root.id, 0, doc.root.children.length),
    changed: false,
    dispatchOptions: { addToHistory: false },
  };
}

export function selectNodeById(doc: FormulaDoc, nodeId: string): FormulaEditResult {
  const location = findNodeLocationById(doc, nodeId);
  if (!location) {
    return {
      doc,
      selection: getInitialSelection(doc),
      changed: false,
      dispatchOptions: { addToHistory: false },
    };
  }

  return {
    doc,
    selection: {
      kind: 'node',
      rowId: location.rowId,
      nodeId,
      startOffset: location.index,
      endOffset: location.index + 1,
    },
    changed: false,
    dispatchOptions: { addToHistory: false },
  };
}

export function insertFractionAtSelection(
  doc: FormulaDoc,
  selection: FormulaSelection,
): FormulaEditResult {
  const numerator = createPlaceholderRow('numerator');
  const denominator = createPlaceholderRow('denominator');
  const node: FormulaFractionNode = {
    type: 'frac',
    id: createFormulaNodeId('frac'),
    numerator,
    denominator,
  };
  return insertStructureAtSelection(doc, selection, node, numerator.id);
}

export function insertSqrtAtSelection(
  doc: FormulaDoc,
  selection: FormulaSelection,
): FormulaEditResult {
  const value = createPlaceholderRow('radicand');
  const node: FormulaSqrtNode = {
    type: 'sqrt',
    id: createFormulaNodeId('sqrt'),
    value,
  };
  return insertStructureAtSelection(doc, selection, node, value.id);
}

export function insertSuperscriptAtSelection(
  doc: FormulaDoc,
  selection: FormulaSelection,
): FormulaEditResult {
  return insertScriptAtSelection(doc, selection, 'sup');
}

export function insertSubscriptAtSelection(
  doc: FormulaDoc,
  selection: FormulaSelection,
): FormulaEditResult {
  return insertScriptAtSelection(doc, selection, 'sub');
}

function insertStructureAtSelection(
  doc: FormulaDoc,
  selection: FormulaSelection,
  node: FormulaNode,
  nextRowId: string,
): FormulaEditResult {
  const safeSelection = clampSelection(doc, selection);
  const row = findRowById(doc, safeSelection.rowId);
  const selectionOffset = getSelectionStartOffset(safeSelection);

  if (!row) {
    return { doc, selection: safeSelection, changed: false };
  }

  const nextDoc = updateRowById(doc, row.id, (currentRow) => ({
    ...currentRow,
    children: [
      ...currentRow.children.slice(0, selectionOffset),
      node,
      ...currentRow.children.slice(selectionOffset),
    ],
  }));

  return {
    doc: ensureRuntimeEditableDoc(nextDoc),
    selection: createSelection(nextRowId, 0),
    changed: nextDoc !== doc,
    dispatchOptions: {
      addToHistory: true,
      historyReason: 'structure',
    },
  };
}

function normalizeToolbarLatex(latex: string): string {
  return latex
    .replace(/\\([a-zA-Z]+)\s+\{/g, '\\$1{')
    .replace(/\s+/g, ' ')
    .trim();
}

function removeExpandedSelection(
  doc: FormulaDoc,
  selection: FormulaSelection,
): FormulaEditResult {
  const rowId = getSelectionRowId(selection);
  const row = findRowById(doc, rowId);
  if (!row) {
    return { doc, selection: createSelection(doc.root.id, doc.root.children.length), changed: false };
  }

  const startOffset = getSelectionStartOffset(selection);
  const endOffset = getSelectionEndOffset(selection);
  if (startOffset === endOffset) {
    return {
      doc,
      selection: createSelection(row.id, startOffset),
      changed: false,
    };
  }

  const nextDoc = updateRowById(doc, row.id, (currentRow) => ({
    ...currentRow,
    children: [
      ...currentRow.children.slice(0, startOffset),
      ...currentRow.children.slice(endOffset),
    ],
  }));

  return {
    doc: ensureRuntimeEditableDoc(nextDoc),
    selection: createSelection(row.id, startOffset),
    changed: nextDoc !== doc,
    dispatchOptions: {
      addToHistory: true,
      historyReason: 'delete',
    },
  };
}

function resolveInsertedSelection(
  insertedChildren: FormulaNode[],
  fallbackRowId: string,
  fallbackOffset: number,
  cursorSelection?: FormulaSelection | null,
  fragmentRootId?: string,
): FormulaSelection {
  if (cursorSelection) {
    if (cursorSelection.rowId === fragmentRootId) {
      return createSelection(fallbackRowId, fallbackOffset + getSelectionStartOffset(cursorSelection));
    }
    return cursorSelection;
  }

  const firstPlaceholder = findFirstPlaceholderSelectionInNodes(insertedChildren);
  if (firstPlaceholder) {
    return firstPlaceholder;
  }

  for (const child of insertedChildren) {
    const rowSelection = findFirstEditableSelection(child);
    if (rowSelection) {
      return rowSelection;
    }
  }

  return createSelection(fallbackRowId, fallbackOffset + insertedChildren.length);
}

function stripToolbarCursorMarkers(row: FormulaRowNode): FormulaSelection | null {
  let selection: FormulaSelection | null = row.placeholder && row.children.length === 0
    ? createSelection(row.id, 0)
    : null;
  const nextChildren: FormulaNode[] = [];

  for (const child of row.children) {
    if (child.type === 'placeholder') {
      selection ??= createSelection(row.id, nextChildren.length);
      continue;
    }

    selection ??= stripToolbarCursorMarkerFromNode(child);
    nextChildren.push(child);
  }

  row.children = nextChildren;
  return selection;
}

function stripToolbarCursorMarkerFromNode(node: FormulaNode): FormulaSelection | null {
  switch (node.type) {
    case 'row':
      return stripToolbarCursorMarkers(node);
    case 'frac': {
      const numeratorSelection = stripToolbarCursorMarkers(node.numerator);
      const denominatorSelection = stripToolbarCursorMarkers(node.denominator);
      return numeratorSelection ?? denominatorSelection;
    }
    case 'sqrt': {
      const indexSelection = node.index ? stripToolbarCursorMarkers(node.index) : null;
      const valueSelection = stripToolbarCursorMarkers(node.value);
      return indexSelection ?? valueSelection;
    }
    case 'script': {
      let selection: FormulaSelection | null = null;

      if (node.base.type === 'placeholder') {
        const baseRow = createPlaceholderRow('script-base');
        node.base = baseRow;
        selection = createSelection(baseRow.id, 0);
      } else {
        selection = stripToolbarCursorMarkerFromNode(node.base);
      }

      const supSelection = node.sup ? stripToolbarCursorMarkers(node.sup) : null;
      const subSelection = node.sub ? stripToolbarCursorMarkers(node.sub) : null;

      return selection ?? supSelection ?? subSelection;
    }
    case 'fence':
      return stripToolbarCursorMarkers(node.body);
    case 'matrix':
      for (const matrixRow of node.rows) {
        for (const cell of matrixRow) {
          const selection = stripToolbarCursorMarkers(cell);
          if (selection) {
            return selection;
          }
        }
      }
      return null;
    default:
      return null;
  }
}

function findFirstPlaceholderSelectionInNodes(nodes: FormulaNode[]): FormulaSelection | null {
  const docLike: FormulaDoc = {
    type: 'doc',
    id: 'virtual-doc',
    root: createRow(nodes),
    sourceLatex: '',
    version: 0,
    diagnostics: [],
  };
  const first = collectPlaceholderTargets(docLike)[0];
  return first ? createSelection(first.rowId, first.offset) : null;
}

function findFirstEditableSelection(node: FormulaNode): FormulaSelection | null {
  switch (node.type) {
    case 'row':
      return getInitialSelection({
        type: 'doc',
        id: 'virtual-doc',
        root: node,
        sourceLatex: '',
        version: 0,
        diagnostics: [],
      });
    case 'frac':
      return createSelection(node.numerator.id, 0);
    case 'sqrt':
      return createSelection((node.index ?? node.value).id, 0);
    case 'script':
      return node.sup
        ? createSelection(node.sup.id, 0)
        : node.sub
          ? createSelection(node.sub.id, 0)
          : findFirstEditableSelection(node.base);
    case 'fence':
      return createSelection(node.body.id, 0);
    case 'matrix':
      return node.rows[0]?.[0] ? createSelection(node.rows[0][0].id, 0) : null;
    default:
      return null;
  }
}

function findLastEditableSelection(node: FormulaNode): FormulaSelection | null {
  switch (node.type) {
    case 'row':
      return createSelection(node.id, node.children.length);
    case 'frac':
      return createSelection(node.denominator.id, node.denominator.children.length);
    case 'sqrt':
      return createSelection(node.value.id, node.value.children.length);
    case 'script':
      return node.sub
        ? createSelection(node.sub.id, node.sub.children.length)
        : node.sup
          ? createSelection(node.sup.id, node.sup.children.length)
          : findLastEditableSelection(node.base);
    case 'fence':
      return createSelection(node.body.id, node.body.children.length);
    case 'matrix': {
      const row = node.rows[node.rows.length - 1];
      const cell = row?.[row.length - 1];
      return cell ? createSelection(cell.id, cell.children.length) : null;
    }
    default:
      return null;
  }
}

function resolveBoundarySelection(
  doc: FormulaDoc,
  selection: FormulaSelection,
  direction: 1 | -1,
): FormulaSelection | null {
  const owner = findRowOwner(doc, getSelectionRowId(selection));
  if (!owner) {
    return null;
  }

  const parentNode = owner.parentNodeId ? findNodeById(doc.root, owner.parentNodeId) : null;

  if (direction === 1) {
    if (owner.field === 'frac-numerator' && parentNode?.type === 'frac') {
      return createSelection(parentNode.denominator.id, 0);
    }
    if (owner.field === 'sqrt-index' && parentNode?.type === 'sqrt') {
      return createSelection(parentNode.value.id, 0);
    }
    if (owner.field === 'script-sup' && parentNode?.type === 'script' && parentNode.sub) {
      return createSelection(parentNode.sub.id, 0);
    }
  }

  if (direction === -1) {
    if (owner.field === 'frac-denominator' && parentNode?.type === 'frac') {
      return createSelection(parentNode.numerator.id, parentNode.numerator.children.length);
    }
    if (owner.field === 'sqrt-value' && parentNode?.type === 'sqrt' && parentNode.index) {
      return createSelection(parentNode.index.id, parentNode.index.children.length);
    }
    if (owner.field === 'script-sub' && parentNode?.type === 'script' && parentNode.sup) {
      return createSelection(parentNode.sup.id, parentNode.sup.children.length);
    }
  }

  if (!owner.parentRowId || !owner.parentNodeId) {
    return null;
  }

  const parentRow = findRowById(doc, owner.parentRowId);
  if (!parentRow) {
    return null;
  }

  const childIndex = parentRow.children.findIndex((child) => child.id === owner.parentNodeId);
  if (childIndex === -1) {
    return null;
  }

  return createSelection(owner.parentRowId, direction === 1 ? childIndex + 1 : childIndex);
}

function findNodeById(node: FormulaNode, nodeId: string): FormulaNode | null {
  if (node.id === nodeId) {
    return node;
  }

  switch (node.type) {
    case 'row':
      for (const child of node.children) {
        const found = findNodeById(child, nodeId);
        if (found) {
          return found;
        }
      }
      return null;
    case 'frac':
      return findNodeById(node.numerator, nodeId) ?? findNodeById(node.denominator, nodeId);
    case 'sqrt':
      return (node.index ? findNodeById(node.index, nodeId) : null) ?? findNodeById(node.value, nodeId);
    case 'script':
      return findNodeById(node.base, nodeId)
        ?? (node.sup ? findNodeById(node.sup, nodeId) : null)
        ?? (node.sub ? findNodeById(node.sub, nodeId) : null);
    case 'fence':
      return findNodeById(node.body, nodeId);
    case 'matrix':
      for (const row of node.rows) {
        for (const cell of row) {
          const found = findNodeById(cell, nodeId);
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

function insertScriptAtSelection(
  doc: FormulaDoc,
  selection: FormulaSelection,
  part: 'sup' | 'sub',
): FormulaEditResult {
  const safeSelection = clampSelection(doc, selection);
  const row = findRowById(doc, safeSelection.rowId);
  const selectionOffset = getSelectionStartOffset(safeSelection);

  if (!row || selectionOffset === 0) {
    return { doc, selection: safeSelection, changed: false };
  }

  let nextSelection = safeSelection;
  const nextDoc = updateRowById(doc, row.id, (currentRow) => {
    const target = currentRow.children[selectionOffset - 1];

    if (!target) {
      return currentRow;
    }

    const replacement = createScriptFromTarget(target, part);
    nextSelection = createSelection(part === 'sup'
      ? replacement.sup!.id
      : replacement.sub!.id, 0);

    const children = [...currentRow.children];
    children[selectionOffset - 1] = replacement;
    return { ...currentRow, children };
  });

  return {
    doc: ensureRuntimeEditableDoc(nextDoc),
    selection: nextSelection,
    changed: nextDoc !== doc,
    dispatchOptions: {
      addToHistory: true,
      historyReason: 'structure',
    },
  };
}

function createScriptFromTarget(target: FormulaNode, part: 'sup' | 'sub'): FormulaScriptNode {
  if (target.type === 'script') {
    const order = [...(target.order ?? [])];
    if (!order.includes(part)) {
      order.push(part);
    }
    return {
      ...target,
      sup: part === 'sup' ? (target.sup ?? createPlaceholderRow('superscript')) : target.sup,
      sub: part === 'sub' ? (target.sub ?? createPlaceholderRow('subscript')) : target.sub,
      order,
    };
  }

  return {
    type: 'script',
    id: createFormulaNodeId('script'),
    base: target,
    sup: part === 'sup' ? createPlaceholderRow('superscript') : undefined,
    sub: part === 'sub' ? createPlaceholderRow('subscript') : undefined,
    order: [part],
  };
}

export function applyFormulaCommand(
  doc: FormulaDoc,
  selection: FormulaSelection | null,
  command: FormulaCommand,
): FormulaEditResult {
  const currentSelection = selection ?? getInitialSelection(doc);

  switch (command.type) {
    case 'insertText': {
      const payload = command.payload as { text?: string } | undefined;
      return insertTextAtSelection(doc, currentSelection, payload?.text ?? '');
    }
    case 'insertLatex': {
      const payload = command.payload as { latex?: string } | undefined;
      return insertLatexAtSelection(doc, currentSelection, payload?.latex ?? '');
    }
    case 'deleteBackward':
      return deleteBackwardAtSelection(doc, currentSelection);
    case 'moveLeft':
      return moveSelectionLeft(doc, currentSelection);
    case 'moveRight':
      return moveSelectionRight(doc, currentSelection);
    case 'moveUp':
    case 'moveDown':
      return {
        doc,
        selection: currentSelection,
        changed: false,
        dispatchOptions: {
          addToHistory: false,
        },
      };
    case 'moveToNextPlaceholder':
      return moveSelectionToAdjacentPlaceholder(doc, currentSelection, 1);
    case 'moveToPreviousPlaceholder':
      return moveSelectionToAdjacentPlaceholder(doc, currentSelection, -1);
    case 'selectAll':
      return selectAll(doc);
    case 'insertFraction':
      return insertFractionAtSelection(doc, currentSelection);
    case 'insertSqrt':
      return insertSqrtAtSelection(doc, currentSelection);
    case 'insertSuperscript':
      return insertSuperscriptAtSelection(doc, currentSelection);
    case 'insertSubscript':
      return insertSubscriptAtSelection(doc, currentSelection);
    case 'undo':
    case 'redo':
      return {
        doc,
        selection: currentSelection,
        changed: false,
      };
  }
}
