import { parseLatex, type FormulaDoc } from '@formulax/core';
import { renderKatex } from '@formulax/renderer-katex';

export interface Renderer {
  render(target: HTMLElement, formula: FormulaDoc | string): void;
  destroy(): void;
}

class KatexRendererAdapter implements Renderer {
  private lastTarget: HTMLElement | null = null;

  render(target: HTMLElement, formula: FormulaDoc | string): void {
    const doc = typeof formula === 'string' ? parseLatex(formula) : formula;
    target.innerHTML = renderKatex(doc);
    this.lastTarget = target;
  }

  destroy(): void {
    if (this.lastTarget) {
      this.lastTarget.innerHTML = '';
    }
    this.lastTarget = null;
  }
}

export function createRenderer(): Renderer {
  return new KatexRendererAdapter();
}

export function renderFormula(target: HTMLElement, formula: FormulaDoc | string): void {
  createRenderer().render(target, formula);
}
