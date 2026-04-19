import {
  applyCommand,
  backspace,
  createEmptyState,
  insertFenced,
  insertFraction,
  insertSqrt,
  insertSubscript,
  insertSuperscript,
  insertText,
  type FormulaPath,
  type FormulaState,
} from '@formulax/core';
import { renderInteractiveHtml } from './dom-renderer';
import { editorStyles } from './styles';
import { type Locale, type LocaleConfig } from './i18n';

export interface FormulaEditorOptions extends LocaleConfig {
  root: HTMLElement;
  initialState?: FormulaState;
  onChange?: (state: FormulaState) => void;
}

export class FormulaEditor {
  private state: FormulaState;
  private readonly root: HTMLElement;
  private readonly onChange?: (state: FormulaState) => void;
  private readonly locale: Locale;

  constructor(options: FormulaEditorOptions) {
    this.root = options.root;
    this.state = options.initialState ?? createEmptyState();
    this.onChange = options.onChange;
    this.locale = options.locale ?? 'en';
    this.root.classList.add('fx-editor');
    this.root.tabIndex = 0;
    this.ensureStyles();
    this.bindEvents();
    this.render();
  }

  getState(): FormulaState {
    return structuredClone(this.state);
  }

  getLocale(): Locale {
    return this.locale;
  }

  setState(state: FormulaState): void {
    this.state = structuredClone(state);
    this.render();
  }

  dispatch(command: (state: FormulaState) => FormulaState): void {
    this.state = applyCommand(this.state, command);
    this.render();
    this.onChange?.(this.getState());
  }

  private ensureStyles(): void {
    if (document.getElementById('fx-editor-styles')) return;
    const style = document.createElement('style');
    style.id = 'fx-editor-styles';
    style.textContent = editorStyles;
    document.head.appendChild(style);
  }

  private bindEvents(): void {
    this.root.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const pathValue = target.dataset.path;
      if (pathValue === undefined) return;
      const path = pathValue === '' ? [] : pathValue.split('.').map(Number);
      this.moveSelection(path);
    });

    this.root.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace') {
        event.preventDefault();
        this.dispatch(backspace());
        return;
      }

      if (event.key === '/') {
        event.preventDefault();
        this.dispatch(insertFraction());
        return;
      }

      if (event.key === '^') {
        event.preventDefault();
        this.dispatch(insertSuperscript());
        return;
      }

      if (event.key === '_') {
        event.preventDefault();
        this.dispatch(insertSubscript());
        return;
      }

      if (event.key === 'r' && event.ctrlKey) {
        event.preventDefault();
        this.dispatch(insertSqrt());
        return;
      }

      if (event.key === '(') {
        event.preventDefault();
        this.dispatch(insertFenced('(', ')'));
        return;
      }

      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        this.dispatch(insertText(event.key));
      }
    });
  }

  private moveSelection(path: FormulaPath): void {
    this.state = {
      ...this.state,
      selection: {
        anchor: [...path],
        focus: [...path],
      },
    };
    this.render();
    this.onChange?.(this.getState());
  }

  private render(): void {
    this.root.innerHTML = renderInteractiveHtml(this.state.doc, this.state.selection.focus);
  }
}
