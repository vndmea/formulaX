import {
  DEFAULT_FORMULAX_LOCALE,
  normalizeFormulaXLocale,
  type FormulaXLocale,
} from '@formulaxjs/core';

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

const symbol = (latex: string, title?: string): RuntimeToolbarItemTemplate => ({
  id: createStableId(latex),
  kind: 'symbol',
  latex,
  title: text(title ?? latex, title ?? latex),
});

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
        items: [
          symbol('\\pm', '±'),
          symbol('\\infty', '∞'),
          symbol('='),
          symbol('\\sim', '∼'),
          symbol('\\times', '×'),
          symbol('\\div', '÷'),
          symbol('!'),
          symbol('<'),
          symbol('\\ll', '≪'),
          symbol('>'),
          symbol('\\gg', '≫'),
          symbol('\\leq', '≤'),
          symbol('\\geq', '≥'),
          symbol('\\mp', '∓'),
          symbol('\\cong', '≅'),
          symbol('\\equiv', '≡'),
          symbol('\\propto', '∝'),
          symbol('\\approx', '≈'),
          symbol('\\forall', '∀'),
          symbol('\\partial', '∂'),
          symbol('\\cup', '∪'),
          symbol('\\cap', '∩'),
          symbol('\\varnothing', '∅'),
          symbol('\\in', '∈'),
          symbol('\\ni', '∋'),
          symbol('\\to', '→'),
          symbol('\\leftarrow', '←'),
          symbol('\\uparrow', '↑'),
          symbol('\\downarrow', '↓'),
          symbol('\\leftrightarrow', '↔'),
          symbol('\\therefore', '∴'),
          symbol('\\because', '∵'),
          symbol('+'),
          symbol('-'),
          symbol('\\neg', '¬'),
          symbol('\\cdot', '·'),
          symbol('\\vdots', '⋮'),
        ],
      },
      {
        id: 'greek',
        title: text('Greek letters', '希腊字母'),
        items: [
          symbol('\\alpha', 'α'),
          symbol('\\beta', 'β'),
          symbol('\\gamma', 'γ'),
          symbol('\\delta', 'δ'),
          symbol('\\epsilon', 'ε'),
          symbol('\\theta', 'θ'),
          symbol('\\lambda', 'λ'),
          symbol('\\mu', 'μ'),
          symbol('\\pi', 'π'),
          symbol('\\sigma', 'σ'),
          symbol('\\phi', 'φ'),
          symbol('\\omega', 'ω'),
          symbol('\\Gamma', 'Γ'),
          symbol('\\Delta', 'Δ'),
          symbol('\\Theta', 'Θ'),
          symbol('\\Lambda', 'Λ'),
          symbol('\\Pi', 'Π'),
          symbol('\\Sigma', 'Σ'),
          symbol('\\Phi', 'Φ'),
          symbol('\\Omega', 'Ω'),
        ],
      },
      {
        id: 'negated-operators',
        title: text('Negated operators', '求反关系运算符'),
        items: [
          symbol('\\neq', '≠'),
          symbol('\\nless', '≮'),
          symbol('\\ngtr', '≯'),
          symbol('\\nleq', '≰'),
          symbol('\\ngeq', '≱'),
          symbol('\\nsim', '≁'),
          symbol('\\notin', '∉'),
          symbol('\\nsubseteq', '⊈'),
          symbol('\\nsupseteq', '⊉'),
          symbol('\\nparallel', '∦'),
        ],
      },
      {
        id: 'letter-like',
        title: text('Letter-like symbols', '字母类符号'),
        items: [
          symbol('\\aleph', 'ℵ'),
          symbol('\\beth', 'ℶ'),
          symbol('\\ell', 'ℓ'),
          symbol('\\hbar', 'ℏ'),
          symbol('\\wp', '℘'),
          symbol('\\Im', 'ℑ'),
          symbol('\\Re', 'ℜ'),
        ],
      },
      {
        id: 'arrows',
        title: text('Arrows', '箭头'),
        items: [
          symbol('\\gets', '←'),
          symbol('\\to', '→'),
          symbol('\\uparrow', '↑'),
          symbol('\\downarrow', '↓'),
          symbol('\\leftrightarrow', '↔'),
          symbol('\\updownarrow', '↕'),
          symbol('\\Leftarrow', '⇐'),
          symbol('\\Rightarrow', '⇒'),
          symbol('\\Leftrightarrow', '⇔'),
          symbol('\\longleftarrow', '⟵'),
          symbol('\\longrightarrow', '⟶'),
          symbol('\\nearrow', '↗'),
          symbol('\\nwarrow', '↖'),
          symbol('\\searrow', '↘'),
          symbol('\\swarrow', '↙'),
        ],
      },
      {
        id: 'script-styles',
        title: text('Script styles', '手写体'),
        items: [
          symbol('\\mathcal{A}', '𝒜'),
          symbol('\\mathcal{B}', 'ℬ'),
          symbol('\\mathcal{C}', '𝒞'),
          symbol('\\mathcal{D}', '𝒟'),
          symbol('\\mathfrak{A}', '𝔄'),
          symbol('\\mathfrak{B}', '𝔅'),
          symbol('\\mathbb{A}', '𝔸'),
          symbol('\\mathbb{B}', '𝔹'),
          symbol('\\mathrm{A}', 'A'),
          symbol('\\mathrm{B}', 'B'),
        ],
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
