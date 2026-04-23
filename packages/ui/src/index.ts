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
    placeholder: 'WPS-inspired ribbon layout. Some tiles are placeholders for future SDK features.',
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
    fraction: '分数',
    superscript: '上标',
    subscript: '下标',
    squareRoot: '平方根',
    parentheses: '括号',
    plusMinus: '加减',
    multiply: '乘',
    divide: '除',
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
    placeholder: 'WPS 风格的工具栏布局。部分按钮仍是未来 SDK 功能的占位项。',
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
      { label: t(locale, 'fraction'), preview: 'a/b', icon: 'a⁄b', command: 'fraction' },
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
      { label: 'theta', preview: 'theta', icon: 'θ', latex: '\\theta' },
      { label: 'pi', preview: 'pi', icon: 'π', latex: '\\pi' },
      { label: 'sigma', preview: 'sigma', icon: 'σ', latex: '\\sigma' },
    ],
  },
  {
    title: t(locale, 'operators'),
    accent: 'green',
    items: [
      { label: t(locale, 'plusMinus'), preview: 'plus/minus', icon: '±', latex: '\\pm' },
      { label: t(locale, 'multiply'), preview: 'times', icon: '×', latex: '\\times' },
      { label: t(locale, 'divide'), preview: 'divide', icon: '÷', latex: '\\div' },
      { label: t(locale, 'dot'), preview: 'dot', icon: '⋅', latex: '\\cdot' },
      { label: t(locale, 'union'), preview: 'union', icon: '∪', latex: '\\cup' },
      { label: t(locale, 'intersect'), preview: 'intersect', icon: '∩', latex: '\\cap' },
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
      { label: t(locale, 'infinity'), preview: 'inf', icon: '∞', latex: '\\infty' },
      { label: t(locale, 'arrow'), preview: '->', icon: '→', latex: '\\to' },
    ],
  },
  {
    title: t(locale, 'templates'),
    accent: 'blue',
    items: [
      { label: t(locale, 'limit'), preview: 'lim', icon: 'lim', latex: '\\lim' },
      { label: t(locale, 'sine'), preview: 'sin', icon: 'sin', latex: '\\sin' },
      { label: t(locale, 'logarithm'), preview: 'log', icon: 'log', latex: '\\log' },
      { label: t(locale, 'matrix'), preview: 'matrix', icon: '▦' },
      { label: t(locale, 'summation'), preview: 'sum', icon: '∑' },
      { label: t(locale, 'integral'), preview: 'int', icon: '∫' },
    ],
  },
];

export const RIBBON_PANELS = (locale: Locale = 'en'): RibbonPanel[] => {
  const groups = RIBBON_GROUPS(locale);
  const [insertGroup, greekGroup, operatorsGroup, relationsGroup, templatesGroup] = groups;

  return [
    {
      id: 'structures',
      label: t(locale, 'structures'),
      groups: [insertGroup],
    },
    {
      id: 'symbols',
      label: t(locale, 'symbols'),
      groups: [greekGroup, operatorsGroup, relationsGroup],
    },
    {
      id: 'matrices',
      label: t(locale, 'matrices'),
      groups: [
        {
          title: t(locale, 'matrices'),
          accent: 'blue',
          items: [
            { label: t(locale, 'matrix'), preview: '2x2', icon: '▦' },
            { label: '3x3', preview: '3x3', icon: '▦' },
            { label: 'det', preview: '|A|', icon: '|A|' },
            { label: 'cases', preview: '{ }', icon: '{ }' },
          ],
        },
      ],
    },
    {
      id: 'templates',
      label: t(locale, 'templates'),
      groups: [templatesGroup],
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
