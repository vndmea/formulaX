import { createFormulaNodeId } from '../core/ids';
import type {
  FormulaDiagnostic,
  FormulaDoc,
  FormulaEnvironmentName,
  FormulaFenceNode,
  FormulaFunctionNode,
  FormulaIntegralNode,
  FormulaLargeOperatorNode,
  FormulaMatrixNode,
  FormulaNode,
  FormulaPlaceholderNode,
  FormulaRowNode,
  FormulaScriptNode,
  FormulaSqrtNode,
  FormulaSymbolNode,
  FormulaUnsupportedNode,
} from '../core/types';
import { resolveRuntimeSymbol } from './symbols';

type ScriptTarget = {
  sup?: FormulaRowNode;
  sub?: FormulaRowNode;
  order: Array<'sup' | 'sub'>;
};

type ParsedBody = {
  row: FormulaRowNode;
  style: 'atom' | 'group';
};

const FUNCTION_COMMANDS = new Set(['sin', 'cos', 'tan', 'csc', 'sec', 'cot']);
const INTEGRAL_COMMANDS = new Set(['int', 'iint', 'iiint']);
const LARGE_OPERATOR_COMMANDS = new Set(['sum']);

function createRow(children: FormulaNode[] = []): FormulaRowNode {
  return {
    type: 'row',
    id: createFormulaNodeId('row'),
    children,
  };
}

function createSymbol(value: string, latex?: string, fontFamily?: string): FormulaSymbolNode {
  return {
    type: 'symbol',
    id: createFormulaNodeId('sym'),
    value,
    latex,
    fontFamily,
  };
}

function createPlaceholder(): FormulaPlaceholderNode {
  return {
    type: 'placeholder',
    id: createFormulaNodeId('placeholder'),
  };
}

function createUnsupported(rawLatex: string, reason?: string): FormulaUnsupportedNode {
  return {
    type: 'unsupported',
    id: createFormulaNodeId('unsupported'),
    rawLatex,
    reason,
  };
}

class RuntimeLatexParser {
  private index = 0;
  private readonly diagnostics: FormulaDiagnostic[] = [];

  constructor(private readonly input: string) {}

  parse(): FormulaDoc {
    const root = normalizeParsedRow(this.parseRow(), {
      allowRootPlaceholder: true,
    });
    return {
      type: 'doc',
      id: createFormulaNodeId('doc'),
      root,
      sourceLatex: this.input,
      version: 0,
      diagnostics: this.diagnostics,
    };
  }

  private parseRow(stop?: () => boolean): FormulaRowNode {
    const children: FormulaNode[] = [];

    while (this.index < this.input.length) {
      if (stop?.()) {
        break;
      }

      const current = this.input[this.index];

      if (current === '}') {
        break;
      }

      if (/\s/.test(current)) {
        this.index += 1;
        continue;
      }

      const atom = this.parseAtom();
      if (!atom) {
        break;
      }

      children.push(this.applyScripts(atom));
    }

    return createRow(children);
  }

  private parseAtom(): FormulaNode | null {
    if (this.index >= this.input.length) {
      return null;
    }

    if (this.peek('\\frac')) {
      this.index += '\\frac'.length;
      return {
        type: 'frac',
        id: createFormulaNodeId('frac'),
        numerator: normalizeParsedRow(this.parseRequiredGroup('\\frac numerator'), {
          role: 'numerator',
        }),
        denominator: normalizeParsedRow(this.parseRequiredGroup('\\frac denominator'), {
          role: 'denominator',
        }),
      };
    }

    if (this.peek('\\sqrt')) {
      this.index += '\\sqrt'.length;
      return {
        type: 'sqrt',
        id: createFormulaNodeId('sqrt'),
        index: this.parseOptionalBracketGroup('index'),
        value: normalizeParsedRow(this.parseRequiredGroup('\\sqrt value'), {
          role: 'radicand',
        }),
      } satisfies FormulaSqrtNode;
    }

    if (this.peek('\\left')) {
      return this.parseFence();
    }

    if (this.peek('\\begin')) {
      return this.parseEnvironment();
    }

    const current = this.input[this.index];

    if (current === '{') {
      this.index += 1;
      const row = this.parseRow(() => this.input[this.index] === '}');
      this.consume('}');
      return normalizeParsedRow(row);
    }

    if (current === '^' || current === '_') {
      return this.applyScripts(createRow([]));
    }

    if (current === '\\') {
      return this.parseCommand();
    }

    this.index += 1;
    return createSymbol(current);
  }

