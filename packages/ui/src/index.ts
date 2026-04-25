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

export type Locale = 'en' | 'zh';

const translations = {
  en: {
    equation: 'Equation',
    structures: 'Structures',
    symbols: 'Symbols',
    matrices: 'Matrices',
    templates: 'Templates',
    insert: 'Insert',
    greek: 'Greek',
    operators: 'Operators',
    relations: 'Relations',
    arrows: 'Arrows',
    functions: 'Functions',
    misc: 'Misc',
    fraction: 'Fraction',
    superscript: 'Superscript',
    subscript: 'Subscript',
    squareRoot: 'Square Root',
    parentheses: 'Parentheses',
    plusMinus: 'Plus Minus',
    multiply: 'Multiply',
    divide: 'Divide',
    dot: 'Dot',
    union: 'Union',
    intersect: 'Intersection',
    lessOrEqual: 'Less or Equal',
    greaterOrEqual: 'Greater or Equal',
    notEqual: 'Not Equal',
    approximate: 'Approximate',
    infinity: 'Infinity',
    arrow: 'Arrow',
    limit: 'Limit',
    sine: 'Sine',
    logarithm: 'Logarithm',
    matrix: 'Matrix',
    summation: 'Summation',
    integral: 'Integral',
    determinant: 'Determinant',
    derivative: 'Partial',
    nabla: 'Nabla',
    forall: 'For All',
    exists: 'Exists',
    placeholder: 'Formula tools provide common structures and symbols.',
  },
  zh: {
    equation: '公式',
    structures: '结构',
    symbols: '符号',
    matrices: '矩阵',
    templates: '模板',
    insert: '插入',
    greek: '希腊字母',
    operators: '运算符',
    relations: '关系',
    arrows: '箭头',
    functions: '函数',
    misc: '其他',
    fraction: '分数',
    superscript: '上标',
    subscript: '下标',
    squareRoot: '平方根',
    parentheses: '括号',
    plusMinus: '加减',
    multiply: '乘号',
    divide: '除号',
    dot: '点乘',
    union: '并集',
    intersect: '交集',
    lessOrEqual: '小于等于',
    greaterOrEqual: '大于等于',
    notEqual: '不等于',
    approximate: '约等于',
    infinity: '无穷',
    arrow: '箭头',
    limit: '极限',
    sine: '正弦',
    logarithm: '对数',
    matrix: '矩阵',
    summation: '求和',
    integral: '积分',
    determinant: '行列式',
    derivative: '偏导',
    nabla: '梯度',
    forall: '任意',
    exists: '存在',
    placeholder: '公式工具区提供常用结构与符号入口。',
  },
} as const;

type TranslationKey = keyof (typeof translations)['en'];

export interface ToolbarAction {
  id: string;
  label: string;
  command: FormulaCommand;
}

export interface RibbonTemplate {
  label: string;
  preview: string;
  icon?: string;
  command?: string;
  latex?: string;
}

export interface RibbonGroup {
  title: string;
  accent?: 'teal' | 'gold' | 'green' | 'red' | 'blue';
  items: RibbonTemplate[];
}

export interface RibbonPanel {
  id: string;
  label: string;
  groups: RibbonGroup[];
}

const t = (locale: Locale, key: TranslationKey): string => translations[locale][key] ?? translations.en[key];

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

export const createToolbarActions = (locale: Locale = 'en'): ToolbarAction[] => [
  { id: 'fraction', label: t(locale, 'fraction'), command: insertFraction() },
  { id: 'sup', label: t(locale, 'superscript'), command: insertSuperscript() },
  { id: 'sub', label: t(locale, 'subscript'), command: insertSubscript() },
  { id: 'sqrt', label: t(locale, 'squareRoot'), command: insertSqrt() },
  { id: 'fence', label: t(locale, 'parentheses'), command: insertFenced() },
];

