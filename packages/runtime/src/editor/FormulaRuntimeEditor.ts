import { batch, createSignal } from 'solid-js';
import { applyFormulaCommand, createEmptyFormulaDoc, ensureRuntimeEditableDoc } from '../core/commands';
import {
  clampSelection,
  createStructuralSelectionFromPoints,
  createSelection,
  createSelectionPoint,
  findNodeById,
  findNodeLocationById,
  findRowOwner,
  getInitialSelection,
  getSelectionEndOffset,
  getSelectionRowId,
  getSelectionStartOffset,
  isCollapsedSelection,
} from '../core/selection';
import type {
  FormulaCommand,
  FormulaDispatchOptions,
  FormulaDoc,
  FormulaSelection,
  RuntimeEditorOptions,
} from '../core/types';
import { layoutFormula } from '../layout/layout';
import type { LayoutResult } from '../layout/types';
import { buildAbsoluteLayoutState } from '../layout/absolute';
import { getFormulaXRuntimeMessage } from '../i18n';
import { parseLatexToFormulaDoc } from '../latex/parse';
import { serializeFormulaDocToLatex } from '../latex/serialize';
import { BrowserFormulaMetrics } from '../metrics/browser-metrics';
import { mountFormulaSvgView, type MountedFormulaSvgView } from '../view/mount';
import { FormulaHistory } from './history';

export class FormulaRuntimeEditor {
  readonly ready: Promise<void>;

  private readonly metrics: BrowserFormulaMetrics;
  private readonly history = new FormulaHistory();
  private readonly rootHost: HTMLDivElement;
  private readonly svgHost: HTMLDivElement;
  private readonly input: HTMLTextAreaElement;
  private readonly view: MountedFormulaSvgView;
  private readonly options: RuntimeEditorOptions;
  private resizeObserver?: ResizeObserver;
  private destroyed = false;
  private inComposition = false;
  private preferredCursorX: number | null = null;
  private dragAnchor: ReturnType<typeof createSelectionPoint> | null = null;
  private pointerDown = false;

  private readonly docSignal;
  private readonly selectionSignal;
  private readonly layoutSignal;

  constructor(
    private readonly host: HTMLElement,
    options: RuntimeEditorOptions = {},
  ) {
    this.options = options;
    const initialDoc = ensureRuntimeEditableDoc(createEmptyFormulaDoc(options.initialLatex ?? ''), {
      rootPlaceholderLabel: getFormulaXRuntimeMessage('editor.placeholder.root', options.locale),
    });
    const initialSelection = getInitialSelection(initialDoc);
    this.metrics = new BrowserFormulaMetrics(host.ownerDocument ?? document);

    const [doc, setDoc] = createSignal(initialDoc);
    const [selection, setSelection] = createSignal<FormulaSelection | null>(initialSelection);
    const [layout, setLayout] = createSignal<LayoutResult>(
      layoutFormula(initialDoc, this.metrics, {
        fontSize: this.resolveFontSize(),
        fontFamily: options.assets?.fontFamily,
        wrap: this.options.wrap,
        maxWidth: this.resolveLayoutWidth(),
        lineGap: this.options.lineGap,
        continuationIndent: this.options.continuationIndent,
      }),
    );
    this.docSignal = { get: doc, set: setDoc };
    this.selectionSignal = { get: selection, set: setSelection };
    this.layoutSignal = { get: layout, set: setLayout };

    host.innerHTML = '';
    host.classList.add('fx-runtime-editor-host');
    host.style.position = 'relative';
    host.style.minHeight = this.resolveCssSize(options.height, '120px');

    this.rootHost = document.createElement('div');
    this.rootHost.className = 'fx-runtime-editor';
    this.rootHost.style.position = 'relative';
    this.rootHost.style.height = this.resolveCssSize(options.height, '100%');
    this.rootHost.style.minHeight = '120px';
    this.rootHost.style.outline = 'none';
    this.rootHost.tabIndex = options.readOnly ? 0 : -1;

    this.svgHost = document.createElement('div');
    this.svgHost.className = 'fx-runtime-editor__surface';
    this.svgHost.style.minHeight = '80px';
    this.svgHost.style.padding = '16px';
    this.svgHost.style.cursor = options.readOnly ? 'default' : 'text';

    this.input = document.createElement('textarea');
    this.input.className = 'fx-runtime-editor__input';
    this.input.setAttribute('aria-hidden', 'true');
    this.input.tabIndex = options.readOnly ? -1 : 0;
    Object.assign(this.input.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: '1px',
      height: '1px',
      opacity: '0',
      pointerEvents: 'none',
      resize: 'none',
      overflow: 'hidden',
    });

