import { doc, fenced, frac, group, sqrt, supsub, text, type FormulaDoc, type FormulaNode } from './ast';

const isAlpha = (char: string): boolean => /[a-zA-Z]/.test(char);

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
      return node.value;
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