export const RIBBON_GROUPS = (locale: Locale = 'en'): RibbonGroup[] => [
  {
    title: t(locale, 'insert'),
    accent: 'teal',
    items: [
      { label: t(locale, 'fraction'), preview: 'a/b', icon: 'a/b', command: 'fraction' },
      { label: t(locale, 'superscript'), preview: 'x^2', icon: 'x²', command: 'sup' },
      { label: t(locale, 'subscript'), preview: 'x_i', icon: 'xᵢ', command: 'sub' },
      { label: t(locale, 'squareRoot'), preview: 'sqrt', icon: '√x', command: 'sqrt' },
      { label: t(locale, 'parentheses'), preview: '( )', icon: '( )', command: 'fence' },
    ],
  },
  {
    title: t(locale, 'greek'),
    accent: 'gold',
    items: [
      { label: 'alpha', preview: 'alpha', icon: 'α', latex: '\\alpha' },
      { label: 'beta', preview: 'beta', icon: 'β', latex: '\\beta' },
      { label: 'gamma', preview: 'gamma', icon: 'γ', latex: '\\gamma' },
      { label: 'delta', preview: 'delta', icon: 'δ', latex: '\\delta' },
      { label: 'epsilon', preview: 'epsilon', icon: 'ε', latex: '\\epsilon' },
      { label: 'theta', preview: 'theta', icon: 'θ', latex: '\\theta' },
      { label: 'lambda', preview: 'lambda', icon: 'λ', latex: '\\lambda' },
      { label: 'mu', preview: 'mu', icon: 'μ', latex: '\\mu' },
      { label: 'pi', preview: 'pi', icon: 'π', latex: '\\pi' },
      { label: 'sigma', preview: 'sigma', icon: 'σ', latex: '\\sigma' },
      { label: 'phi', preview: 'phi', icon: 'φ', latex: '\\phi' },
      { label: 'psi', preview: 'psi', icon: 'ψ', latex: '\\psi' },
      { label: 'omega', preview: 'omega', icon: 'ω', latex: '\\omega' },
      { label: 'Gamma', preview: 'Gamma', icon: 'Γ', latex: '\\Gamma' },
      { label: 'Delta', preview: 'Delta', icon: 'Δ', latex: '\\Delta' },
      { label: 'Theta', preview: 'Theta', icon: 'Θ', latex: '\\Theta' },
      { label: 'Lambda', preview: 'Lambda', icon: 'Λ', latex: '\\Lambda' },
      { label: 'Pi', preview: 'Pi', icon: 'Π', latex: '\\Pi' },
      { label: 'Sigma', preview: 'Sigma', icon: 'Σ', latex: '\\Sigma' },
      { label: 'Phi', preview: 'Phi', icon: 'Φ', latex: '\\Phi' },
      { label: 'Psi', preview: 'Psi', icon: 'Ψ', latex: '\\Psi' },
      { label: 'Omega', preview: 'Omega', icon: 'Ω', latex: '\\Omega' },
    ],
  },
  {
    title: t(locale, 'operators'),
    accent: 'green',
    items: [
      { label: t(locale, 'plusMinus'), preview: 'plus/minus', icon: '±', latex: '\\pm' },
      { label: 'Minus Plus', preview: 'minus/plus', icon: '∓', latex: '\\mp' },
      { label: t(locale, 'multiply'), preview: 'times', icon: '×', latex: '\\times' },
      { label: t(locale, 'divide'), preview: 'divide', icon: '÷', latex: '\\div' },
      { label: t(locale, 'dot'), preview: 'dot', icon: '·', latex: '\\cdot' },
      { label: 'Asterisk', preview: 'ast', icon: '∗', latex: '\\ast' },
      { label: 'Star', preview: 'star', icon: '⋆', latex: '\\star' },
      { label: 'Circle', preview: 'circ', icon: '∘', latex: '\\circ' },
      { label: 'Bullet', preview: 'bullet', icon: '•', latex: '\\bullet' },
      { label: t(locale, 'union'), preview: 'union', icon: '∪', latex: '\\cup' },
      { label: t(locale, 'intersect'), preview: 'intersect', icon: '∩', latex: '\\cap' },
      { label: 'Vee', preview: 'vee', icon: '∨', latex: '\\vee' },
      { label: 'Wedge', preview: 'wedge', icon: '∧', latex: '\\wedge' },
      { label: 'Setminus', preview: 'setminus', icon: '∖', latex: '\\setminus' },
    ],
  },
  {
    title: t(locale, 'relations'),
    accent: 'red',
    items: [
      { label: t(locale, 'lessOrEqual'), preview: '<=', icon: '≤', latex: '\\leq' },
      { label: t(locale, 'greaterOrEqual'), preview: '>=', icon: '≥', latex: '\\geq' },
      { label: t(locale, 'notEqual'), preview: '!=', icon: '≠', latex: '\\neq' },
      { label: t(locale, 'approximate'), preview: 'approx', icon: '≈', latex: '\\approx' },
      { label: 'Equivalent', preview: 'equiv', icon: '≡', latex: '\\equiv' },
      { label: 'Similar', preview: 'sim', icon: '∼', latex: '\\sim' },
      { label: 'Simeq', preview: 'simeq', icon: '≃', latex: '\\simeq' },
      { label: 'Congruent', preview: 'cong', icon: '≅', latex: '\\cong' },
      { label: 'Perpendicular', preview: 'perp', icon: '⊥', latex: '\\perp' },
      { label: 'Parallel', preview: 'parallel', icon: '∥', latex: '\\parallel' },
      { label: 'Proportional', preview: 'propto', icon: '∝', latex: '\\propto' },
      { label: 'Leqslant', preview: 'leqslant', icon: '⩽', latex: '\\leqslant' },
      { label: 'Geqslant', preview: 'geqslant', icon: '⩾', latex: '\\geqslant' },
    ],
  },
  {
    title: t(locale, 'arrows'),
    accent: 'blue',
    items: [
      { label: t(locale, 'arrow'), preview: 'to', icon: '→', latex: '\\to' },
      { label: 'Gets', preview: 'gets', icon: '←', latex: '\\gets' },
      { label: 'Left Right', preview: 'leftrightarrow', icon: '↔', latex: '\\leftrightarrow' },
      { label: 'Right Arrow', preview: 'rightarrow', icon: '→', latex: '\\rightarrow' },
      { label: 'Left Arrow', preview: 'leftarrow', icon: '←', latex: '\\leftarrow' },
      { label: 'Implies', preview: 'Rightarrow', icon: '⇒', latex: '\\Rightarrow' },
      { label: 'Implied By', preview: 'Leftarrow', icon: '⇐', latex: '\\Leftarrow' },
      { label: 'Equivalent To', preview: 'Leftrightarrow', icon: '⇔', latex: '\\Leftrightarrow' },
      { label: 'Mapsto', preview: 'mapsto', icon: '↦', latex: '\\mapsto' },
      { label: 'Long Mapsto', preview: 'longmapsto', icon: '⟼', latex: '\\longmapsto' },
      { label: 'North East', preview: 'nearrow', icon: '↗', latex: '\\nearrow' },
      { label: 'South East', preview: 'searrow', icon: '↘', latex: '\\searrow' },
      { label: 'South West', preview: 'swarrow', icon: '↙', latex: '\\swarrow' },
      { label: 'North West', preview: 'nwarrow', icon: '↖', latex: '\\nwarrow' },
    ],
  },
  {
    title: t(locale, 'functions'),
    accent: 'blue',
    items: [
      { label: t(locale, 'sine'), preview: 'sin', icon: 'sin', latex: '\\sin' },
      { label: 'Cosine', preview: 'cos', icon: 'cos', latex: '\\cos' },
      { label: 'Tangent', preview: 'tan', icon: 'tan', latex: '\\tan' },
      { label: 'Cotangent', preview: 'cot', icon: 'cot', latex: '\\cot' },
      { label: 'Secant', preview: 'sec', icon: 'sec', latex: '\\sec' },
      { label: 'Cosecant', preview: 'csc', icon: 'csc', latex: '\\csc' },
      { label: 'Arcsine', preview: 'arcsin', icon: 'arcsin', latex: '\\arcsin' },
      { label: 'Arccosine', preview: 'arccos', icon: 'arccos', latex: '\\arccos' },
      { label: 'Arctangent', preview: 'arctan', icon: 'arctan', latex: '\\arctan' },
      { label: 'Sinh', preview: 'sinh', icon: 'sinh', latex: '\\sinh' },
      { label: 'Cosh', preview: 'cosh', icon: 'cosh', latex: '\\cosh' },
      { label: 'Tanh', preview: 'tanh', icon: 'tanh', latex: '\\tanh' },
      { label: t(locale, 'logarithm'), preview: 'log', icon: 'log', latex: '\\log' },
      { label: 'Ln', preview: 'ln', icon: 'ln', latex: '\\ln' },
      { label: 'Exp', preview: 'exp', icon: 'exp', latex: '\\exp' },
      { label: t(locale, 'limit'), preview: 'lim', icon: 'lim', latex: '\\lim' },
      { label: t(locale, 'determinant'), preview: 'det', icon: 'det', latex: '\\det' },
      { label: 'Dimension', preview: 'dim', icon: 'dim', latex: '\\dim' },
      { label: 'Degree', preview: 'deg', icon: 'deg', latex: '\\deg' },
      { label: 'Maximum', preview: 'max', icon: 'max', latex: '\\max' },
      { label: 'Minimum', preview: 'min', icon: 'min', latex: '\\min' },
    ],
  },
  {
    title: t(locale, 'misc'),
    accent: 'gold',
    items: [
      { label: t(locale, 'infinity'), preview: 'inf', icon: '∞', latex: '\\infty' },
      { label: 'Aleph', preview: 'aleph', icon: 'ℵ', latex: '\\aleph' },
      { label: 'Weierstrass', preview: 'wp', icon: '℘', latex: '\\wp' },
      { label: 'Real', preview: 'Re', icon: 'ℜ', latex: '\\Re' },
      { label: 'Imaginary', preview: 'Im', icon: 'ℑ', latex: '\\Im' },
      { label: t(locale, 'derivative'), preview: 'partial', icon: '∂', latex: '\\partial' },
      { label: t(locale, 'nabla'), preview: 'nabla', icon: '∇', latex: '\\nabla' },
      { label: t(locale, 'forall'), preview: 'forall', icon: '∀', latex: '\\forall' },
      { label: t(locale, 'exists'), preview: 'exists', icon: '∃', latex: '\\exists' },
      { label: 'Negation', preview: 'neg', icon: '¬', latex: '\\neg' },
      { label: 'Prime', preview: 'prime', icon: '′', latex: '\\prime' },
      { label: 'Double Prime', preview: 'dprime', icon: '″', latex: '\\dprime' },
      { label: 'Triangle', preview: 'triangle', icon: '△', latex: '\\triangle' },
      { label: 'Square', preview: 'square', icon: '□', latex: '\\square' },
      { label: 'Flat', preview: 'flat', icon: '♭', latex: '\\flat' },
      { label: 'Natural', preview: 'natural', icon: '♮', latex: '\\natural' },
      { label: 'Sharp', preview: 'sharp', icon: '♯', latex: '\\sharp' },
      { label: 'Dagger', preview: 'dag', icon: '†', latex: '\\dag' },
      { label: 'Double Dagger', preview: 'ddag', icon: '‡', latex: '\\ddag' },
    ],
  },
  {
    title: t(locale, 'templates'),
    accent: 'blue',
    items: [
      { label: t(locale, 'matrix'), preview: 'matrix', icon: '□', latex: '\\matrix' },
      { label: t(locale, 'summation'), preview: 'sum', icon: '∑', latex: '\\sum' },
      { label: t(locale, 'integral'), preview: 'int', icon: '∫', latex: '\\int' },
    ],
  },
];