    this.rootHost.append(this.svgHost, this.input);
    this.host.appendChild(this.rootHost);

    this.view = mountFormulaSvgView(this.svgHost, {
      getLayout: this.layoutSignal.get,
      getSelection: () => options.readOnly ? null : this.selectionSignal.get(),
      readOnly: options.readOnly,
    });

    this.bindEvents();
    this.bindResizeObserver();

    if (options.autofocus !== false && !options.readOnly) {
      queueMicrotask(() => this.focus());
    }

    this.ready = Promise.resolve();
  }

  getLatex(): string {
    return serializeFormulaDocToLatex(this.docSignal.get());
  }

  setLatex(latex: string, dispatchOptions: FormulaDispatchOptions = {}): void {
    const nextDoc = ensureRuntimeEditableDoc(parseLatexToFormulaDoc(latex), {
      rootPlaceholderLabel: getFormulaXRuntimeMessage('editor.placeholder.root', this.options.locale),
    });
    const nextSelection = getInitialSelection(nextDoc);
    if (dispatchOptions.preserveHistory) {
      this.history.push(
        this.docSignal.get(),
        this.selectionSignal.get(),
        dispatchOptions.historyReason ?? 'programmatic',
        {
          mergeWithPrevious: dispatchOptions.mergeWithPrevious,
        },
      );
    } else {
      this.history.clear();
    }
    this.applyState(nextDoc, nextSelection);
  }

  focus(): void {
    if (this.options.readOnly) {
      this.rootHost.focus();
      return;
    }

    this.input.focus();
  }

  blur(): void {
    this.input.blur();
  }

  getRenderHtml(): string {
    const svg = this.svgHost.querySelector('svg');
    return svg?.outerHTML ?? '';
  }

  getSelection(): FormulaSelection | null {
    return this.selectionSignal.get();
  }

  dispatch(command: FormulaCommand, options: FormulaDispatchOptions = {}): void {
    if (command.type === 'undo') {
      this.undo();
      return;
    }
    if (command.type === 'redo') {
      this.redo();
      return;
    }
    if (command.type === 'moveUp') {
      this.moveSelectionVertically(-1);
      return;
    }
    if (command.type === 'moveDown') {
      this.moveSelectionVertically(1);
      return;
    }

    const currentDoc = this.docSignal.get();
    const currentSelection = this.selectionSignal.get() ?? getInitialSelection(currentDoc);
    const result = applyFormulaCommand(currentDoc, currentSelection, command);
    const changed = result.changed;
    const shouldAddToHistory = options.addToHistory ?? result.dispatchOptions?.addToHistory ?? changed;

    if (shouldAddToHistory && changed) {
      this.history.push(
        currentDoc,
        currentSelection,
        options.historyReason ?? result.dispatchOptions?.historyReason ?? 'unknown',
        {
          mergeWithPrevious: options.mergeWithPrevious ?? result.dispatchOptions?.mergeWithPrevious,
        },
      );
    }

    if (changed || result.selection !== currentSelection) {
      if (command.type !== 'insertText') {
        this.preferredCursorX = null;
      }
      this.applyState(result.doc, result.selection);
    }
  }

  undo(): boolean {
    const entry = this.history.undo(this.docSignal.get(), this.selectionSignal.get());
    if (!entry) {
      return false;
    }

    this.applyState(entry.doc, entry.selection ?? getInitialSelection(entry.doc));
    return true;
  }

  redo(): boolean {
    const entry = this.history.redo(this.docSignal.get(), this.selectionSignal.get());
    if (!entry) {
      return false;
    }

    this.applyState(entry.doc, entry.selection ?? getInitialSelection(entry.doc));
    return true;
  }

  canUndo(): boolean {
    return this.history.canUndo();
  }

  canRedo(): boolean {
    return this.history.canRedo();
  }

  clearHistory(): void {
    this.history.clear();
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.view.dispose();
    this.resizeObserver?.disconnect();
    this.metrics.destroy();
    this.host.innerHTML = '';
  }

  private applyState(doc: FormulaDoc, selection: FormulaSelection): void {
    const editableDoc = ensureRuntimeEditableDoc(doc, {
      rootPlaceholderLabel: getFormulaXRuntimeMessage('editor.placeholder.root', this.options.locale),
    });
    const safeSelection = clampSelection(editableDoc, selection);
    const nextLayout = layoutFormula(editableDoc, this.metrics, {
      fontSize: this.resolveFontSize(),
      fontFamily: this.options.assets?.fontFamily,
      wrap: this.options.wrap,
      maxWidth: this.resolveLayoutWidth(),
      lineGap: this.options.lineGap,
      continuationIndent: this.options.continuationIndent,
    });

    batch(() => {
      this.docSignal.set({
        ...editableDoc,
        sourceLatex: serializeFormulaDocToLatex(editableDoc),
      });
      this.selectionSignal.set(safeSelection);
      this.layoutSignal.set(nextLayout);
    });
    this.view.sync(nextLayout, this.options.readOnly ? null : safeSelection);
  }

  private bindEvents(): void {
    if (this.options.readOnly) {
      return;
    }

    this.rootHost.addEventListener('focus', () => {
      if (this.destroyed || this.options.readOnly) {
        return;
      }

      if (document.activeElement === this.rootHost) {
        this.input.focus();
      }
    });

    this.rootHost.addEventListener('pointerdown', (event) => {
      this.pointerDown = true;
      const point = this.resolveSelectionPointFromPointer(event.clientX, event.clientY);
      if (!point) {
        this.focus();
        return;
      }

      const nextSelection = clampSelection(
        this.docSignal.get(),
        createSelection(point.rowId, point.offset),
      );
      this.dragAnchor = point;
      this.selectionSignal.set(nextSelection);
      this.preferredCursorX = null;
      this.focus();
      event.preventDefault();
    });

    this.rootHost.addEventListener('pointermove', (event) => {
      if (!this.pointerDown || !this.dragAnchor) {
        return;
      }

      const point = this.resolveSelectionPointFromPointer(event.clientX, event.clientY);
      if (!point) {
        return;
      }

      const nextSelection = clampSelection(
        this.docSignal.get(),
        createStructuralSelectionFromPoints(this.docSignal.get(), this.dragAnchor, point),
      );
      this.selectionSignal.set(nextSelection);
      this.preferredCursorX = null;
      event.preventDefault();
    });

    this.rootHost.addEventListener('pointerup', () => {
      this.pointerDown = false;
      this.dragAnchor = null;
    });

    this.rootHost.addEventListener('pointercancel', () => {
      this.pointerDown = false;
      this.dragAnchor = null;
    });

    this.rootHost.addEventListener('dblclick', (event) => {
      const target = event.target;
      const selection = target instanceof Element
        ? this.resolveSelectionFromDoubleClickTarget(target) ?? this.resolveSelectionFromPoint(event.clientX, event.clientY)
        : this.resolveSelectionFromPoint(event.clientX, event.clientY);
      if (!selection) {
        return;
      }

      this.selectionSignal.set(clampSelection(this.docSignal.get(), selection));
      this.preferredCursorX = null;
      this.focus();
      event.preventDefault();
    });

    this.input.addEventListener('beforeinput', (event) => {
      if (this.inComposition) {
        return;
      }

      if (event.inputType === 'insertText' && typeof event.data === 'string' && event.data) {
        this.dispatch({
          type: 'insertText',
          payload: { text: event.data },
        });
        event.preventDefault();
      }
    });

    this.input.addEventListener('keydown', (event) => {
      if (this.handleKeyboardShortcut(event)) {
        event.preventDefault();
      }
    });

    this.input.addEventListener('paste', (event) => {
      const text = event.clipboardData?.getData('text/plain') ?? '';
      if (!text) {
        return;
      }

      this.dispatch({
        type: 'insertText',
        payload: { text },
      }, {
        historyReason: 'paste',
      });
      event.preventDefault();
    });

    this.input.addEventListener('compositionstart', () => {
      this.inComposition = true;
    });

    this.input.addEventListener('compositionupdate', () => {
      // Composition updates are intentionally excluded from history entries.
    });

    this.input.addEventListener('compositionend', (event) => {
      this.inComposition = false;
      const value = (event as CompositionEvent).data ?? '';
      if (value) {
        this.dispatch({
          type: 'insertText',
          payload: { text: value },
        }, {
          historyReason: 'composition',
        });
      }
    });
  }

  private handleKeyboardShortcut(event: KeyboardEvent): boolean {
    const commandKey = event.metaKey || event.ctrlKey;
    const key = event.key;

    if (commandKey && key.toLowerCase() === 'z' && !event.shiftKey) {
      return this.undo();
    }

    if (commandKey && (key.toLowerCase() === 'y' || (event.shiftKey && key.toLowerCase() === 'z'))) {
      return this.redo();
    }

    if (commandKey && key.toLowerCase() === 'a') {
      this.dispatch({ type: 'selectAll', payload: undefined }, { addToHistory: false });
      return true;
    }

    if (key === 'Backspace') {
      this.dispatch({ type: 'deleteBackward', payload: undefined });
      return true;
    }

    if (key === 'ArrowLeft') {
      this.preferredCursorX = null;
      this.dispatch({ type: 'moveLeft', payload: undefined }, { addToHistory: false });
      return true;
    }

    if (key === 'ArrowRight') {
      this.preferredCursorX = null;
      this.dispatch({ type: 'moveRight', payload: undefined }, { addToHistory: false });
      return true;
    }

    if (key === 'ArrowUp') {
      this.dispatch({ type: 'moveUp', payload: undefined }, { addToHistory: false });
      return true;
    }

    if (key === 'ArrowDown') {
      this.dispatch({ type: 'moveDown', payload: undefined }, { addToHistory: false });
      return true;
    }

    if (key === 'Tab') {
      this.dispatch({
        type: event.shiftKey ? 'moveToPreviousPlaceholder' : 'moveToNextPlaceholder',
        payload: undefined,
      }, { addToHistory: false });
      return true;
    }

    if (commandKey && key === '/') {
      this.dispatch({ type: 'insertFraction', payload: undefined });
      return true;
    }

    return false;
  }

  private resolveWrappedPointerOffset(clientX: number, clientY: number): number {
    const svg = this.svgHost.querySelector('svg');
    const layout = this.layoutSignal.get();
    if (!svg) {
      return 0;
    }

    const rect = svg.getBoundingClientRect();
    const scaleX = rect.width > 0 ? layout.width / rect.width : 1;
    const scaleY = rect.height > 0 ? layout.height / rect.height : 1;
    const pointX = (clientX - rect.left) * scaleX;
    const pointY = (clientY - rect.top) * scaleY;
    const line = layout.lines.find((candidate) => pointY >= candidate.y && pointY <= candidate.y + candidate.height)
      ?? layout.lines.reduce<LayoutResult['lines'][number] | null>((closest, candidate) => {
        if (!closest) {
          return candidate;
        }
        const closestDistance = Math.abs(pointY - (closest.y + closest.height / 2));
        const candidateDistance = Math.abs(pointY - (candidate.y + candidate.height / 2));
        return candidateDistance < closestDistance ? candidate : closest;
      }, null);

    if (!line) {
      return 0;
    }

    for (const fragment of line.fragments) {
      const midpoint = line.x + fragment.x + fragment.width / 2;
      if (pointX < midpoint) {
        return fragment.childIndex;
      }
    }

    return line.endOffset;
  }

  private moveSelectionVertically(direction: -1 | 1): void {
    const selection = this.selectionSignal.get();
    if (!selection) {
      return;
    }
    if (!isCollapsedSelection(selection)) {
      this.selectionSignal.set(direction < 0
        ? createSelection(getSelectionRowId(selection), getSelectionStartOffset(selection))
        : createSelection(getSelectionRowId(selection), getSelectionEndOffset(selection)));
      return;
    }

    const structuralSelection = this.resolveStructuralVerticalSelection(selection, direction);
    if (structuralSelection) {
      this.selectionSignal.set(structuralSelection);
      this.preferredCursorX = null;
      return;
    }

    const layout = this.layoutSignal.get();
    const selectionRowId = getSelectionRowId(selection);
    const selectionOffset = getSelectionEndOffset(selection);
    const currentLineIndex = layout.lines.findIndex((line) => (
      selectionRowId === this.docSignal.get().root.id
      && selectionOffset >= line.startOffset
      && selectionOffset <= line.endOffset
    ));

    if (currentLineIndex === -1) {
      return;
    }

    const nextLine = layout.lines[currentLineIndex + direction];
    if (!nextLine) {
      return;
    }

    const currentX = this.preferredCursorX ?? this.getCaretXForSelection(layout, selection);
    this.preferredCursorX = currentX;
    const nextOffset = this.resolveOffsetInLine(nextLine, currentX);
    this.selectionSignal.set(createSelection(selectionRowId, nextOffset));
  }

  private resolveOffsetInLine(line: LayoutResult['lines'][number], x: number): number {
    if (line.fragments.length === 0) {
      return line.startOffset;
    }

    for (const fragment of line.fragments) {
      const midpoint = line.x + fragment.x + fragment.width / 2;
      if (x < midpoint) {
        return fragment.childIndex;
      }
    }

    return line.endOffset;
  }

  private getCaretXForSelection(layout: LayoutResult, selection: FormulaSelection): number {
    const offset = getSelectionEndOffset(selection);
    const line = layout.lines.find((candidate) => (
      offset >= candidate.startOffset && offset <= candidate.endOffset
    ));

    if (!line) {
      return 0;
    }

    if (offset <= line.startOffset) {
      return line.x + (line.fragments[0]?.x ?? 0);
    }

    if (offset >= line.endOffset) {
      const last = line.fragments[line.fragments.length - 1];
      return line.x + (last ? last.x + last.width : 0);
    }

    const fragment = line.fragments.find((item) => item.childIndex === offset);
    return line.x + (fragment?.x ?? 0);
  }

  private resolveSelectionPointFromPointer(clientX: number, clientY: number) {
    const svg = this.svgHost.querySelector('svg');
    const layout = this.layoutSignal.get();
    if (!svg) {
      return null;
    }

    const rect = svg.getBoundingClientRect();
    const scaleX = rect.width > 0 ? layout.width / rect.width : 1;
    const scaleY = rect.height > 0 ? layout.height / rect.height : 1;
    const pointX = (clientX - rect.left) * scaleX;
    const pointY = (clientY - rect.top) * scaleY;
    const absoluteState = buildAbsoluteLayoutState(layout);
    const rowCandidates = absoluteState.rowBoxes
      .filter((row) => pointY >= row.y && pointY <= row.y + row.height)
      .sort((left, right) => (left.width * left.height) - (right.width * right.height));
    const row = rowCandidates[0] ?? this.findClosestRowBox(absoluteState.rowBoxes, pointX, pointY);
    if (!row || !row.rowId) {
      return createSelectionPoint(
        this.docSignal.get().root.id,
        this.resolveWrappedPointerOffset(clientX, clientY),
      );
    }

    return createSelectionPoint(row.rowId, this.resolveOffsetForPointInRow(row, pointX, absoluteState.boxMap));
  }

  private findClosestRowBox(rowBoxes: LayoutResult['root']['children'], pointX: number, pointY: number) {
    return rowBoxes.reduce<typeof rowBoxes[number] | null>((closest, row) => {
      if (!closest) {
        return row;
      }

      const rowCenterX = row.x + row.width / 2;
      const rowCenterY = row.y + row.height / 2;
      const closestCenterX = closest.x + closest.width / 2;
      const closestCenterY = closest.y + closest.height / 2;
      const distance = Math.abs(pointX - rowCenterX) + Math.abs(pointY - rowCenterY);
      const closestDistance = Math.abs(pointX - closestCenterX) + Math.abs(pointY - closestCenterY);
      return distance < closestDistance ? row : closest;
    }, null);
  }

  private resolveOffsetForPointInRow(row: LayoutResult['root'], pointX: number, absoluteMap: Map<string, LayoutResult['root']>): number {
    const childCount = row.modelChildCount ?? row.children.length;
    if (childCount <= 0 || row.children.length === 0) {
      return 0;
    }

    for (let index = 0; index < childCount; index += 1) {
      const child = row.children[index];
      const absoluteChild = absoluteMap.get(child.nodeId) ?? child;
      const midpoint = absoluteChild.x + absoluteChild.width / 2;
      if (pointX < midpoint) {
        return index;
      }
    }

    return childCount;
  }

  private resolveSelectionFromDoubleClickTarget(target: Element): FormulaSelection | null {
    const nodeElement = target.closest<SVGGElement>('[data-formulax-node-id]');
    const nodeId = nodeElement?.getAttribute('data-formulax-node-id');
    if (nodeId) {
      return this.resolveSelectionFromNodeId(nodeId);
    }

    return null;
  }

  private resolveSelectionFromPoint(clientX: number, clientY: number): FormulaSelection | null {
    const svg = this.svgHost.querySelector('svg');
    const layout = this.layoutSignal.get();
    if (!svg) {
      return null;
    }

    const rect = svg.getBoundingClientRect();
    const scaleX = rect.width > 0 ? layout.width / rect.width : 1;
    const scaleY = rect.height > 0 ? layout.height / rect.height : 1;
    const pointX = (clientX - rect.left) * scaleX;
    const pointY = (clientY - rect.top) * scaleY;
    const { boxMap } = buildAbsoluteLayoutState(layout);
    const target = Array.from(boxMap.values())
      .filter((box) => (
        box.kind !== 'row'
        && box.kind !== 'sqrt-radical'
        && pointX >= box.x
        && pointX <= box.x + box.width
        && pointY >= box.y
        && pointY <= box.y + box.height
      ))
      .sort((left, right) => (left.width * left.height) - (right.width * right.height))[0];

    if (!target) {
      return null;
    }

    return this.resolveSelectionFromNodeId(target.nodeId);
  }

  private resolveSelectionFromNodeId(nodeId: string): FormulaSelection | null {
    if (!nodeId) {
      return null;
    }

    const doc = this.docSignal.get();
    const node = findNodeById(doc, nodeId);
    if (!node) {
      return null;
    }

    if (node.type === 'row' && node.id === doc.root.id) {
      return createSelection(doc.root.id, doc.root.children.length).kind === 'caret'
        ? {
          kind: 'range',
          rowId: doc.root.id,
          anchorOffset: 0,
          focusOffset: doc.root.children.length,
          startOffset: 0,
          endOffset: doc.root.children.length,
        }
        : null;
    }

    const location = findNodeLocationById(doc, nodeId);
    if (location) {
      return {
        kind: 'node',
        rowId: location.rowId,
        nodeId,
        startOffset: location.index,
        endOffset: location.index + 1,
      };
    }

    if (node.type === 'row') {
      return {
        kind: 'range',
        rowId: node.id,
        anchorOffset: 0,
        focusOffset: node.children.length,
        startOffset: 0,
        endOffset: node.children.length,
      };
    }

    return null;
  }

  private resolveStructuralVerticalSelection(
    selection: FormulaSelection,
    direction: -1 | 1,
  ): FormulaSelection | null {
    const doc = this.docSignal.get();
    const rowId = getSelectionRowId(selection);
    const owner = findRowOwner(doc, rowId);
    if (!owner?.parentNodeId) {
      return null;
    }

    const parentNode = findNodeById(doc, owner.parentNodeId);
    if (!parentNode) {
      return null;
    }

    const caretOffset = getSelectionEndOffset(selection);
    if (parentNode.type === 'frac') {
      if (direction < 0 && owner.field === 'frac-denominator') {
        return createSelection(parentNode.numerator.id, Math.min(caretOffset, parentNode.numerator.children.length));
      }
      if (direction > 0 && owner.field === 'frac-numerator') {
        return createSelection(parentNode.denominator.id, Math.min(caretOffset, parentNode.denominator.children.length));
      }
      return null;
    }

    if (parentNode.type === 'script') {
      if (direction < 0 && owner.field === 'script-sub' && parentNode.sup) {
        return createSelection(parentNode.sup.id, Math.min(caretOffset, parentNode.sup.children.length));
      }
      if (direction > 0 && owner.field === 'script-sup' && parentNode.sub) {
        return createSelection(parentNode.sub.id, Math.min(caretOffset, parentNode.sub.children.length));
      }
      if (direction < 0 && owner.field === 'script-base' && parentNode.sup) {
        return createSelection(parentNode.sup.id, Math.min(caretOffset, parentNode.sup.children.length));
      }
      if (direction > 0 && owner.field === 'script-base' && parentNode.sub) {
        return createSelection(parentNode.sub.id, Math.min(caretOffset, parentNode.sub.children.length));
      }
      return null;
    }

    if (parentNode.type === 'sqrt') {
      if (direction < 0 && owner.field === 'sqrt-value' && parentNode.index) {
        return createSelection(parentNode.index.id, Math.min(caretOffset, parentNode.index.children.length));
      }
      if (direction > 0 && owner.field === 'sqrt-index') {
        return createSelection(parentNode.value.id, Math.min(caretOffset, parentNode.value.children.length));
      }
      return null;
    }

    if (parentNode.type === 'matrix' && owner.field === 'matrix-cell' && owner.matrixRowIndex !== undefined && owner.matrixColumnIndex !== undefined) {
      const nextRowIndex = owner.matrixRowIndex + direction;
      const nextCell = parentNode.rows[nextRowIndex]?.[owner.matrixColumnIndex];
      if (nextCell) {
        return createSelection(nextCell.id, Math.min(caretOffset, nextCell.children.length));
      }
    }

    return null;
  }

  private bindResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined' || this.options.maxWidth !== 'host') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      const currentDoc = this.docSignal.get();
      const currentSelection = this.selectionSignal.get() ?? getInitialSelection(currentDoc);
      this.applyState(currentDoc, currentSelection);
    });
    this.resizeObserver.observe(this.host);
  }

  private resolveCssSize(value: number | string | undefined, fallback: string): string {
    if (typeof value === 'number') {
      return `${value}px`;
    }

    return value ?? fallback;
  }

  private resolveFontSize(): number {
    return this.options.render?.fontSize ?? this.options.render?.fontsize ?? 40;
  }

  private resolveLayoutWidth(): number | undefined {
    if (this.options.maxWidth === 'host') {
      return Math.max(0, this.host.clientWidth - 32);
    }

    return this.options.maxWidth;
  }
}