  private parseFence(): FormulaFenceNode | FormulaUnsupportedNode {
    this.index += '\\left'.length;
    const left = this.readDelimiter();
    const body = this.parseRow(() => this.peek('\\right'));

    if (!this.peek('\\right')) {
      return createUnsupported(`\\left${left}${serializeRawRow(body)}`, 'Missing \\right delimiter');
    }

    this.index += '\\right'.length;
    const right = this.readDelimiter();

    return {
      type: 'fence',
      id: createFormulaNodeId('fence'),
      left,
      right,
      body,
    };
  }

  private parseEnvironment(): FormulaMatrixNode | FormulaUnsupportedNode {
    const startIndex = this.index;
    this.index += '\\begin'.length;
    const environmentName = this.readGroupText();

    if (environmentName !== 'matrix' && environmentName !== 'cases') {
      return createUnsupported(this.input.slice(startIndex, this.findEnvironmentEnd(environmentName)), `Unsupported environment ${environmentName}`);
    }

    const endTag = `\\end{${environmentName}}`;
    const closeIndex = this.input.indexOf(endTag, this.index);
    if (closeIndex === -1) {
      return createUnsupported(this.input.slice(startIndex), `Missing ${endTag}`);
    }

    const body = this.input.slice(this.index, closeIndex);
    this.index = closeIndex + endTag.length;

    return {
      type: 'matrix',
      id: createFormulaNodeId('matrix'),
      environment: environmentName as FormulaEnvironmentName,
      rows: splitMatrixRows(body).map((cells) => cells.map((cell) => new RuntimeLatexParser(cell).parse().root)),
    };
  }

  private parseCommand(): FormulaNode {
    const start = this.index;
    this.index += 1;
    let command = '';

    while (this.index < this.input.length && /[a-zA-Z]/.test(this.input[this.index])) {
      command += this.input[this.index];
      this.index += 1;
    }

    if (!command) {
      const escaped = this.input[this.index] ?? '';
      this.index += escaped ? 1 : 0;
      return createSymbol(escaped || '\\', escaped ? `\\${escaped}` : '\\');
    }

    if (command in { mathcal: true, mathfrak: true, mathbb: true, mathrm: true }) {
      const styled = this.parseStyledCommand(command, this.input.slice(start, this.index));
      if (styled) {
        return styled;
      }
    }

    if (command === 'placeholder') {
      return createPlaceholder();
    }

    if (FUNCTION_COMMANDS.has(command)) {
      return this.parseFunctionCommand(command);
    }

    if (INTEGRAL_COMMANDS.has(command)) {
      return this.parseIntegralCommand(command as FormulaIntegralNode['operator']);
    }

    if (LARGE_OPERATOR_COMMANDS.has(command)) {
      return this.parseLargeOperatorCommand(command as FormulaLargeOperatorNode['operator']);
    }

    const resolved = resolveRuntimeSymbol(`\\${command}`);
    if (resolved) {
      return createSymbol(resolved.char, resolved.latex, resolved.fontFamily);
    }

    const rawLatex = this.readUnsupportedCommandWithTrailingGroups(this.input.slice(start, this.index));
    return createUnsupported(rawLatex, `Unsupported command \\${command}`);
  }

