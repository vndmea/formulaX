import { doc, fenced, frac, group, sqrt, supsub, text, type FormulaDoc, type FormulaNode } from './ast';

const isAlpha = (char: string): boolean => /[a-zA-Z]/.test(char);

const GREEK_LETTERS: Record<string, string> = {
  alpha: '\u03b1',
  beta: '\u03b2',
  gamma: '\u03b3',
  delta: '\u03b4',
  epsilon: '\u03b5',
  zeta: '\u03b6',
  eta: '\u03b7',
  theta: '\u03b8',
  iota: '\u03b9',
  kappa: '\u03ba',
  lambda: '\u03bb',
  mu: '\u03bc',
  nu: '\u03bd',
  xi: '\u03be',
  omicron: '\u03bf',
  pi: '\u03c0',
  rho: '\u03c1',
  sigma: '\u03c3',
  tau: '\u03c4',
  upsilon: '\u03c5',
  phi: '\u03c6',
  chi: '\u03c7',
  psi: '\u03c8',
  omega: '\u03c9',
  Gamma: '\u0393',
  Delta: '\u0394',
  Theta: '\u0398',
  Lambda: '\u039b',
  Xi: '\u039e',
  Pi: '\u03a0',
  Sigma: '\u03a3',
  Phi: '\u03a6',
  Psi: '\u03a8',
  Omega: '\u03a9',
};

const BINARY_OPERATORS: Record<string, string> = {
  cdot: '\u00b7',
  times: '\u00d7',
  div: '\u00f7',
  pm: '\u00b1',
  mp: '\u2213',
  ast: '\u2217',
  star: '\u22c6',
  circ: '\u2218',
  bullet: '\u2022',
  cup: '\u222a',
  cap: '\u2229',
  vee: '\u2228',
  wedge: '\u2227',
  setminus: '\u2216',
};

const MATH_FUNCTIONS: Record<string, string> = {
  sin: 'sin',
  cos: 'cos',
  tan: 'tan',
  cot: 'cot',
  sec: 'sec',
  csc: 'csc',
  arcsin: 'arcsin',
  arccos: 'arccos',
  arctan: 'arctan',
  sinh: 'sinh',
  cosh: 'cosh',
  tanh: 'tanh',
  log: 'log',
  ln: 'ln',
  exp: 'exp',
  lim: 'lim',
  det: 'det',
  dim: 'dim',
  deg: 'deg',
  max: 'max',
  min: 'min',
};

const RELATIONS: Record<string, string> = {
  leq: '\u2264',
  le: '\u2264',
  ge: '\u2265',
  geq: '\u2265',
  ne: '\u2260',
  neq: '\u2260',
  approx: '\u2248',
  equiv: '\u2261',
  sim: '\u223c',
  simeq: '\u2243',
  cong: '\u2245',
  perp: '\u22a5',
  parallel: '\u2225',
  propto: '\u221d',
  leqslant: '\u2a7d',
  geqslant: '\u2a7e',
};

const ARROWS: Record<string, string> = {
  to: '\u2192',
  gets: '\u2190',
  leftrightarrow: '\u2194',
  rightarrow: '\u2192',
  leftarrow: '\u2190',
  Rightarrow: '\u21d2',
  Leftarrow: '\u21d0',
  Leftrightarrow: '\u21d4',
  mapsto: '\u21a6',
  longmapsto: '\u27fc',
  nearrow: '\u2197',
  searrow: '\u2198',
  swarrow: '\u2199',
  nwarrow: '\u2196',
};

const MISC_SYMBOLS: Record<string, string> = {
  infty: '\u221e',
  infinity: '\u221e',
  aleph: '\u2135',
  wp: '\u2118',
  Re: '\u211c',
  Im: '\u2111',
  partial: '\u2202',
  nabla: '\u2207',
  forall: '\u2200',
  exists: '\u2203',
  neg: '\u00ac',
  prime: '\u2032',
  dprime: '\u2033',
  triangle: '\u25b3',
  square: '\u25a1',
  flat: '\u266d',
  natural: '\u266e',
  sharp: '\u266f',
  dag: '\u2020',
  ddag: '\u2021',
};

export const LATEX_SYMBOLS: Record<string, string> = {
  ...GREEK_LETTERS,
  ...BINARY_OPERATORS,
  ...MATH_FUNCTIONS,
  ...RELATIONS,
  ...ARROWS,
  ...MISC_SYMBOLS,
};

const SYMBOL_TO_LATEX = Object.entries(LATEX_SYMBOLS).reduce<Record<string, string>>((acc, [command, symbol]) => {
  if (!(symbol in acc)) {
    acc[symbol] = command;
  }
  return acc;
}, {});

