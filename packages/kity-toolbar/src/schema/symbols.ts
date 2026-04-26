export interface SymbolItem {
  id: string;
  label: string;
  latex: string;
  category: string;
}

export interface SymbolCategory {
  id: string;
  label: string;
  symbols: SymbolItem[];
}

export const GREEK_CATEGORY: SymbolCategory = {
  id: 'greek',
  label: 'Greek',
  symbols: [
    { id: 'alpha', label: 'α', latex: '\\alpha', category: 'greek' },
    { id: 'beta', label: 'β', latex: '\\beta', category: 'greek' },
    { id: 'gamma', label: 'γ', latex: '\\gamma', category: 'greek' },
    { id: 'delta', label: 'δ', latex: '\\delta', category: 'greek' },
    { id: 'epsilon', label: 'ε', latex: '\\epsilon', category: 'greek' },
    { id: 'theta', label: 'θ', latex: '\\theta', category: 'greek' },
    { id: 'lambda', label: 'λ', latex: '\\lambda', category: 'greek' },
    { id: 'mu', label: 'μ', latex: '\\mu', category: 'greek' },
    { id: 'pi', label: 'π', latex: '\\pi', category: 'greek' },
    { id: 'sigma', label: 'σ', latex: '\\sigma', category: 'greek' },
  ],
};

export const OPERATORS_CATEGORY: SymbolCategory = {
  id: 'operators',
  label: 'Operators',
  symbols: [
    { id: 'plus', label: '+', latex: '+', category: 'operators' },
    { id: 'minus', label: '−', latex: '-', category: 'operators' },
    { id: 'times', label: '×', latex: '\\times', category: 'operators' },
    { id: 'divide', label: '÷', latex: '\\div', category: 'operators' },
    { id: 'pm', label: '±', latex: '\\pm', category: 'operators' },
    { id: 'cdot', label: '·', latex: '\\cdot', category: 'operators' },
  ],
};

export const RELATIONS_CATEGORY: SymbolCategory = {
  id: 'relations',
  label: 'Relations',
  symbols: [
    { id: 'equals', label: '=', latex: '=', category: 'relations' },
    { id: 'neq', label: '≠', latex: '\\neq', category: 'relations' },
    { id: 'leq', label: '≤', latex: '\\leq', category: 'relations' },
    { id: 'geq', label: '≥', latex: '\\geq', category: 'relations' },
    { id: 'approx', label: '≈', latex: '\\approx', category: 'relations' },
  ],
};

export const ARROWS_CATEGORY: SymbolCategory = {
  id: 'arrows',
  label: 'Arrows',
  symbols: [
    { id: 'rightarrow', label: '→', latex: '\\rightarrow', category: 'arrows' },
    { id: 'leftarrow', label: '←', latex: '\\leftarrow', category: 'arrows' },
    { id: 'uparrow', label: '↑', latex: '\\uparrow', category: 'arrows' },
    { id: 'downarrow', label: '↓', latex: '\\downarrow', category: 'arrows' },
  ],
};

export const MISC_CATEGORY: SymbolCategory = {
  id: 'misc',
  label: 'Misc',
  symbols: [
    { id: 'infty', label: '∞', latex: '\\infty', category: 'misc' },
    { id: 'partial', label: '∂', latex: '\\partial', category: 'misc' },
    { id: 'forall', label: '∀', latex: '\\forall', category: 'misc' },
    { id: 'exists', label: '∃', latex: '\\exists', category: 'misc' },
  ],
};

export const SYMBOL_CATEGORIES: SymbolCategory[] = [
  GREEK_CATEGORY,
  OPERATORS_CATEGORY,
  RELATIONS_CATEGORY,
  ARROWS_CATEGORY,
  MISC_CATEGORY,
];

export const VISIBLE_SYMBOL_COUNT = 6;
