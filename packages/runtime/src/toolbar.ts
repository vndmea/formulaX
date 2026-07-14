import {
  DEFAULT_FORMULAX_LOCALE,
  normalizeFormulaXLocale,
  type FormulaXLocale,
} from '@formulaxjs/core';
import { resolveRuntimeSymbol } from './latex/symbols';

export type RuntimeToolbarItemKind = 'symbol' | 'template';
export type RuntimeToolbarPanelKind = 'dropdown' | 'area';
export type RuntimeToolbarLayout = 'templates' | 'symbols' | 'presets';

export type RuntimeToolbarItem = {
  id: string;
  kind: RuntimeToolbarItemKind;
  title: string;
  label?: string;
  latex: string;
  previewLatex: string;
  previewSize?: {
    width: number;
    height: number;
  };
};

export type RuntimeToolbarGroup = {
  id: string;
  title: string;
  items: RuntimeToolbarItem[];
};

export type RuntimeToolbarPanel = {
  id: string;
  kind: RuntimeToolbarPanelKind;
  layout: RuntimeToolbarLayout;
  label: string;
  width: number;
  groups: RuntimeToolbarGroup[];
  buttonClassName?: string;
};

type LocalizedText = Record<FormulaXLocale, string>;

type RuntimeToolbarItemTemplate = {
  id: string;
  kind?: RuntimeToolbarItemKind;
  title?: LocalizedText;
  label?: LocalizedText;
  latex: string;
  previewLatex?: string;
  previewSize?: RuntimeToolbarItem['previewSize'];
};

type RuntimeToolbarGroupTemplate = {
  id: string;
  title: LocalizedText;
  items: RuntimeToolbarItemTemplate[];
};

type RuntimeToolbarPanelTemplate = {
  id: string;
  kind: RuntimeToolbarPanelKind;
  layout: RuntimeToolbarLayout;
  label: LocalizedText;
  width: number;
  groups: RuntimeToolbarGroupTemplate[];
  buttonClassName?: string;
};

const text = (en_US: string, zh_CN: string): LocalizedText => ({ en_US, zh_CN });

const LEGACY_PREVIEW_SIZES: Record<string, RuntimeToolbarItem['previewSize']> = {
  'x=\\frac {-b\\pm\\sqrt {b^2-4ac}}{2a}': { width: 310, height: 73 },
  '{\\left(x+a\\right)}^2=\\sum^n_{k=0}{\\left(^n_k\\right)x^ka^{n-k}}': { width: 310, height: 73 },
  'a^2+b^2=c^2': { width: 310, height: 73 },
  '\\frac \\placeholder\\placeholder': { width: 56, height: 75 },
  '{\\placeholder/\\placeholder}': { width: 56, height: 75 },
  '\\frac {dy}{dx}': { width: 56, height: 75 },
  '\\frac {\\Delta y}{\\Delta x}': { width: 56, height: 75 },
  '\\frac {\\delta y}{\\delta x}': { width: 56, height: 75 },
  '\\frac \\pi 2': { width: 56, height: 75 },
};

const template = (
  id: string,
  latex: string,
  options: {
    title?: LocalizedText;
    label?: LocalizedText;
    previewLatex?: string;
    previewSize?: RuntimeToolbarItem['previewSize'];
  } = {},
): RuntimeToolbarItemTemplate => ({
  id,
  latex,
  title: options.title,
  label: options.label,
  previewLatex: options.previewLatex,
  previewSize: options.previewSize,
});

const symbol = (
  latex: string,
  title?: string,
  options: {
    previewLatex?: string;
  } = {},
): RuntimeToolbarItemTemplate => ({
  id: createStableId(latex),
  kind: 'symbol',
  latex,
  title: text(title ?? latex, title ?? latex),
  previewLatex: options.previewLatex,
});

const UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

function toLatexSymbol(command: string): string {
  return command.startsWith('\\') || command.length === 1 ? command : `\\${command}`;
}

function createSymbolItems(commands: string[]): RuntimeToolbarItemTemplate[] {
  return commands.map((command) => {
    const latex = toLatexSymbol(command);
    const resolved = resolveRuntimeSymbol(latex);
    return symbol(latex, resolved?.char);
  });
}

function createStyledSymbolItems(
  style: 'mathcal' | 'mathfrak' | 'mathbb' | 'mathrm',
  letters: string[],
): RuntimeToolbarItemTemplate[] {
  return letters.map((letter) => {
    const latex = `\\${style}{${letter}}`;
    const resolved = resolveRuntimeSymbol(latex);
    return symbol(latex, resolved?.char);
  });
}

