import { batch, createSignal } from 'solid-js';
import { applyFormulaCommand, createEmptyFormulaDoc } from '../core/commands';
import { clampSelection, createSelection, getInitialSelection } from '../core/selection';
import type {
  FormulaCommand,
  FormulaDispatchOptions,
  FormulaDoc,
  FormulaSelection,
  RuntimeEditorOptions,
} from '../core/types';
import { layoutFormula } from '../layout/layout';
import type { LayoutResult } from '../layout/types';
import { parseLatexToFormulaDoc } from '../latex/parse';
import { serializeFormulaDocToLatex } from '../latex/serialize';
import { BrowserFormulaMetrics } from '../metrics/browser-metrics';
import { mountFormulaSvgView } from '../view/mount';
import { FormulaHistory } from './history';

export class FormulaRuntimeEditor {
  readonly ready: Promise<void>;

  private readonly metrics: BrowserFormulaMetrics;
  private readonly history = new FormulaHistory();
  private readonly rootHost: HTMLDivElement;
  private readonly svgHost: HTMLDivElement;
  private readonly input: HTMLTextAreaElement;
  private readonly disposeView: () => void;
  private readonly options: RuntimeEditorOptions;
  private destroyed = false;
  private inComposition = false;

  private readonly docSignal;
  private readonly selectionSignal;
  private readonly layoutSignal;

  constructor(
    private readonly host: HTMLElement,
    options: RuntimeEditorOptions = {},
  ) {
    this.options = options;
    const initialDoc = createEmptyFormulaDoc(options.initialLatex ?? '');
    const initialSelection = getInitialSelection(initialDoc);
    this.metrics = new BrowserFormulaMetrics(host.ownerDocument ?? document);

    const [doc, setDoc] = createSignal(initialDoc);
    const [selection, setSelection] = createSignal<FormulaSelection | null>(initialSelection);
    const [layout, setLayout] = createSignal<LayoutResult>(
      layoutFormula(initialDoc, this.metrics, {
        fontSize: this.resolveFontSize(),
        fontFamily: options.assets?.fontFamily,
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
    this.rootHost.tabIndex = options.readOnly ? -1 : 0;

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

    this.disposeView = mountFormulaSvgView(this.svgHost, {
      getLayout: this.layoutSignal.get,
      getSelection: () => options.readOnly ? null : this.selectionSignal.get(),
      readOnly: options.readOnly,
    });

    this.bindEvents();

    if (options.autofocus !== false && !options.readOnly) {
      queueMicrotask(() => this.focus());
    }

    this.ready = Promise.resolve();
  }

  getLatex(): string {
    return serializeFormulaDocToLatex(this.docSignal.get());
  }

  setLatex(latex: string, dispatchOptions: FormulaDispatchOptions = {}): void {
    const nextDoc = parseLatexToFormulaDoc(latex);
    const nextSelection = getInitialSelection(nextDoc);
    if (dispatchOptions.addToHistory !== false) {
      this.history.push(
        this.docSignal.get(),
        this.selectionSignal.get(),
        dispatchOptions.historyReason ?? 'programmatic',
        {
          mergeWithPrevious: dispatchOptions.mergeWithPrevious,
        },
      );
    } else if (dispatchOptions.historyReason !== 'programmatic') {
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

  dispatch(command: FormulaCommand, options: FormulaDispatchOptions = {}): void {
    if (command.type === 'undo') {
      this.undo();
      return;
    }
    if (command.type === 'redo') {
      this.redo();
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
    this.disposeView();
    this.metrics.destroy();
    this.host.innerHTML = '';
  }

  private applyState(doc: FormulaDoc, selection: FormulaSelection): void {
    const safeSelection = clampSelection(doc, selection);
    const nextLayout = layoutFormula(doc, this.metrics, {
      fontSize: this.resolveFontSize(),
      fontFamily: this.options.assets?.fontFamily,
    });

    batch(() => {
      this.docSignal.set({
        ...doc,
        sourceLatex: serializeFormulaDocToLatex(doc),
      });
      this.selectionSignal.set(safeSelection);
      this.layoutSignal.set(nextLayout);
    });
  }

  private bindEvents(): void {
    if (this.options.readOnly) {
      return;
    }

    this.rootHost.addEventListener('pointerdown', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const rowElement = target.closest<SVGGElement>('[data-formulax-row-id]');
      if (!rowElement) {
        this.focus();
        return;
      }

      const rowId = rowElement.getAttribute('data-formulax-row-id');
      if (!rowId) {
        return;
      }

      const offset = this.resolvePointerOffset(rowElement, event.clientX);
      this.selectionSignal.set(createSelection(rowId, offset));
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

    if (key === 'Backspace') {
      this.dispatch({ type: 'deleteBackward', payload: undefined });
      return true;
    }

    if (key === 'ArrowLeft') {
      this.dispatch({ type: 'moveLeft', payload: undefined }, { addToHistory: false });
      return true;
    }

    if (key === 'ArrowRight') {
      this.dispatch({ type: 'moveRight', payload: undefined }, { addToHistory: false });
      return true;
    }

    if (commandKey && key === '/') {
      this.dispatch({ type: 'insertFraction', payload: undefined });
      return true;
    }

    return false;
  }

  private resolvePointerOffset(rowElement: SVGGElement, clientX: number): number {
    const children = Array.from(
      this.svgHost.querySelectorAll<SVGGElement>(`[data-formulax-parent-row-id="${rowElement.getAttribute('data-formulax-row-id')}"]`),
    );

    if (children.length === 0) {
      return 0;
    }

    for (let index = 0; index < children.length; index += 1) {
      const rect = children[index].getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;
      if (clientX < midpoint) {
        return index;
      }
    }

    return children.length;
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
}