  private parseStyledCommand(command: string, rawCommand: string): FormulaNode | null {
    this.skipWhitespace();
    const rawGroup = this.readBalancedGroup('{', '}');
    if (!rawGroup) {
      this.diagnostics.push({
        message: `Missing group for \\${command}`,
        severity: 'warning',
      });
      return createUnsupported(rawCommand, `Missing group for \\${command}`);
    }

    const rawLatex = `${rawCommand}${rawGroup.raw}`;
    const resolved = resolveRuntimeSymbol(rawLatex);
    if (!resolved) {
      return createUnsupported(rawLatex, `Unsupported styled command \\${command}`);
    }

    return createSymbol(resolved.char, resolved.latex, resolved.fontFamily);
  }

  private parseFunctionCommand(name: string): FormulaFunctionNode {
    const body = this.parseOptionalBody('function-argument');
    return {
      type: 'function',
      id: createFormulaNodeId('fn'),
      name,
      body: normalizeParsedRow(body.row, { role: 'function-argument' }),
      bodyStyle: body.style,
    };
  }

  private parseIntegralCommand(operator: FormulaIntegralNode['operator']): FormulaIntegralNode {
    const scripts = this.readScripts();
    const body = this.parseOptionalBody('integrand');
    return {
      type: 'integral',
      id: createFormulaNodeId('integral'),
      operator,
      sup: scripts.sup ? normalizeParsedRow(scripts.sup, { role: 'upper-limit' }) : undefined,
      sub: scripts.sub ? normalizeParsedRow(scripts.sub, { role: 'lower-limit' }) : undefined,
      order: scripts.order,
      body: normalizeParsedRow(body.row, { role: 'integrand' }),
      bodyStyle: body.style,
    };
  }

  private parseLargeOperatorCommand(operator: FormulaLargeOperatorNode['operator']): FormulaLargeOperatorNode {
    const scripts = this.readScripts();
    const body = this.parseOptionalBody('operator-body');
    return {
      type: 'large-op',
      id: createFormulaNodeId('largeop'),
      operator,
      sup: scripts.sup ? normalizeParsedRow(scripts.sup, { role: 'upper-limit' }) : undefined,
      sub: scripts.sub ? normalizeParsedRow(scripts.sub, { role: 'lower-limit' }) : undefined,
      order: scripts.order,
      body: normalizeParsedRow(body.row, { role: 'operator-body' }),
      bodyStyle: body.style,
    };
  }

  private parseOptionalBody(_context: string): ParsedBody {
    this.skipWhitespace();
    if (this.input[this.index] === '{') {
      this.index += 1;
      const row = this.parseRow(() => this.input[this.index] === '}');
      this.consume('}');
      return { row, style: 'group' };
    }

    const atom = this.parseAtom();
    return {
      row: atom ? createRow([atom]) : createRow([]),
      style: 'atom',
    };
  }

  private applyScripts(atom: FormulaNode): FormulaNode {
    const scriptTarget = this.readScripts();

    if (!scriptTarget.sup && !scriptTarget.sub) {
      return atom;
    }

    return {
      type: 'script',
      id: createFormulaNodeId('script'),
      base: atom,
      sup: scriptTarget.sup ? normalizeParsedRow(scriptTarget.sup, {
        role: 'superscript',
      }) : undefined,
      sub: scriptTarget.sub ? normalizeParsedRow(scriptTarget.sub, {
        role: 'subscript',
      }) : undefined,
      order: scriptTarget.order,
    } satisfies FormulaScriptNode;
  }

  private readScripts(): ScriptTarget {
    const scriptTarget: ScriptTarget = { order: [] };

    while (this.index < this.input.length) {
      const current = this.input[this.index];
      if (current !== '^' && current !== '_') {
        break;
      }

      this.index += 1;
      const row = this.parseRequiredGroup(current === '^' ? 'superscript' : 'subscript');
      if (current === '^') {
        scriptTarget.sup = row;
        scriptTarget.order.push('sup');
      } else {
        scriptTarget.sub = row;
        scriptTarget.order.push('sub');
      }
    }

    return scriptTarget;
  }

