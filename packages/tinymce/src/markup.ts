import { parseLatex, serializeLatex, type FormulaDoc } from '@formulax/core';

export const DEFAULT_FORMULA_ATTRIBUTE = 'data-formulax-latex';
export const FORMULA_FLAG_ATTRIBUTE = 'data-formulax';
export const DEFAULT_FORMULA_CLASS = 'formulax-math';

export interface CreateFormulaMarkupOptions {
  attributeName?: string;
  className?: string;
  displayMode?: boolean;
  renderHtml?: string;
}

export function escapeAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function createTinyMceFormulaMarkup(
  latex: string,
  options: CreateFormulaMarkupOptions = {},
): string {
  const attributeName = options.attributeName ?? DEFAULT_FORMULA_ATTRIBUTE;
  const className = options.className ?? DEFAULT_FORMULA_CLASS;
  const displayClass = options.displayMode ? `${className} ${className}--block` : className;
  const safeLatex = escapeAttribute(latex);
  const content = options.renderHtml ?? `<span class="${escapeAttribute(className)}__render">${escapeHtml(latex || '\\square')}</span>`;

  return [
    '<span',
    ` class="${escapeAttribute(displayClass)}"`,
    ` ${FORMULA_FLAG_ATTRIBUTE}="true"`,
    ` ${attributeName}="${safeLatex}"`,
    ` data-latex="${safeLatex}"`,
    ' contenteditable="false"',
    ' role="button"',
    ' tabindex="0"',
    '>',
    content,
    '</span>',
  ].join('');
}

export function parseTinyMceFormulaMarkup(latex: string): FormulaDoc {
  return parseLatex(latex);
}

export function serializeTinyMceFormulaMarkup(
  doc: FormulaDoc,
  options: CreateFormulaMarkupOptions = {},
): string {
  return createTinyMceFormulaMarkup(serializeLatex(doc), options);
}

export function getFormulaLatexFromElement(
  element: HTMLElement,
  attributeName = DEFAULT_FORMULA_ATTRIBUTE,
): string {
  return (
    element.getAttribute(attributeName) ??
    element.getAttribute('data-latex') ??
    element.getAttribute(FORMULA_FLAG_ATTRIBUTE) ??
    ''
  );
}

export function isFormulaElement(node: unknown): node is HTMLElement {
  if (!node || typeof node !== 'object') return false;
  const element = node as HTMLElement;
  return typeof element.getAttribute === 'function' && element.getAttribute(FORMULA_FLAG_ATTRIBUTE) === 'true';
}

export function findFormulaElement(node: Node | null): HTMLElement | null {
  if (!node) return null;

  const element = node.nodeType === 1
    ? (node as HTMLElement)
    : (node.parentElement as HTMLElement | null);

  return element?.closest?.(`[${FORMULA_FLAG_ATTRIBUTE}="true"]`) as HTMLElement | null;
}

export function replaceFormulaElement(
  target: HTMLElement,
  latex: string,
  options: CreateFormulaMarkupOptions = {},
): HTMLElement | null {
  const ownerDocument = target.ownerDocument ?? document;
  const wrapper = ownerDocument.createElement('span');
  wrapper.innerHTML = createTinyMceFormulaMarkup(latex, options);
  const next = wrapper.firstElementChild as HTMLElement | null;
  if (!next) return null;
  target.replaceWith(next);
  return next;
}
