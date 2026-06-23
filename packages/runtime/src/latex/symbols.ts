export const LATEX_SYMBOLS: Record<string, string> = {
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  theta: 'θ',
  lambda: 'λ',
  mu: 'μ',
  pi: 'π',
  sigma: 'σ',
  phi: 'φ',
  omega: 'ω',
  Gamma: 'Γ',
  Delta: 'Δ',
  Theta: 'Θ',
  Lambda: 'Λ',
  Pi: 'Π',
  Sigma: 'Σ',
  Phi: 'Φ',
  Omega: 'Ω',
  leq: '≤',
  geq: '≥',
  neq: '≠',
  approx: '≈',
  infty: '∞',
  cdot: '·',
  times: '×',
  div: '÷',
  pm: '±',
};

export const SYMBOL_TO_LATEX = Object.entries(LATEX_SYMBOLS).reduce<Record<string, string>>(
  (result, [command, symbol]) => {
    if (!(symbol in result)) {
      result[symbol] = command;
    }
    return result;
  },
  {},
);