  private parseRequiredGroup(context: string): FormulaRowNode {
    this.skipWhitespace();
    if (this.input[this.index] === '{') {
      this.index += 1;
      const row = this.parseRow(() => this.input[this.index] === '}');
      this.consume('}');
      return row;
    }

    const atom = this.parseAtom();
    if (atom) {
      return createRow([atom]);
    }

    this.diagnostics.push({
      message: `Missing group for ${context}`,
      severity: 'warning',
    });

    return createRow([]);
  }

  private parseOptionalBracketGroup(role = 'index'): FormulaRowNode | undefined {
    this.skipWhitespace();
    const rawGroup = this.readBalancedGroup('[', ']');
    if (!rawGroup) {
      return undefined;
    }

    return normalizeParsedRow(new RuntimeLatexParser(rawGroup.content).parse().root, {
      role,
    });
  }

  private readGroupText(): string {
    if (!this.consume('{')) {
      return '';
    }

    const start = this.index;
    while (this.index < this.input.length && this.input[this.index] !== '}') {
      this.index += 1;
    }
    const value = this.input.slice(start, this.index);
    this.consume('}');
    return value;
  }

  private readDelimiter(): string {
    this.skipWhitespace();

    while (this.input[this.index] === ' ') {
      this.index += 1;
    }

    if (this.input[this.index] === '\\') {
      const start = this.index;
      this.index += 1;
      if (this.index < this.input.length && !/[a-zA-Z.]/.test(this.input[this.index])) {
        this.index += 1;
        return this.input.slice(start, this.index);
      }
      while (this.index < this.input.length && /[a-zA-Z.]/.test(this.input[this.index])) {
        this.index += 1;
      }
      return this.input.slice(start, this.index);
    }

    const value = this.input[this.index] ?? '.';
    this.index += 1;
    return value;
  }

  private readBalancedGroup(open: string, close: string): { raw: string; content: string } | null {
    if (this.input[this.index] !== open) {
      return null;
    }

    const start = this.index;
    this.index += 1;
    let depth = 1;
    const contentStart = this.index;

    while (this.index < this.input.length) {
      const char = this.input[this.index];
      if (char === open) {
        depth += 1;
      } else if (char === close) {
        depth -= 1;
        if (depth === 0) {
          const content = this.input.slice(contentStart, this.index);
          this.index += 1;
          return {
            raw: this.input.slice(start, this.index),
            content,
          };
        }
      }
      this.index += 1;
    }

    this.index = start;
    return null;
  }

  private skipWhitespace(): void {
    while (this.index < this.input.length && /\s/.test(this.input[this.index])) {
      this.index += 1;
    }
  }

  private findEnvironmentEnd(name: string): number {
    const endTag = `\\end{${name}}`;
    const closeIndex = this.input.indexOf(endTag, this.index);
    return closeIndex === -1 ? this.input.length : closeIndex + endTag.length;
  }

  private readUnsupportedCommandWithTrailingGroups(initial: string): string {
    let raw = initial;

    while (this.input[this.index] === '{') {
      const start = this.index;
      let depth = 0;
      while (this.index < this.input.length) {
        const char = this.input[this.index];
        this.index += 1;
        if (char === '{') {
          depth += 1;
        } else if (char === '}') {
          depth -= 1;
          if (depth === 0) {
            break;
          }
        }
      }
      raw += this.input.slice(start, this.index);
    }

    return raw;
  }

  private peek(value: string): boolean {
    return this.input.startsWith(value, this.index);
  }

  private consume(char: string): boolean {
    if (this.input[this.index] !== char) {
      return false;
    }

    this.index += 1;
    return true;
  }
}

function serializeRawRow(row: FormulaRowNode): string {
  return row.children.map((child) => {
    switch (child.type) {
      case 'row':
        return `{${serializeRawRow(child)}}`;
      case 'symbol':
        return child.latex ?? child.value;
      case 'placeholder':
        return '\\placeholder';
      case 'function':
        return `\\${child.name}${serializeRawRow(child.body)}`;
      case 'large-op':
        return `\\${child.operator}${serializeRawRow(child.body)}`;
      case 'integral':
        return `\\${child.operator}${serializeRawRow(child.body)}`;
      case 'unsupported':
        return child.rawLatex;
      default:
        return '';
    }
  }).join('');
}

