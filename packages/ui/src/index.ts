import {
  insertFenced,
  insertFraction,
  insertSqrt,
  insertSubscript,
  insertSuperscript,
  insertText,
  latexCommandToSymbol,
  type FormulaCommand,
} from '@formulax/core';

export interface ToolbarAction {
  id: string;
  label: string;
  command: FormulaCommand;
}

export interface SymbolDefinition {
  latex: string;
  display: string;
}

export interface SymbolCategory {
  name: string;
  symbols: SymbolDefinition[];
}

export const createToolbarActions = (): ToolbarAction[] => [
  { id: 'fraction', label: 'Fraction', command: insertFraction() },
  { id: 'sup', label: 'Superscript', command: insertSuperscript() },
  { id: 'sub', label: 'Subscript', command: insertSubscript() },
  { id: 'sqrt', label: 'Square Root', command: insertSqrt() },
  { id: 'fence', label: 'Parentheses', command: insertFenced() },
];

export const SYMBOL_CATEGORIES: SymbolCategory[] = [
  {
    name: 'Greek Letters',
    symbols: [
      { latex: '\\alpha', display: '\u03b1' },
      { latex: '\\beta', display: '\u03b2' },
      { latex: '\\gamma', display: '\u03b3' },
      { latex: '\\delta', display: '\u03b4' },
      { latex: '\\pi', display: '\u03c0' },
      { latex: '\\sigma', display: '\u03c3' },
      { latex: '\\omega', display: '\u03c9' },
      { latex: '\\theta', display: '\u03b8' },
    ],
  },
  {
    name: 'Operators',
    symbols: [
      { latex: '\\cdot', display: '\u00b7' },
      { latex: '\\times', display: '\u00d7' },
      { latex: '\\div', display: '\u00f7' },
      { latex: '\\pm', display: '\u00b1' },
      { latex: '\\cup', display: '\u222a' },
      { latex: '\\cap', display: '\u2229' },
    ],
  },
  {
    name: 'Functions',
    symbols: [
      { latex: '\\sin', display: 'sin' },
      { latex: '\\cos', display: 'cos' },
      { latex: '\\tan', display: 'tan' },
      { latex: '\\log', display: 'log' },
      { latex: '\\lim', display: 'lim' },
      { latex: '\\exp', display: 'exp' },
    ],
  },
  {
    name: 'Relations',
    symbols: [
      { latex: '\\leq', display: '\u2264' },
      { latex: '\\geq', display: '\u2265' },
      { latex: '\\neq', display: '\u2260' },
      { latex: '\\approx', display: '\u2248' },
      { latex: '\\infty', display: '\u221e' },
    ],
  },
];

export const createSymbolCommand = (latex: string): FormulaCommand => {
  const command = latex.startsWith('\\') ? latex.slice(1) : latex;
  const symbol = latexCommandToSymbol(command);
  return insertText(symbol ?? latex);
};

export const renderToolbar = (): string =>
  `
  <div class="fx-toolbar">
    ${createToolbarActions()
      .map((action) => `<button type="button" data-command="${action.id}">${action.label}</button>`)
      .join('')}
  </div>
`;

export const renderFormulaPanel = (): string =>
  `
  <section class="fx-panel">
    <h3>Symbol Panel</h3>
    ${SYMBOL_CATEGORIES.map(
      (category) => `
      <div style="margin-bottom:12px;">
        <strong style="font-size:11px;color:#64748b;">${category.name}</strong>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
          ${category.symbols
            .map(
              (symbol) =>
                `<button type="button" class="fx-symbol-btn" data-latex="${symbol.latex}" title="${symbol.latex}">${symbol.display}</button>`,
            )
            .join('')}
        </div>
      </div>
    `,
    ).join('')}
  </section>
`;

export const renderModal = (title: string, content: string): string =>
  `
  <div class="fx-modal" role="dialog" aria-modal="true">
    <div class="fx-modal-card">
      <h3>${title}</h3>
      <div>${content}</div>
    </div>
  </div>
`;
