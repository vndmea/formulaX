import { escapeAttribute } from '@formulaxjs/renderer';

export interface CreateFormulaImageHtmlOptions {
  src: string;
  latex: string;
  className?: string;
  width?: number;
  height?: number;
  style?: string;
}

export function createFormulaImageHtml(options: CreateFormulaImageHtmlOptions): string {
  const className = options.className ?? 'formulax-math';

  return [
    '<img',
    ` class="${escapeAttribute(`${className}__image`)}"`,
    ` src="${escapeAttribute(options.src)}"`,
    ` alt="${escapeAttribute(options.latex)}"`,
    ' data-formulax-image="true"',
    options.width ? ` width="${Math.round(options.width)}"` : '',
    options.height ? ` height="${Math.round(options.height)}"` : '',
    options.style ? ` style="${escapeAttribute(options.style)}"` : '',
    ' />',
  ].join('');
}
