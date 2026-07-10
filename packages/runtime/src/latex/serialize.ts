import type { FormulaDoc, FormulaNode, FormulaRowNode } from '../core/types';
import { SYMBOL_TO_LATEX } from './symbols';

function serializeRow(row: FormulaRowNode): string {
  return row.children.map(serializeFormulaNode).join('');
}

function serializeScriptRow(row: FormulaRowNode): string {
  if (row.children.length === 1) {
    const [child] = row.children;
    if (child.type === 'symbol' || child.type === 'unsupported') {
      return serializeFormulaNode(child);
    }
  }

  return `{${serializeRow(row)}}`;
}

export function serializeFormulaNode(node: FormulaNode): string {
  switch (node.type) {
    case 'row':
      return `{${serializeRow(node)}}`;
    case 'symbol':
      if (node.latex) {
        return node.latex;
      }
      {
      const command = SYMBOL_TO_LATEX[node.value];
      return command ? `\\${command}` : node.value;
      }
    case 'placeholder':
      return '';
    case 'frac':
      return `\\frac{${serializeRow(node.numerator)}}{${serializeRow(node.denominator)}}`;
    case 'sqrt':
      return `\\sqrt${node.index ? `[${serializeRow(node.index)}]` : ''}{${serializeRow(node.value)}}`;
    case 'script': {
      const base = serializeFormulaNode(node.base);
      const parts = node.order?.length
        ? node.order
        : [
          ...(node.sup ? ['sup' as const] : []),
          ...(node.sub ? ['sub' as const] : []),
        ];
      const serialized = parts.map((part) => {
        if (part === 'sup' && node.sup) {
          return `^${serializeScriptRow(node.sup)}`;
        }
        if (part === 'sub' && node.sub) {
          return `_${serializeScriptRow(node.sub)}`;
        }
        return '';
      }).join('');
      return `${base}${serialized}`;
    }
    case 'function':
      return `\\${node.name}${serializeOperatorBody(node.body, node.bodyStyle)}`;
    case 'large-op':
      return `\\${node.operator}${serializeOperatorLimits(node)}${serializeOperatorBody(node.body, node.bodyStyle)}`;
    case 'integral':
      return `\\${node.operator}${serializeOperatorLimits(node)}${serializeOperatorBody(node.body, node.bodyStyle)}`;
    case 'fence':
      return `\\left${node.left}${serializeRow(node.body)}\\right${node.right}`;
    case 'matrix': {
      const body = node.rows
        .map((row) => row.map((cell) => serializeRow(cell)).join('&'))
        .join('\\\\');
      return `\\begin{${node.environment}}${body}\\end{${node.environment}}`;
    }
    case 'unsupported':
      return node.rawLatex;
  }
}

function serializeOperatorLimits(node: Extract<FormulaNode, { type: 'large-op' | 'integral' }>): string {
  const parts = node.order?.length
    ? node.order
    : [
      ...(node.sup ? ['sup' as const] : []),
      ...(node.sub ? ['sub' as const] : []),
    ];

  return parts.map((part) => {
    if (part === 'sup' && node.sup) {
      return `^${serializeScriptRow(node.sup)}`;
    }
    if (part === 'sub' && node.sub) {
      return `_${serializeScriptRow(node.sub)}`;
    }
    return '';
  }).join('');
}

function serializeOperatorBody(row: FormulaRowNode, style: 'atom' | 'group' = 'atom'): string {
  if (row.children.length === 0) {
    return '';
  }

  if (style === 'group' || row.children.length > 1) {
    return `{${serializeRow(row)}}`;
  }

  return serializeFormulaNode(row.children[0]);
}

export function serializeFormulaDocToLatex(doc: FormulaDoc): string {
  return serializeRow(doc.root);
}