const BASIC_MATH_SYMBOLS = [
  'pm', 'infty', '=', 'sim', 'times', 'div', '!', '<', 'll', '>',
  'gg', 'leq', 'geq', 'mp', 'cong', 'equiv', 'propto', 'approx',
  'forall', 'partial', 'surd', 'cup', 'cap', 'varnothing', '%',
  'circ', 'exists', 'nexists', 'in', 'ni', 'gets', 'uparrow',
  'to', 'downarrow', 'leftrightarrow', 'therefore', 'because',
  '+', '-', 'neg', 'ast', 'cdot', 'vdots', 'aleph', 'beth', 'blacksquare',
];

const GREEK_LOWERCASE_SYMBOLS = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa',
  'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigma', 'tau', 'upsilon',
  'phi', 'chi', 'psi', 'omega',
];

const GREEK_UPPERCASE_SYMBOLS = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa',
  'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon',
  'Phi', 'Chi', 'Psi', 'Omega',
];

const GREEK_VARIANT_SYMBOLS = [
  'digamma', 'varepsilon', 'varkappa', 'varphi', 'varpi', 'varrho', 'varsigma', 'vartheta',
];

const NEGATED_OPERATOR_SYMBOLS = [
  'neq', 'nless', 'ngtr', 'nleq', 'ngeq', 'nsim', 'lneqq',
  'gneqq', 'nprec', 'nsucc', 'notin', 'nsubseteq', 'nsupseteq',
  'subsetneq', 'supsetneq', 'lnsim', 'gnsim', 'precnsim',
  'succnsim', 'ntriangleleft', 'ntriangleright', 'ntrianglelefteq',
  'ntrianglerighteq', 'nmid', 'nparallel', 'nvdash', 'nVdash',
  'nvDash', 'nVDash', 'nexists',
];

const LETTER_LIKE_SYMBOLS = [
  'aleph', 'beth', 'daleth', 'gimel', 'complement', 'ell', 'eth', 'hbar',
  'hslash', 'mho', 'partial', 'wp', 'circledS', 'Bbbk', 'Finv', 'Game',
  'Im', 'Re',
];

const ARROW_SYMBOLS = [
  'gets', 'to', 'uparrow', 'downarrow', 'leftrightarrow', 'updownarrow',
  'Leftarrow', 'Rightarrow', 'Uparrow', 'Downarrow', 'Leftrightarrow',
  'Updownarrow', 'longleftarrow', 'longrightarrow', 'longleftrightarrow',
  'Longleftarrow', 'Longrightarrow', 'Longleftrightarrow', 'nearrow',
  'nwarrow', 'searrow', 'swarrow', 'nleftarrow', 'nrightarrow',
  'nLeftarrow', 'nRightarrow', 'nLeftrightarrow', 'leftharpoonup',
  'leftharpoondown', 'rightharpoonup', 'rightharpoondown', 'upharpoonleft',
  'upharpoonright', 'downharpoonleft', 'downharpoonright', 'leftrightharpoons',
  'rightleftharpoons', 'leftleftarrows', 'rightrightarrows', 'upuparrows',
  'downdownarrows', 'leftrightarrows', 'rightleftarrows', 'looparrowleft',
  'looparrowright', 'leftarrowtail', 'rightarrowtail', 'Lsh', 'Rsh',
  'Lleftarrow', 'Rrightarrow', 'curvearrowleft', 'curvearrowright',
  'circlearrowleft', 'circlearrowright', 'multimap', 'leftrightsquigarrow',
  'twoheadleftarrow', 'twoheadrightarrow', 'rightsquigarrow',
];

