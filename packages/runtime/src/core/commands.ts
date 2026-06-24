import { createFormulaNodeId } from './ids';
import { clampSelection, createSelection, findRowById, getInitialSelection, updateRowById } from './selection';
import type {
  FormulaCommand,
  FormulaDispatchOptions,
  FormulaDoc,
  FormulaFractionNode,
  FormulaNode,
  FormulaRowNode,
  FormulaScriptNode,
  FormulaSelection,
  FormulaSqrtNode,
} from './types';
import { parseLatexToFormulaDoc } from '../latex/parse';

export interface FormulaEditResult {
  doc: FormulaDoc;
  selection: FormulaSelection;
  changed: boolean;
  dispatchOptions?: FormulaDispatchOptions;
}

export function createRow(children: FormulaNode[] = []): FormulaRowNode {
  return {
    type: 'row',
    id: createFormulaNodeId('row'),
    children,
  };
}

export function createEmptyFormulaDoc(latex = ''): FormulaDoc {
  const doc = parseLatexToFormulaDoc(latex);
  return {
    ...doc,
    sourceLatex: latex,
  };
}

export function insertTextAtSelection(
  doc: FormulaDoc,
  selection: FormulaSelection,
  text: string,
): FormulaEditResult {
  const safeSelection = clampSelection(doc, selection);
  const row = findRowById(doc, safeSelection.rowId);

  if (!row || !text) {
    return { doc, selection: safeSelection, changed: false };
  }

  const nodes = [...text].map((value) => ({
    type: 'symbol' as const,
    id: createFormulaNodeId('sym'),
    value,
  }));

  const nextDoc = updateRowById(doc, row.id, (currentRow) => ({
    ...currentRow,
    children: [
      ...currentRow.children.slice(0, safeSelection.offset),
      ...nodes,
      ...currentRow.children.slice(safeSelection.offset),
    ],
  }));

  return {
    doc: nextDoc,
    selection: createSelection(row.id, safeSelection.offset + nodes.length),
    changed: nextDoc !== doc,
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
  const row = findRowById(doc, safeSelection.rowId);

  if (!row) {
    return { doc, selection: safeSelection, changed: false };
  }

  const fragment = parseLatexToFormulaDoc(normalizedLatex);
  const placeholderSelection = stripToolbarPlaceholderMarkers(fragment.root);
  const insertedChildren = fragment.root.children;

  if (insertedChildren.length === 0) {
    return { doc, selection: safeSelection, changed: false };
  }

  const nextDoc = updateRowById(doc, row.id, (currentRow) => ({
    ...currentRow,
    children: [
      ...currentRow.children.slice(0, safeSelection.offset),
      ...insertedChildren,
      ...currentRow.children.slice(safeSelection.offset),
    ],
  }));

  return {
    doc: nextDoc,
    selection: resolveInsertedSelection(
      insertedChildren,
      row.id,
      safeSelection.offset,
      placeholderSelection,
      fragment.root.id,
    ),
    changed: nextDoc !== doc,
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
  const row = findRowById(doc, safeSelection.rowId);

  if (!row || safeSelection.offset === 0) {
    return { doc, selection: safeSelection, changed: false };
  }

  const nextDoc = updateRowById(doc, row.id, (currentRow) => ({
    ...currentRow,
    children: [
      ...currentRow.children.slice(0, safeSelection.offset - 1),
      ...currentRow.children.slice(safeSelection.offset),
    ],
  }));

  return {
    doc: nextDoc,
    selection: createSelection(row.id, safeSelection.offset - 1),
    changed: nextDoc !== doc,
    dispatchOptions: {
      addToHistory: true,
      historyReason: 'delete',
    },
  };
}

export function moveSelectionLeft(doc: FormulaDoc, selection: FormulaSelection): FormulaEditResult {
  const safeSelection = clampSelection(doc, selection);
  return {
    doc,
    selection: createSelection(safeSelection.rowId, Math.max(0, safeSelection.offset - 1)),
    changed: false,
    dispatchOptions: {
      addToHistory: false,
    },
  };
}

export function moveSelectionRight(doc: FormulaDoc, selection: FormulaSelection): FormulaEditResult {
  const safeSelection = clampSelection(doc, selection);
  const row = findRowById(doc, safeSelection.rowId) ?? doc.root;
  return {
    doc,
    selection: createSelection(safeSelection.rowId, Math.min(row.children.length, safeSelection.offset + 1)),
    changed: false,
    dispatchOptions: {
      addToHistory: false,
    },
  };
}

export function insertFractionAtSelection(
  doc: FormulaDoc,
  selection: FormulaSelection,
): FormulaEditResult {
  const numerator = createRow([]);
  const denominator = createRow([]);
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
  const value = createRow([]);
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

  if (!row) {
    return { doc, selection: safeSelection, changed: false };
  }

  const nextDoc = updateRowById(doc, row.id, (currentRow) => ({
    ...currentRow,
    children: [
      ...currentRow.children.slice(0, safeSelection.offset),
      node,
      ...currentRow.children.slice(safeSelection.offset),
    ],
  }));

  return {
    doc: nextDoc,
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

function resolveInsertedSelection(
  insertedChildren: FormulaNode[],
  fallbackRowId: string,
  fallbackOffset: number,
  placeholderSelection?: FormulaSelection | null,
  fragmentRootId?: string,
): FormulaSelection {
  if (placeholderSelection) {
    if (placeholderSelection.rowId === fragmentRootId) {
      return createSelection(fallbackRowId, fallbackOffset + placeholderSelection.offset);
    }
    return placeholderSelection;
  }

  for (const child of insertedChildren) {
    const rowId = findFirstEditableRowId(child);
    if (rowId) {
      return createSelection(rowId, 0);
    }
  }

  return createSelection(fallbackRowId, fallbackOffset + insertedChildren.length);
}

function stripToolbarPlaceholderMarkers(row: FormulaRowNode): FormulaSelection | null {
  let selection: FormulaSelection | null = null;
  const nextChildren: FormulaNode[] = [];

  for (const child of row.children) {
    if (child.type === 'placeholder') {
      selection ??= createSelection(row.id, nextChildren.length);
      continue;
    }

    selection ??= stripToolbarPlaceholderFromNode(child);
    nextChildren.push(child);
  }

  row.children = nextChildren;
  return selection;
}

function stripToolbarPlaceholderFromNode(node: FormulaNode): FormulaSelection | null {
  switch (node.type) {
    case 'row':
      return stripToolbarPlaceholderMarkers(node);
    case 'frac': {
      const numeratorSelection = stripToolbarPlaceholderMarkers(node.numerator);
      const denominatorSelection = stripToolbarPlaceholderMarkers(node.denominator);
      return numeratorSelection ?? denominatorSelection;
    }
    case 'sqrt': {
      const indexSelection = node.index ? stripToolbarPlaceholderMarkers(node.index) : null;
      const valueSelection = stripToolbarPlaceholderMarkers(node.value);
      return indexSelection ?? valueSelection;
    }
    case 'script': {
      let selection: FormulaSelection | null = null;

      if (node.base.type === 'placeholder') {
        const baseRow = createRow([]);
        node.base = baseRow;
        selection = createSelection(baseRow.id, 0);
      } else {
        selection = stripToolbarPlaceholderFromNode(node.base);
      }

      const supSelection = node.sup ? stripToolbarPlaceholderMarkers(node.sup) : null;
      const subSelection = node.sub ? stripToolbarPlaceholderMarkers(node.sub) : null;

      return selection ?? supSelection ?? subSelection;
    }
    case 'fence':
      return stripToolbarPlaceholderMarkers(node.body);
    case 'matrix':
      for (const matrixRow of node.rows) {
        for (const cell of matrixRow) {
          const selection = stripToolbarPlaceholderMarkers(cell);
          if (selection) {
            return selection;
          }
        }
      }
      return null;
    case 'symbol':
    case 'placeholder':
    case 'unsupported':
      return null;
  }
}

function findFirstEditableRowId(node: FormulaNode): string | null {
  switch (node.type) {
    case 'row':
      return node.id;
    case 'frac':
      return node.numerator.id;
    case 'sqrt':
      return node.value.id;
    case 'script':
      return node.sup?.id ?? node.sub?.id ?? findFirstEditableRowId(node.base);
    case 'fence':
      return node.body.id;
    case 'matrix':
      return node.rows[0]?.[0]?.id ?? null;
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

  if (!row || safeSelection.offset === 0) {
    return { doc, selection: safeSelection, changed: false };
  }

  let nextSelection = safeSelection;
  const nextDoc = updateRowById(doc, row.id, (currentRow) => {
    const target = currentRow.children[safeSelection.offset - 1];

    if (!target) {
      return currentRow;
    }

    const replacement = createScriptFromTarget(target, part);
    nextSelection = createSelection(part === 'sup'
      ? replacement.sup!.id
      : replacement.sub!.id, 0);

    const children = [...currentRow.children];
    children[safeSelection.offset - 1] = replacement;
    return { ...currentRow, children };
  });

  return {
    doc: nextDoc,
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
      sup: part === 'sup' ? (target.sup ?? createRow([])) : target.sup,
      sub: part === 'sub' ? (target.sub ?? createRow([])) : target.sub,
      order,
    };
  }

  return {
    type: 'script',
    id: createFormulaNodeId('script'),
    base: target,
    sup: part === 'sup' ? createRow([]) : undefined,
    sub: part === 'sub' ? createRow([]) : undefined,
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