export const RIBBON_PANELS = (locale: Locale = 'en'): RibbonPanel[] => {
  const groups = RIBBON_GROUPS(locale);
  const [insertGroup, greekGroup, operatorsGroup, relationsGroup, arrowsGroup, functionsGroup, miscGroup, templatesGroup] =
    groups;

  return [
    {
      id: 'structures',
      label: t(locale, 'structures'),
      groups: [insertGroup],
    },
    {
      id: 'symbols',
      label: t(locale, 'symbols'),
      groups: [greekGroup, operatorsGroup, relationsGroup, arrowsGroup, miscGroup],
    },
    {
      id: 'matrices',
      label: t(locale, 'matrices'),
      groups: [
        {
          title: t(locale, 'matrices'),
          accent: 'blue',
          items: [
            { label: t(locale, 'matrix'), preview: '2x2', icon: '□', latex: '\\matrix' },
            { label: '3x3', preview: '3x3', icon: '▦', latex: '\\matrix' },
            { label: 'det', preview: '|A|', icon: '|A|', latex: '\\det' },
            { label: 'cases', preview: '{ }', icon: '{ }' },
          ],
        },
      ],
    },
    {
      id: 'templates',
      label: t(locale, 'templates'),
      groups: [functionsGroup, templatesGroup],
    },
  ];
};

