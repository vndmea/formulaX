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

export interface RibbonTemplate {
  label: string;
  preview: string;
  command?: string;
  latex?: string;
}

export interface RibbonGroup {
  title: string;
  accent?: 'teal' | 'gold' | 'green' | 'red' | 'blue';
  items: RibbonTemplate[];
}

export const createToolbarActions = (): ToolbarAction[] => [
  { id: 'fraction', label: 'Fraction', command: insertFraction() },
  { id: 'sup', label: 'Superscript', command: insertSuperscript() },
  { id: 'sub', label: 'Subscript', command: insertSubscript() },
  { id: 'sqrt', label: 'Square Root', command: insertSqrt() },
  { id: 'fence', label: 'Parentheses', command: insertFenced() },
];

export const RIBBON_GROUPS: RibbonGroup[] = [
  {
    title: 'Insert',
    accent: 'teal',
    items: [
      { label: 'Fraction', preview: 'a/b', command: 'fraction' },
      { label: 'Superscript', preview: 'x^2', command: 'sup' },
      { label: 'Subscript', preview: 'x_i', command: 'sub' },
      { label: 'Radical', preview: 'sqrt', command: 'sqrt' },
      { label: 'Brackets', preview: '( )', command: 'fence' },
    ],
  },
  {
    title: 'Greek',
    accent: 'gold',
    items: [
      { label: 'alpha', preview: 'alpha', latex: '\\alpha' },
      { label: 'beta', preview: 'beta', latex: '\\beta' },
      { label: 'gamma', preview: 'gamma', latex: '\\gamma' },
      { label: 'theta', preview: 'theta', latex: '\\theta' },
      { label: 'pi', preview: 'pi', latex: '\\pi' },
      { label: 'sigma', preview: 'sigma', latex: '\\sigma' },
    ],
  },
  {
    title: 'Operators',
    accent: 'green',
    items: [
      { label: 'Plus Minus', preview: 'plus/minus', latex: '\\pm' },
      { label: 'Multiply', preview: 'times', latex: '\\times' },
      { label: 'Divide', preview: 'divide', latex: '\\div' },
      { label: 'Dot', preview: 'dot', latex: '\\cdot' },
      { label: 'Union', preview: 'union', latex: '\\cup' },
      { label: 'Intersection', preview: 'intersect', latex: '\\cap' },
    ],
  },
  {
    title: 'Relations',
    accent: 'red',
    items: [
      { label: 'Less or Equal', preview: '<=', latex: '\\leq' },
      { label: 'Greater or Equal', preview: '>=', latex: '\\geq' },
      { label: 'Not Equal', preview: '!=', latex: '\\neq' },
      { label: 'Approximate', preview: 'approx', latex: '\\approx' },
      { label: 'Infinity', preview: 'inf', latex: '\\infty' },
      { label: 'Arrow', preview: '->', latex: '\\to' },
    ],
  },
  {
    title: 'Templates',
    accent: 'blue',
    items: [
      { label: 'Limit', preview: 'lim', latex: '\\lim' },
      { label: 'Sine', preview: 'sin', latex: '\\sin' },
      { label: 'Logarithm', preview: 'log', latex: '\\log' },
      { label: 'Matrix', preview: 'matrix' },
      { label: 'Summation', preview: 'sum' },
      { label: 'Integral', preview: 'int' },
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
  <div class="fx-ribbon" data-role="formula-ribbon">
    <div class="fx-ribbon-topbar">
      <div class="fx-ribbon-badge">Equation</div>
      <div class="fx-ribbon-tabs">
        <button type="button" class="fx-ribbon-tab is-active">Structures</button>
        <button type="button" class="fx-ribbon-tab">Symbols</button>
        <button type="button" class="fx-ribbon-tab">Matrices</button>
        <button type="button" class="fx-ribbon-tab">Templates</button>
      </div>
      <div class="fx-ribbon-note">WPS-inspired ribbon layout. Some tiles are placeholders for future SDK features.</div>
    </div>
    <div class="fx-toolbar fx-ribbon-groups">
      ${RIBBON_GROUPS.map(
        (group) => `
        <section class="fx-ribbon-group fx-ribbon-group--${group.accent ?? 'teal'}">
          <div class="fx-ribbon-grid">
            ${group.items
              .map((item) => {
                const attributes = item.command
                  ? `data-command="${item.command}"`
                  : item.latex
                    ? `data-latex="${item.latex}"`
                    : 'data-disabled="true"';

                return `
                <button type="button" class="fx-ribbon-tile" ${attributes}>
                  <span class="fx-ribbon-preview">${item.preview}</span>
                  <span class="fx-ribbon-label">${item.label}</span>
                </button>
              `;
              })
              .join('')}
          </div>
          <div class="fx-ribbon-group-title">${group.title}</div>
        </section>
      `,
      ).join('')}
    </div>
  </div>
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
