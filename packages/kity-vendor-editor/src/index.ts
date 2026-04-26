import { FormulaEditor, type FormulaEditorOptions } from '@formulax/editor';
import { parseLatex, serializeLatex, type FormulaState } from '@formulax/core';

export interface KityEditorOptions {
  locale?: FormulaEditorOptions['locale'];
  initialLatex?: string;
  onChange?: (latex: string) => void;
}

export interface KityEditor {
  mount(container: HTMLElement): void;
  destroy(): void;
  insertLatex(latex: string): void;
  getLatex(): string;
}

class KityEditorAdapter implements KityEditor {
  private instance: FormulaEditor | null = null;
  private container: HTMLElement | null = null;
  private currentLatex = '';

  constructor(private readonly options: KityEditorOptions = {}) {}

  mount(container: HTMLElement): void {
    this.container = container;
    const initialState = this.options.initialLatex ? { doc: parseLatex(this.options.initialLatex), selection: { anchor: [], focus: [] } } : undefined;

    this.instance = new FormulaEditor({
      root: container,
      locale: this.options.locale ?? 'en',
      initialState: initialState as FormulaState | undefined,
      onChange: (state) => {
        this.currentLatex = serializeLatex(state.doc);
        this.options.onChange?.(this.currentLatex);
      },
    });

    this.currentLatex = serializeLatex(this.instance.getState().doc);
  }

  destroy(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.instance = null;
    this.container = null;
    this.currentLatex = '';
  }

  insertLatex(latex: string): void {
    if (!this.instance) return;
    const nextLatex = `${this.getLatex()}${latex}`;
    this.instance.setState({
      doc: parseLatex(nextLatex),
      selection: { anchor: [], focus: [] },
    });
    this.currentLatex = serializeLatex(this.instance.getState().doc);
    this.options.onChange?.(this.currentLatex);
  }

  getLatex(): string {
    if (this.instance) {
      return serializeLatex(this.instance.getState().doc);
    }
    return this.currentLatex;
  }
}

export function createKityEditor(options: KityEditorOptions = {}): KityEditor {
  return new KityEditorAdapter(options);
}

export function mount(editor: KityEditor, container: HTMLElement): void {
  editor.mount(container);
}

export function destroy(editor: KityEditor): void {
  editor.destroy();
}

export function insertLatex(editor: KityEditor, latex: string): void {
  editor.insertLatex(latex);
}

export function getLatex(editor: KityEditor): string {
  return editor.getLatex();
}