export const createSymbolCommand = (latex: string): FormulaCommand => {
  const command = latex.startsWith('\\') ? latex.slice(1) : latex;
  const symbol = latexCommandToSymbol(command);
  return insertText(symbol ?? latex);
};

export const renderToolbar = (locale: Locale = 'en'): string => {
  const panels = RIBBON_PANELS(locale);
  return `
  <div class="fx-ribbon" data-role="formula-ribbon">
    <div class="fx-ribbon-topbar">
      <div class="fx-ribbon-tabs">
        ${panels
          .map(
            (panel, index) => `
          <button
            type="button"
            class="fx-ribbon-tab${index === 0 ? ' is-active' : ''}"
            data-panel-target="${panel.id}"
            aria-selected="${index === 0 ? 'true' : 'false'}"
          >
            ${panel.label}
          </button>
        `,
          )
          .join('')}
      </div>
      <div class="fx-ribbon-note">${t(locale, 'placeholder')}</div>
    </div>
    ${panels
      .map(
        (panel, panelIndex) => `
      <div
        class="fx-toolbar fx-ribbon-groups${panelIndex === 0 ? ' is-active' : ''}"
        data-panel-id="${panel.id}"
        ${panelIndex === 0 ? '' : 'hidden'}
      >
        ${panel.groups
          .map(
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
                  const label = escapeHtml(item.label);
                  const icon = escapeHtml(item.icon ?? item.preview);

                  return `
                  <button type="button" class="fx-ribbon-tile" ${attributes} aria-label="${label}" title="${label}">
                    <span class="fx-ribbon-preview" aria-hidden="true">${icon}</span>
                    <span class="fx-ribbon-label">${label}</span>
                  </button>
                `;
                })
                .join('')}
            </div>
            <div class="fx-ribbon-group-title">${group.title}</div>
          </section>
        `,
          )
          .join('')}
      </div>
    `,
      )
      .join('')}
  </div>
`;
};

export const renderModal = (title: string, content: string): string =>
  `
  <div class="fx-modal" role="dialog" aria-modal="true">
    <div class="fx-modal-card">
      <h3>${title}</h3>
      <div>${content}</div>
    </div>
  </div>
`;