function splitMatrixRows(input: string): string[][] {
  const rows: string[][] = [];
  let currentCell = '';
  let currentRow: string[] = [];
  let depth = 0;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '{') {
      depth += 1;
      currentCell += char;
      continue;
    }

    if (char === '}') {
      depth = Math.max(0, depth - 1);
      currentCell += char;
      continue;
    }

    if (depth === 0 && char === '&') {
      currentRow.push(currentCell);
      currentCell = '';
      continue;
    }

    if (depth === 0 && char === '\\' && next === '\\') {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
      index += 1;
      continue;
    }

    currentCell += char;
  }

  currentRow.push(currentCell);
  rows.push(currentRow);

  return rows.map((row) => row.map((cell) => cell.trim()));
}

export function parseLatexToFormulaDoc(input: string): FormulaDoc {
  return new RuntimeLatexParser(input).parse();
}

function normalizeParsedRow(
  row: FormulaRowNode,
  options: {
    role?: string;
    allowRootPlaceholder?: boolean;
  } = {},
): FormulaRowNode {
  const children = row.children.map((child) => normalizeParsedNode(child));
  const isSinglePlaceholder = children.length === 1 && children[0]?.type === 'placeholder';
  const singlePlaceholder = isSinglePlaceholder ? children[0] as FormulaPlaceholderNode : row.placeholder;
  const placeholder = singlePlaceholder
    ? {
      ...singlePlaceholder,
      role: singlePlaceholder.role ?? options.role,
      isRoot: options.allowRootPlaceholder ? true : singlePlaceholder.isRoot,
    }
    : undefined;

  return {
    ...row,
    children: isSinglePlaceholder ? [] : children,
    placeholder,
  };
}

function normalizeParsedNode(node: FormulaNode): FormulaNode {
  switch (node.type) {
    case 'row':
      return normalizeParsedRow(node);
    case 'frac':
      return {
        ...node,
        numerator: normalizeParsedRow(node.numerator, { role: 'numerator' }),
        denominator: normalizeParsedRow(node.denominator, { role: 'denominator' }),
      };
    case 'sqrt':
      return {
        ...node,
        index: node.index ? normalizeParsedRow(node.index, { role: 'index' }) : undefined,
        value: normalizeParsedRow(node.value, { role: 'radicand' }),
      };
      case 'script':
        return {
          ...node,
        base: normalizeParsedNode(node.base),
        sup: node.sup ? normalizeParsedRow(node.sup, { role: 'superscript' }) : undefined,
          sub: node.sub ? normalizeParsedRow(node.sub, { role: 'subscript' }) : undefined,
        };
    case 'function':
      return {
        ...node,
        body: normalizeParsedRow(node.body, { role: 'function-argument' }),
      };
    case 'large-op':
      return {
        ...node,
        sup: node.sup ? normalizeParsedRow(node.sup, { role: 'upper-limit' }) : undefined,
        sub: node.sub ? normalizeParsedRow(node.sub, { role: 'lower-limit' }) : undefined,
        body: normalizeParsedRow(node.body, { role: 'operator-body' }),
      };
    case 'integral':
      return {
        ...node,
        sup: node.sup ? normalizeParsedRow(node.sup, { role: 'upper-limit' }) : undefined,
        sub: node.sub ? normalizeParsedRow(node.sub, { role: 'lower-limit' }) : undefined,
        body: normalizeParsedRow(node.body, { role: 'integrand' }),
      };
    case 'fence':
      return {
        ...node,
        body: normalizeParsedRow(node.body, { role: 'body' }),
      };
    case 'matrix':
      return {
        ...node,
        rows: node.rows.map((row) => row.map((cell) => normalizeParsedRow(cell, { role: 'matrix-cell' }))),
      };
    default:
      return node;
  }
}
