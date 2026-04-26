export interface Editor {
  mount(container: HTMLElement): void;
  destroy(): void;
  insertLatex(latex: string): void;
  getLatex(): string;
}

export interface Parser {
  parseLatex(latex: string): object;
  serializeLatex(ast: object): string;
}

export interface Renderer {
  render(target: HTMLElement, formula: object | string): void;
  destroy(): void;
}