const RUNTIME_TOOLBAR_PANEL_TEMPLATES: RuntimeToolbarPanelTemplate[] = [
  {
    id: 'presets',
    kind: 'dropdown',
    layout: 'presets',
    label: text('Presets<br/>', '预设<br/>'),
    width: 367,
    buttonClassName: 'yushe-btn',
    groups: [
      {
        id: 'preset-formulas',
        title: text('Preset formulas', '预设公式'),
        items: [
          template('quadratic-formula', 'x=\\frac {-b\\pm\\sqrt {b^2-4ac}}{2a}', {
            label: text('Quadratic formula', '二次公式'),
          }),
          template(
            'binomial-theorem',
            '{\\left(x+a\\right)}^2=\\sum^n_{k=0}{\\left(^n_k\\right)x^ka^{n-k}}',
            { label: text('Binomial theorem', '二项式定理') },
          ),
          template('pythagorean-theorem', 'a^2+b^2=c^2', {
            label: text('Pythagorean theorem', '勾股定理'),
          }),
        ],
      },
    ],
  },
  {
    id: 'symbols',
    kind: 'area',
    layout: 'symbols',
    label: text('Symbols', '符号'),
    width: 527,
    groups: [
      {
        id: 'basic-math',
        title: text('Basic math', '基础数学'),
        items: createSymbolItems(BASIC_MATH_SYMBOLS),
      },
      {
        id: 'greek-lowercase',
        title: text('Lowercase', '小写'),
        items: createSymbolItems(GREEK_LOWERCASE_SYMBOLS),
      },
      {
        id: 'greek-uppercase',
        title: text('Uppercase', '大写'),
        items: createSymbolItems(GREEK_UPPERCASE_SYMBOLS),
      },
      {
        id: 'greek-variants',
        title: text('Variants', '变体'),
        items: createSymbolItems(GREEK_VARIANT_SYMBOLS),
      },
      {
        id: 'negated-operators',
        title: text('Negated operators', '求反关系运算符'),
        items: createSymbolItems(NEGATED_OPERATOR_SYMBOLS),
      },
      {
        id: 'letter-like',
        title: text('Letter-like symbols', '字母类符号'),
        items: createSymbolItems(LETTER_LIKE_SYMBOLS),
      },
      {
        id: 'arrows',
        title: text('Arrows', '箭头'),
        items: createSymbolItems(ARROW_SYMBOLS),
      },
      {
        id: 'script-styles-cal',
        title: text('Script', '手写体'),
        items: createStyledSymbolItems('mathcal', UPPERCASE_LETTERS),
      },
      {
        id: 'script-styles-frak',
        title: text('Fraktur', '花体'),
        items: createStyledSymbolItems('mathfrak', [...UPPERCASE_LETTERS, ...LOWERCASE_LETTERS]),
      },
      {
        id: 'script-styles-bb',
        title: text('Double-struck', '双线'),
        items: createStyledSymbolItems('mathbb', UPPERCASE_LETTERS),
      },
      {
        id: 'script-styles-roman',
        title: text('Roman', '罗马'),
        items: createStyledSymbolItems('mathrm', [...UPPERCASE_LETTERS, ...LOWERCASE_LETTERS]),
      },
    ],
  },
  {
    id: 'fraction',
    kind: 'dropdown',
    layout: 'templates',
    label: text('Fraction<br/>', '分数<br/>'),
    width: 332,
    groups: [
      {
        id: 'fractions',
        title: text('Fractions', '分数'),
        items: [
          template('fraction', '\\frac \\placeholder\\placeholder'),
          template('slash-fraction', '{\\placeholder/\\placeholder}'),
        ],
      },
      {
        id: 'common-fractions',
        title: text('Common fractions', '常用分数'),
        items: [
          template('derivative-dy-dx', '\\frac {dy}{dx}'),
          template('delta-y-delta-x', '\\frac {\\Delta y}{\\Delta x}'),
          template('delta-lower-y-delta-lower-x', '\\frac {\\delta y}{\\delta x}'),
          template('pi-over-two', '\\frac \\pi 2'),
        ],
      },
    ],
  },
  {
    id: 'scripts',
    kind: 'dropdown',
    layout: 'templates',
    label: text('Scripts<br/>', '上下标<br/>'),
    width: 332,
    groups: [
      {
        id: 'scripts',
        title: text('Subscripts and superscripts', '上标和下标'),
        items: [
          template('superscript', '\\placeholder^\\placeholder'),
          template('subscript', '\\placeholder_\\placeholder'),
          template('superscript-subscript', '\\placeholder^\\placeholder_\\placeholder'),
          template('left-script', '{^\\placeholder_\\placeholder\\placeholder}'),
        ],
      },
      {
        id: 'common-scripts',
        title: text('Common scripts', '常用的上标和下标'),
        items: [
          template('euler-wave', 'e^{-i\\omega t}'),
          template('x-squared', 'x^2'),
          template('nuclide', '{}^n_1Y'),
        ],
      },
    ],
  },
  {
    id: 'radicals',
    kind: 'dropdown',
    layout: 'templates',
    label: text('Radicals<br/>', '根式<br/>'),
    width: 342,
    groups: [
      {
        id: 'radicals',
        title: text('Radicals', '根式'),
        items: [
          template('square-root', '\\sqrt \\placeholder'),
          template('nth-root', '\\sqrt [\\placeholder] \\placeholder'),
          template('second-root', '\\sqrt [2] \\placeholder'),
          template('third-root', '\\sqrt [3] \\placeholder'),
        ],
      },
      {
        id: 'common-radicals',
        title: text('Common radicals', '常用根式'),
        items: [
          template('quadratic-radical', '\\frac {-b\\pm\\sqrt{b^2-4ac}}{2a}'),
          template('pythagorean-radical', '\\sqrt {a^2+b^2}'),
        ],
      },
    ],
  },
  {
    id: 'integrals',
    kind: 'dropdown',
    layout: 'templates',
    label: text('Integral<br/>', '积分<br/>'),
    width: 332,
    groups: [
      {
        id: 'integrals',
        title: text('Integrals', '积分'),
        items: [
          template('integral', '\\int \\placeholder'),
          template('integral-limits', '\\int^\\placeholder_\\placeholder\\placeholder'),
          template('double-integral', '\\iint\\placeholder'),
          template('double-integral-limits', '\\iint^\\placeholder_\\placeholder\\placeholder'),
          template('triple-integral', '\\iiint\\placeholder'),
          template('triple-integral-limits', '\\iiint^\\placeholder_\\placeholder\\placeholder'),
        ],
      },
    ],
  },
  {
    id: 'large-ops',
    kind: 'dropdown',
    layout: 'templates',
    label: text('Large<br/>ops', '大型<br/>运算符'),
    width: 332,
    groups: [
      {
        id: 'summation',
        title: text('Summation', '求和'),
        items: [
          template('sum', '\\sum\\placeholder'),
          template('sum-limits', '\\sum^\\placeholder_\\placeholder\\placeholder'),
          template('sum-lower', '\\sum_\\placeholder\\placeholder'),
        ],
      },
    ],
  },
  {
    id: 'brackets',
    kind: 'dropdown',
    layout: 'templates',
    label: text('Brackets<br/>', '括号<br/>'),
    width: 332,
    groups: [
      {
        id: 'brackets',
        title: text('Brackets', '方括号'),
        items: [
          template('parentheses', '\\left(\\placeholder\\right)'),
          template('square-brackets', '\\left[\\placeholder\\right]'),
          template('braces', '\\left\\{\\placeholder\\right\\}'),
          template('bars', '\\left|\\placeholder\\right|'),
        ],
      },
    ],
  },
  {
    id: 'functions',
    kind: 'dropdown',
    layout: 'templates',
    label: text('Functions<br/>', '函数<br/>'),
    width: 340,
    groups: [
      {
        id: 'trig-functions',
        title: text('Trigonometric functions', '三角函数'),
        items: [
          template('sin', '\\sin\\placeholder'),
          template('cos', '\\cos\\placeholder'),
          template('tan', '\\tan\\placeholder'),
          template('csc', '\\csc\\placeholder'),
          template('sec', '\\sec\\placeholder'),
          template('cot', '\\cot\\placeholder'),
        ],
      },
      {
        id: 'common-functions',
        title: text('Common functions', '常用函数'),
        items: [
          template('sin-theta', '\\sin\\theta'),
          template('cos-2x', '\\cos{2x}'),
          template('tan-identity', '\\tan\\theta=\\frac {\\sin\\theta}{\\cos\\theta}'),
        ],
      },
    ],
  },
];

