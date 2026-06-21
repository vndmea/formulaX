import type { FormulaMarkupOutput, ParsedFormulaElement } from './types';

export const DEFAULT_FORMULA_ATTRIBUTE = 'data-formulax-latex';
export const FORMULA_FLAG_ATTRIBUTE = 'data-formulax';
export const DEFAULT_FORMULA_CLASS = 'formulax-math';
export const FORMULAX_OUTPUT_ATTRIBUTE = 'data-formulax-output';
export const FORMULAX_IMAGE_URL_ATTRIBUTE = 'data-formulax-image-url';
export const FORMULAX_IMAGE_WIDTH_ATTRIBUTE = 'data-formulax-image-width';
export const FORMULAX_IMAGE_HEIGHT_ATTRIBUTE = 'data-formulax-image-height';
export const FORMULAX_IMAGE_STYLE_ATTRIBUTE = 'data-formulax-image-style';

export interface CreateFormulaMarkupOptions {
  attributeName?: string;
  className?: string;
  displayMode?: boolean;
  output?: FormulaMarkupOutput;
  renderHtml?: string;
  cursorStyle?: string;
  extraAttributes?: Record<string, string | boolean | null | undefined>;
}

export interface SerializeFormulaHtmlOptions {
  attributeName?: string;
  output?: FormulaMarkupOutput;
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
  const resolvedOutput = resolveFormulaMarkupOutput(options);
  const attributeName = options.attributeName ?? DEFAULT_FORMULA_ATTRIBUTE;
  const className = options.className ?? DEFAULT_FORMULA_CLASS;
  const displayClass = options.displayMode ? `${className} ${className}--block` : className;
  const safeLatex = escapeAttribute(latex);
  const cursorStyle = options.cursorStyle?.trim() || 'pointer';
  const extraAttributes: Record<string, string | boolean | null | undefined> = {
    ...(options.extraAttributes ?? {}),
    [FORMULAX_OUTPUT_ATTRIBUTE]: resolvedOutput,
    style: mergeInlineStyles(
      typeof options.extraAttributes?.style === 'string' ? options.extraAttributes.style : '',
      cursorStyle ? `cursor: ${cursorStyle}` : '',
    ),
  };
  const serializedAttributes = Object.entries(extraAttributes)
    .filter(([, value]) => value !== null && value !== undefined && value !== false)
    .map(([key, value]) => (value === true ? key : `${key}="${escapeAttribute(String(value))}"`));

  const innerHtml = resolvedOutput === 'latex'
    ? options.renderHtml ?? ''
    : options.renderHtml
      ?? `<span class="${escapeAttribute(className)}__render">${escapeHtml(latex || '\\square')}</span>`;

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
    innerHtml,
    '</span>',
  ].join('');
}

function resolveFormulaMarkupOutput(options: CreateFormulaMarkupOptions): FormulaMarkupOutput {
  const explicit = options.output;
  if (explicit === 'latex' || explicit === 'svg' || explicit === 'image') {
    return explicit;
  }

  const fromAttributes = options.extraAttributes?.[FORMULAX_OUTPUT_ATTRIBUTE];
  if (fromAttributes === 'latex' || fromAttributes === 'svg' || fromAttributes === 'image') {
    return fromAttributes;
  }

  return 'latex';
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

export function createFormulaSourceHtml(
  latex: string,
  className = DEFAULT_FORMULA_CLASS,
): string {
  return `<span class="${escapeAttribute(`${className}__source`)}">${escapeHtml(latex || '\\square')}</span>`;
}

export function createLatexFormulaMarkup(
  latex: string,
  options: CreateFormulaMarkupOptions = {},
): string {
  return createFormulaMarkup(latex, {
    ...options,
    output: options.output ?? 'latex',
  });
}

export function createLatexFormulaElement(
  ownerDocument: Document,
  latex: string,
  options: CreateFormulaMarkupOptions = {},
): HTMLElement | null {
  return createFormulaElement(ownerDocument, latex, {
    ...options,
    output: options.output ?? 'latex',
  });
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

export function replaceLatexFormulaElement(
  target: HTMLElement,
  latex: string,
  options: CreateFormulaMarkupOptions = {},
): HTMLElement | null {
  const next = createLatexFormulaElement(target.ownerDocument ?? document, latex, options);
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

export function getFormulaOutputFromElement(element: HTMLElement): FormulaMarkupOutput {
  const explicit = element.getAttribute(FORMULAX_OUTPUT_ATTRIBUTE);
  if (explicit === 'latex' || explicit === 'image' || explicit === 'svg') {
    return explicit;
  }

  return element.querySelector('img[data-formulax-image]') ? 'image' : 'svg';
}

export function parseLatexFormulaElement(
  element: HTMLElement,
  attributeName = DEFAULT_FORMULA_ATTRIBUTE,
): ParsedFormulaElement {
  return {
    latex: getFormulaLatexFromElement(element, attributeName),
    output: getFormulaOutputFromElement(element),
    displayMode: element.classList.contains(`${DEFAULT_FORMULA_CLASS}--block`),
  };
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

export function serializeFormulaHtml(
  html: string,
  options: SerializeFormulaHtmlOptions = {},
): string {
  if (typeof document === 'undefined') {
    return html;
  }

  const container = document.createElement('div');
  container.innerHTML = html;
  const attributeName = options.attributeName ?? DEFAULT_FORMULA_ATTRIBUTE;

  container.querySelectorAll<HTMLElement>(`[${FORMULA_FLAG_ATTRIBUTE}="true"]`).forEach((element) => {
    const output = options.output ?? getFormulaOutputFromElement(element);

    if (output !== 'latex') {
      return;
    }

    element.setAttribute(FORMULAX_OUTPUT_ATTRIBUTE, 'latex');
    [
      FORMULAX_IMAGE_URL_ATTRIBUTE,
      FORMULAX_IMAGE_WIDTH_ATTRIBUTE,
      FORMULAX_IMAGE_HEIGHT_ATTRIBUTE,
      FORMULAX_IMAGE_STYLE_ATTRIBUTE,
    ].forEach((name) => {
      element.removeAttribute(name);
    });
    element.innerHTML = '';

    const latex = getFormulaLatexFromElement(element, attributeName);
    if (!element.getAttribute(attributeName) && latex) {
      element.setAttribute(attributeName, latex);
    }
  });

  return container.innerHTML;
}
