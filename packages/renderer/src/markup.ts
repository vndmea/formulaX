export const DEFAULT_FORMULA_ATTRIBUTE = 'data-formulax-latex';
export const FORMULA_FLAG_ATTRIBUTE = 'data-formulax';
export const DEFAULT_FORMULA_CLASS = 'formulax-math';

export interface CreateFormulaMarkupOptions {
  attributeName?: string;
  className?: string;
  displayMode?: boolean;
  renderHtml?: string;
  cursorStyle?: string;
  extraAttributes?: Record<string, string | boolean | null | undefined>;
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

export function createFormulaMarkup(
  latex: string,
  options: CreateFormulaMarkupOptions = {},
): string {
  const attributeName = options.attributeName ?? DEFAULT_FORMULA_ATTRIBUTE;
  const className = options.className ?? DEFAULT_FORMULA_CLASS;
  const displayClass = options.displayMode ? `${className} ${className}--block` : className;
  const safeLatex = escapeAttribute(latex);
  const cursorStyle = options.cursorStyle?.trim() || 'pointer';
  const extraAttributes: Record<string, string | boolean | null | undefined> = {
    ...(options.extraAttributes ?? {}),
    style: mergeInlineStyles(
      typeof options.extraAttributes?.style === 'string' ? options.extraAttributes.style : '',
      cursorStyle ? `cursor: ${cursorStyle}` : '',
    ),
  };
  const serializedAttributes = Object.entries(extraAttributes)
    .filter(([, value]) => value !== null && value !== undefined && value !== false)
    .map(([key, value]) => (value === true ? key : `${key}="${escapeAttribute(String(value))}"`));

  return [
    '<span',
    ` class="${escapeAttribute(displayClass)}"`,
    ` ${FORMULA_FLAG_ATTRIBUTE}="true"`,
    ` ${attributeName}="${safeLatex}"`,
    ` data-latex="${safeLatex}"`,
    ' contenteditable="false"',
    ' role="button"',
    ' tabindex="0"',
    serializedAttributes.length ? ` ${serializedAttributes.join(' ')}` : '',
    '>',
    options.renderHtml
      ?? `<span class="${escapeAttribute(className)}__render">${escapeHtml(latex || '\\square')}</span>`,
    '</span>',
  ].join('');
}

function mergeInlineStyles(existingStyle: string, nextStyle: string): string {
  const existing = existingStyle.trim().replace(/;+\s*$/, '');
  const next = nextStyle.trim().replace(/;+\s*$/, '');

  if (!existing) return next;
  if (!next) return existing;

  return `${existing}; ${next}`;
}

export function createFormulaElement(
  ownerDocument: Document,
  latex: string,
  options: CreateFormulaMarkupOptions = {},
): HTMLElement | null {
  const wrapper = ownerDocument.createElement('span');
  wrapper.innerHTML = createFormulaMarkup(latex, options);
  return wrapper.firstElementChild as HTMLElement | null;
}

export function replaceFormulaElement(
  target: HTMLElement,
  latex: string,
  options: CreateFormulaMarkupOptions = {},
): HTMLElement | null {
  const next = createFormulaElement(target.ownerDocument ?? document, latex, options);
  if (!next) return null;
  target.replaceWith(next);
  return next;
}

export function getFormulaLatexFromElement(
  element: HTMLElement,
  attributeName = DEFAULT_FORMULA_ATTRIBUTE,
): string {
  return element.getAttribute(attributeName)
    ?? element.getAttribute('data-latex')
    ?? '';
}

export function isFormulaElement(node: unknown): node is HTMLElement {
  if (!node || typeof node !== 'object') return false;
  const element = node as HTMLElement;
  return typeof element.getAttribute === 'function'
    && element.getAttribute(FORMULA_FLAG_ATTRIBUTE) === 'true';
}

export function findFormulaElement(node: Node | null): HTMLElement | null {
  if (!node) {
    return null;
  }

  const element = node.nodeType === 1
    ? node as HTMLElement
    : node.parentElement;

  return element?.closest?.(`[${FORMULA_FLAG_ATTRIBUTE}="true"]`) as HTMLElement | null;
}
