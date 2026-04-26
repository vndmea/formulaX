/**
 * @deprecated This package is transitional and no longer the final toolbar source.
 * The final toolbar implementation is now in @formulax/kity-toolbar.
 * This package will be removed after the migration is complete.
 */

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

const symbolItem = (label: string, latex: string, icon?: string): RibbonTemplate => ({
  label,
  preview: label,
  icon: icon ?? latexCommandToSymbol(latex.slice(1)) ?? label,
  latex,
});

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
      symbolItem('alpha', '\\alpha'),
      symbolItem('beta', '\\beta'),
      symbolItem('gamma', '\\gamma'),
      symbolItem('delta', '\\delta'),
      symbolItem('epsilon', '\\epsilon'),
      symbolItem('theta', '\\theta'),
      symbolItem('lambda', '\\lambda'),
      symbolItem('mu', '\\mu'),
      symbolItem('pi', '\\pi'),
      symbolItem('sigma', '\\sigma'),
      symbolItem('phi', '\\phi'),
      symbolItem('psi', '\\psi'),
      symbolItem('omega', '\\omega'),
      symbolItem('Gamma', '\\Gamma'),
      symbolItem('Delta', '\\Delta'),
      symbolItem('Theta', '\\Theta'),
      symbolItem('Lambda', '\\Lambda'),
      symbolItem('Pi', '\\Pi'),
      symbolItem('Sigma', '\\Sigma'),
      symbolItem('Phi', '\\Phi'),
      symbolItem('Psi', '\\Psi'),
      symbolItem('Omega', '\\Omega'),
    ],
  },
  {
    title: t(locale, 'operators'),
    accent: 'green',
    items: [
      symbolItem(t(locale, 'plusMinus'), '\\pm'),
      symbolItem('Minus Plus', '\\mp'),
      symbolItem(t(locale, 'multiply'), '\\times'),
      symbolItem(t(locale, 'divide'), '\\div'),
      symbolItem(t(locale, 'dot'), '\\cdot'),
      symbolItem('Asterisk', '\\ast'),
      symbolItem('Star', '\\star'),
      symbolItem('Circle', '\\circ'),
      symbolItem('Bullet', '\\bullet'),
      symbolItem(t(locale, 'union'), '\\cup'),
      symbolItem(t(locale, 'intersect'), '\\cap'),
      symbolItem('Vee', '\\vee'),
      symbolItem('Wedge', '\\wedge'),
      symbolItem('Setminus', '\\setminus'),
    ],
  },
  {
    title: t(locale, 'relations'),
    accent: 'red',
    items: [
      symbolItem(t(locale, 'lessOrEqual'), '\\leq'),
      symbolItem(t(locale, 'greaterOrEqual'), '\\geq'),
      symbolItem(t(locale, 'notEqual'), '\\neq'),
      symbolItem(t(locale, 'approximate'), '\\approx'),
      symbolItem('Equivalent', '\\equiv'),
      symbolItem('Similar', '\\sim'),
      symbolItem('Simeq', '\\simeq'),
      symbolItem('Congruent', '\\cong'),
      symbolItem('Perpendicular', '\\perp'),
      symbolItem('Parallel', '\\parallel'),
      symbolItem('Proportional', '\\propto'),
      symbolItem('Leqslant', '\\leqslant'),
      symbolItem('Geqslant', '\\geqslant'),
    ],
  },
  {
    title: t(locale, 'arrows'),
    accent: 'blue',
    items: [
      symbolItem(t(locale, 'arrow'), '\\to'),
      symbolItem('Gets', '\\gets'),
      symbolItem('Left Right', '\\leftrightarrow'),
      symbolItem('Right Arrow', '\\rightarrow'),
      symbolItem('Left Arrow', '\\leftarrow'),
      symbolItem('Implies', '\\Rightarrow'),
      symbolItem('Implied By', '\\Leftarrow'),
      symbolItem('Equivalent To', '\\Leftrightarrow'),
      symbolItem('Mapsto', '\\mapsto'),
      symbolItem('Long Mapsto', '\\longmapsto'),
      symbolItem('North East', '\\nearrow'),
      symbolItem('South East', '\\searrow'),
      symbolItem('South West', '\\swarrow'),
      symbolItem('North West', '\\nwarrow'),
    ],
  },
  {
    title: t(locale, 'functions'),
    accent: 'blue',
    items: [
      symbolItem(t(locale, 'sine'), '\\sin', 'sin'),
      symbolItem('Cosine', '\\cos', 'cos'),
      symbolItem('Tangent', '\\tan', 'tan'),
      symbolItem('Cotangent', '\\cot', 'cot'),
      symbolItem('Secant', '\\sec', 'sec'),
      symbolItem('Cosecant', '\\csc', 'csc'),
      symbolItem('Arcsine', '\\arcsin', 'arcsin'),
      symbolItem('Arccosine', '\\arccos', 'arccos'),
      symbolItem('Arctangent', '\\arctan', 'arctan'),
      symbolItem('Sinh', '\\sinh', 'sinh'),
      symbolItem('Cosh', '\\cosh', 'cosh'),
      symbolItem('Tanh', '\\tanh', 'tanh'),
      symbolItem(t(locale, 'logarithm'), '\\log', 'log'),
      symbolItem('Ln', '\\ln', 'ln'),
      symbolItem('Exp', '\\exp', 'exp'),
      symbolItem(t(locale, 'limit'), '\\lim', 'lim'),
      symbolItem(t(locale, 'determinant'), '\\det', 'det'),
      symbolItem('Dimension', '\\dim', 'dim'),
      symbolItem('Degree', '\\deg', 'deg'),
      symbolItem('Maximum', '\\max', 'max'),
      symbolItem('Minimum', '\\min', 'min'),
    ],
  },
  {
    title: t(locale, 'misc'),
    accent: 'gold',
    items: [
      symbolItem(t(locale, 'infinity'), '\\infty'),
      symbolItem('Aleph', '\\aleph'),
      symbolItem('Weierstrass', '\\wp'),
      symbolItem('Real', '\\Re'),
      symbolItem('Imaginary', '\\Im'),
      symbolItem(t(locale, 'derivative'), '\\partial'),
      symbolItem(t(locale, 'nabla'), '\\nabla'),
      symbolItem(t(locale, 'forall'), '\\forall'),
      symbolItem(t(locale, 'exists'), '\\exists'),
      symbolItem('Negation', '\\neg'),
      symbolItem('Prime', '\\prime'),
      symbolItem('Double Prime', '\\dprime'),
      symbolItem('Triangle', '\\triangle'),
      symbolItem('Square', '\\square'),
      symbolItem('Flat', '\\flat'),
      symbolItem('Natural', '\\natural'),
      symbolItem('Sharp', '\\sharp'),
      symbolItem('Dagger', '\\dag'),
      symbolItem('Double Dagger', '\\ddag'),
    ],
  },
  {
    title: t(locale, 'templates'),
    accent: 'blue',
    items: [
      symbolItem(t(locale, 'matrix'), '\\matrix', '□'),
      symbolItem(t(locale, 'summation'), '\\sum'),
      symbolItem(t(locale, 'integral'), '\\int'),
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
            symbolItem(t(locale, 'matrix'), '\\matrix', '□'),
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