export const latexCommandToSymbol = (command: string): string | null => LATEX_SYMBOLS[command] ?? null;

export const symbolToLatexCommand = (symbol: string): string | null => SYMBOL_TO_LATEX[symbol] ?? null;

const serializeTextValue = (value: string): string => {
  const command = symbolToLatexCommand(value);
  return command ? `\\${command} ` : value;
};

class LatexParser {
  private index = 0;

  constructor(private readonly input: string) {}

  parse(): FormulaDoc {
    return doc(this.parseSequence());
  }

  private parseSequence(stopChar?: string): FormulaNode[] {
    const nodes: FormulaNode[] = [];

    while (this.index < this.input.length) {
      const current = this.input[this.index];

      if (stopChar && current === stopChar) {
        this.index += 1;
        break;
      }

      if (current === '{') {
        this.index += 1;
        nodes.push(group(this.parseSequence('}')));
        continue;
      }

      if (current === '^' || current === '_') {
        const modifier = current;
        this.index += 1;
        const last = nodes.pop() ?? text('');
        const target = this.parseAtomAsList();
        const base = last.type === 'group' ? last.body : [last];
        if (modifier === '^') {
          nodes.push(supsub(base, target));
        } else {
          nodes.push(supsub(base, undefined, target));
        }
        continue;
      }

      if (current === '\\') {
        nodes.push(this.parseCommand());
        continue;
      }

      if (['(', '['].includes(current)) {
        this.index += 1;
        const right = current === '(' ? ')' : ']';
        nodes.push(fenced(current, right, this.parseSequence(right)));
        continue;
      }

      nodes.push(text(current));
      this.index += 1;
    }

    return nodes;
  }

  private parseCommand(): FormulaNode {
    this.index += 1;
    let command = '';
    while (this.index < this.input.length && isAlpha(this.input[this.index])) {
      command += this.input[this.index];
      this.index += 1;
    }

    if (command === 'frac') {
      const numerator = this.parseAtomAsList();
      const denominator = this.parseAtomAsList();
      return frac(numerator, denominator);
    }

    if (command === 'sqrt') {
      return sqrt(this.parseAtomAsList());
    }

    if (LATEX_SYMBOLS[command]) {
      return text(LATEX_SYMBOLS[command]);
    }

    if (command === 'left') {
      const left = this.input[this.index] ?? '(';
      this.index += 1;
      const body: FormulaNode[] = [];
      while (!this.input.startsWith('\\right', this.index) && this.index < this.input.length) {
        body.push(...this.parseSequenceChunk());
      }
      this.index += '\\right'.length;
      const right = this.input[this.index] ?? ')';
      this.index += 1;
      return fenced(left, right, body);
    }

    return text(`\\${command}`);
  }

  private parseSequenceChunk(): FormulaNode[] {
    const char = this.input[this.index];
    if (char === '{') {
      this.index += 1;
      return [group(this.parseSequence('}'))];
    }
    if (char === '\\') {
      return [this.parseCommand()];
    }
    if (char === '(' || char === '[') {
      this.index += 1;
      const right = char === '(' ? ')' : ']';
      return [fenced(char, right, this.parseSequence(right))];
    }
    this.index += 1;
    return [text(char)];
  }

  private parseAtomAsList(): FormulaNode[] {
    if (this.input[this.index] === '{') {
      this.index += 1;
      return this.parseSequence('}');
    }
    return this.parseSequenceChunk();
  }
}

const serializeList = (nodes: FormulaNode[]): string => nodes.map(serializeNode).join('');

export const serializeNode = (node: FormulaNode): string => {
  switch (node.type) {
    case 'doc':
      return serializeList(node.body);
    case 'group':
      return `{${serializeList(node.body)}}`;
    case 'text':
      return serializeTextValue(node.value);
    case 'frac':
      return `\\frac{${serializeList(node.numerator)}}{${serializeList(node.denominator)}}`;
    case 'supsub': {
      const base = serializeList(node.base);
      const sup = node.sup ? `^{${serializeList(node.sup)}}` : '';
      const sub = node.sub ? `_{${serializeList(node.sub)}}` : '';
      return `${base}${sup}${sub}`;
    }
    case 'sqrt':
      return `\\sqrt{${serializeList(node.value)}}`;
    case 'fenced':
      return `\\left${node.left}${serializeList(node.body)}\\right${node.right}`;
  }
};

export const parseLatex = (input: string): FormulaDoc => new LatexParser(input).parse();

export const serializeLatex = (document: FormulaDoc): string => serializeNode(document);
