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
    case 'insertText':
      return insertTextAtSelection(doc, currentSelection, command.payload?.text ?? '');
    case 'deleteBackward':
      return deleteBackwardAtSelection(doc, currentSelection);
    case 'moveLeft':
      return moveSelectionLeft(doc, currentSelection);
    case 'moveRight':
      return moveSelectionRight(doc, currentSelection);
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