export function createRuntimeToolbarPanels(
  locale: string = DEFAULT_FORMULAX_LOCALE,
): RuntimeToolbarPanel[] {
  const normalizedLocale = normalizeFormulaXLocale(locale);
  return RUNTIME_TOOLBAR_PANEL_TEMPLATES.map((panel) => ({
    id: panel.id,
    kind: panel.kind,
    layout: panel.layout,
    label: panel.label[normalizedLocale],
    width: panel.width,
    groups: panel.groups.map((group) => ({
      id: group.id,
      title: group.title[normalizedLocale],
      items: group.items.map((item) => ({
        id: item.id,
        kind: item.kind ?? 'template',
        title: item.title?.[normalizedLocale] ?? item.label?.[normalizedLocale] ?? item.latex,
        label: item.label?.[normalizedLocale],
        latex: item.latex,
    previewLatex: item.previewLatex ?? createPreviewLatex(item.latex),
        previewSize: (item.previewSize ?? LEGACY_PREVIEW_SIZES[item.latex])
          ? {
              width: (item.previewSize ?? LEGACY_PREVIEW_SIZES[item.latex])?.width ?? 1,
              height: (item.previewSize ?? LEGACY_PREVIEW_SIZES[item.latex])?.height ?? 1,
            }
          : undefined,
      })),
    })),
    buttonClassName: panel.buttonClassName,
  }));
}

function createPreviewLatex(latex: string): string {
  return latex.replace(/\s+/g, ' ').trim();
}

function createStableId(value: string): string {
  return value
    .replace(/^\\/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'symbol';
}
