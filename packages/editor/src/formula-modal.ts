import { createEmptyState, parseLatex, type FormulaState } from '@formulaxjs/core';
import { mountKityEditor, type KityEditorAssets, type KityEditorHandle } from '@formulaxjs/kity-runtime';
import { escapeHtml } from './formula-node';

const EMPTY_FORMULA_PLACEHOLDER = '\\placeholder ';
const STYLE_ID = 'fx-formula-modal-styles';

export interface FormulaXEditorOptions {
  initialLatex?: string;
  height?: number | string;
  autofocus?: boolean;
  assets?: Partial<KityEditorAssets>;
  render?: {
    fontsize?: number;
  };
}

export interface MountedFormulaXEditor {
  root: HTMLElement;
  getLatex: () => Promise<string>;
  getState: () => Promise<FormulaState>;
  getRenderHtml: () => Promise<string>;
  destroy: () => void;
}

interface SvgBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface InlineSvgContent {
  box: SvgBox;
  matrix: SVGMatrixLike;
  root: SVGGraphicsElement;
}

interface SVGMatrixLike {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export const formulaXModalStyles = `
.fx-formula-modal-open {
  overflow: hidden;
}

.fx-formula-modal-root {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fx-formula-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.48);
}

.fx-formula-modal {
  --fx-formula-editor-body-height: 264px;
  --fx-formula-workspace-height: 168px;
  position: relative;
  width: min(860px, calc(100vw - 32px));
  height: auto;
  max-height: calc(100vh - 32px);
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.28);
  display: flex;
  flex-direction: column;
  overflow: visible;
  isolation: isolate;
}

.fx-formula-modal__header,
.fx-formula-modal__footer,
.fx-formula-modal__title,
.fx-formula-modal__close,
.fx-formula-modal__button,
.fx-formula-editor-loading,
.fx-formula-editor-error {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.fx-formula-modal__header {
  min-height: 56px;
  padding: 0 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  position: relative;
  z-index: 3;
  background: #fff;
  border-radius: 14px 14px 0 0;
}

.fx-formula-modal__title {
  font-size: 16px;
  font-weight: 650;
  margin: 0;
  color: #111827;
}

.fx-formula-modal__close {
  border: 0;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #6b7280;
}

.fx-formula-modal__body {
  flex: 0 0 auto;
  height: var(--fx-formula-editor-body-height);
  padding: 0;
  overflow: visible;
  min-height: var(--fx-formula-editor-body-height);
  position: relative;
  z-index: 2;
}

.fx-formula-editor-host {
  width: 100%;
  height: var(--fx-formula-editor-body-height);
  min-height: var(--fx-formula-editor-body-height);
  overflow: visible;
  position: relative;
}

.fx-formula-kity-host {
  width: 100%;
  height: var(--fx-formula-editor-body-height);
  min-height: var(--fx-formula-editor-body-height);
  overflow: visible;
  position: relative;
}

.fx-formula-kity-host .kf-editor {
  height: var(--fx-formula-editor-body-height) !important;
  overflow: visible !important;
}

.fx-formula-kity-host .kf-editor-toolbar {
  overflow: visible;
  position: relative;
  z-index: 20;
}

.fx-formula-kity-host .kf-editor-ui-button-mount-point,
.fx-formula-kity-host .kf-editor-ui-area-mount,
.fx-formula-kity-host .kf-editor-ui-box,
.fx-formula-kity-host .kf-editor-ui-list {
  z-index: 1000;
}

.fx-formula-kity-host .kf-editor-edit-area,
.fx-formula-kity-host .kf-editor-canvas-container {
  min-height: var(--fx-formula-workspace-height);
  height: var(--fx-formula-workspace-height);
}

.fx-formula-kity-host .kf-editor-edit-area {
  flex: 0 0 auto;
  overflow: hidden;
}

.fx-formula-kity-host .kf-editor,
.fx-formula-kity-host .kf-editor svg text,
.fx-formula-kity-host .kf-editor-ui-area-item-text,
.fx-formula-kity-host .kf-editor-ui-box-item-text,
.fx-formula-kity-host .kf-editor-ui-box-item-val,
.formulax-math__render {
  font-family: "KF AMS MAIN", "Cambria Math", "Latin Modern Math", "Times New Roman", serif !important;
}

.fx-formula-kity-host .kf-editor-ui-box-item-content,
.fx-formula-kity-host .kf-editor-ui-box-item-val {
  min-width: 32px;
  min-height: 32px;
}

.fx-formula-kity-host .kf-editor-ui-box-item-val svg,
.fx-formula-kity-host .kf-editor-ui-box-item-val img,
.fx-formula-kity-host .kf-editor-ui-area-item-img,
.fx-formula-kity-host .kf-editor-ui-area-item-text {
  display: block;
}

.fx-formula-editor-loading {
  height: var(--fx-formula-editor-body-height);
  padding: 24px;
  color: #4b5563;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fx-formula-editor-error {
  padding: 24px;
  color: #dc2626;
  font-size: 14px;
}

.fx-formula-editor-error pre {
  white-space: pre-wrap;
  word-break: break-all;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
}

.fx-formula-modal__footer {
  min-height: 64px;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 0 0 14px 14px;
}

.fx-formula-modal__button {
  appearance: none;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #111827;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
}

.fx-formula-modal__button--primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}

.formulax-math {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  line-height: 1;
  padding: 0 2px;
  margin: 0 1px;
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
  user-select: none;
}

.formulax-math:hover {
  outline: 1px solid rgba(37, 99, 235, 0.35);
  background: rgba(37, 99, 235, 0.06);
}

.formulax-math__svg {
  display: inline-block;
  flex: 0 0 auto;
  max-width: 100%;
  vertical-align: -0.35em;
  pointer-events: none;
}

.formulax-math__image {
  display: inline-block;
  max-width: 100%;
  height: auto;
  vertical-align: middle;
  pointer-events: none;
}
`;

export function ensureFormulaXModalStyles(doc: Document = document): void {
  if (doc.getElementById(STYLE_ID)) return;

  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = formulaXModalStyles;
  doc.head.appendChild(style);
}

export function mountFormulaXEditor(
  root: HTMLElement,
  options: FormulaXEditorOptions = {},
): MountedFormulaXEditor {
  let destroyed = false;
  let latestLatex = options.initialLatex ?? '';
  let handle: KityEditorHandle | null = null;
  const initialLatex = latestLatex.trim() ? latestLatex : EMPTY_FORMULA_PLACEHOLDER;

  root.classList.add('fx-formula-kity-host');
  root.innerHTML = `
    <div class="fx-formula-editor-loading" role="status" aria-live="polite">
      Loading FormulaX editor...
    </div>
  `;

  const readyPromise = mountKityEditor(root, {
    initialLatex,
    height: options.height ?? '100%',
    autofocus: options.autofocus ?? true,
    assets: options.assets,
    render: {
      fontsize: options.render?.fontsize ?? 40,
    },
  })
    .then((nextHandle) => {
      if (destroyed) {
        nextHandle.destroy();
        throw new Error('FormulaX editor mount cancelled');
      }

      handle = nextHandle;
      return nextHandle;
    })
    .catch((error) => {
      console.error('[FormulaX] Failed to load FormulaX editor:', error);

      if (!destroyed) {
        root.innerHTML = `
          <div class="fx-formula-editor-error">
            Failed to load FormulaX editor.
            <pre>${escapeHtml(error instanceof Error ? error.message : String(error))}</pre>
          </div>
        `;
      }

      throw error;
    });

  const getCurrentLatex = async (): Promise<string> => {
    const readyHandle = handle ?? await readyPromise;
    const latex = await tryReadLatexFromKityHandle(readyHandle);

    if (latex !== null) {
      latestLatex = latex;
    }

    return latestLatex;
  };

  return {
    root,

    getLatex: getCurrentLatex,

    async getState(): Promise<FormulaState> {
      const latex = await getCurrentLatex();

      try {
        return {
          ...createEmptyState(),
          doc: parseLatex(latex),
        };
      } catch {
        return createEmptyState();
      }
    },

    async getRenderHtml(): Promise<string> {
      await readyPromise;
      await waitForFormulaSvgLayout(root);
      return renderCurrentFormulaAsSvgHtml(root);
    },

    destroy(): void {
      if (destroyed) return;
      destroyed = true;

      void readyPromise
        .then((readyHandle) => readyHandle.destroy())
        .catch(() => undefined);

      root.innerHTML = '';
    },
  };
}

async function tryReadLatexFromKityHandle(handle: KityEditorHandle): Promise<string | null> {
  try {
    let isEmpty = false;

    handle.ready(function ready() {
      const result = this.execCommand('content.is.empty');
      isEmpty = result === true;
    });

    if (isEmpty) {
      return '';
    }
  } catch {
    // Fall back to source commands for runtimes without content.is.empty.
  }

  const candidates = [
    'get.source',
    'getSource',
    'getLatex',
    'get.latex',
    'get.content',
    'getContent',
  ];

  for (const command of candidates) {
    try {
      let value: unknown = null;

      handle.ready(function ready() {
        value = this.execCommand(command);
      });

      if (typeof value === 'string' && value.trim()) {
        return value;
      }

      if (value && typeof value === 'object' && 'latex' in value) {
        const latex = (value as { latex?: unknown }).latex;
        if (typeof latex === 'string' && latex.trim()) {
          return latex;
        }
      }
    } catch {
      // try next command
    }
  }

  return null;
}

function renderCurrentFormulaAsSvgHtml(root: HTMLElement): string {
  const svg = findFormulaSvg(root);

  if (!svg) {
    return '';
  }

  return serializeSvgForInsertion(svg);
}

async function waitForFormulaSvgLayout(root: HTMLElement): Promise<void> {
  const doc = root.ownerDocument ?? document;
  const view = doc.defaultView ?? window;

  await waitForDocumentFonts(doc);

  let previous = readRenderedFormulaBox(root);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    await waitForAnimationFrame(view);
    const current = readRenderedFormulaBox(root);

    if (previous && current && areSvgBoxesClose(previous, current)) {
      return;
    }

    previous = current;
  }
}

function findFormulaSvg(root: HTMLElement): SVGSVGElement | null {
  return root.querySelector<SVGSVGElement>(
    '.kf-editor-edit-area svg, .kf-editor-canvas-container svg, svg',
  );
}

function readRenderedFormulaBox(root: HTMLElement): SvgBox | null {
  const svg = findFormulaSvg(root);
  if (!svg) {
    return null;
  }

  return getInlineSvgContent(svg)?.box ?? readSvgBox(svg);
}

function areSvgBoxesClose(left: SvgBox, right: SvgBox): boolean {
  return Math.abs(left.x - right.x) < 0.01
    && Math.abs(left.y - right.y) < 0.01
    && Math.abs(left.width - right.width) < 0.01
    && Math.abs(left.height - right.height) < 0.01;
}

async function waitForDocumentFonts(doc: Document): Promise<void> {
  if (!doc.fonts?.ready) {
    return;
  }

  try {
    await doc.fonts.ready;
  } catch {
    // ignore font readiness errors and fall back to frame-based settling
  }
}

function waitForAnimationFrame(view: Window): Promise<void> {
  return new Promise((resolve) => {
    view.requestAnimationFrame(() => resolve());
  });
}

export function serializeSvgForInsertion(svg: SVGSVGElement): string {
  const content = getInlineSvgContent(svg);
  const inlineViewport = content ? createInlineSvgViewport(content.box) : null;
  const clone = content && inlineViewport
    ? createInlineSvgClone(svg, content, inlineViewport)
    : svg.cloneNode(true) as SVGSVGElement;

  uniquifySvgIds(clone);
  sizeSvgForInlineDisplay(clone, svg, inlineViewport);

  clone.removeAttribute('id');
  clone.removeAttribute('xmlns');
  clone.removeAttribute('xmlns:xlink');
  clone.setAttribute('class', mergeClassNames(clone.getAttribute('class'), 'formulax-math__svg'));
  clone.setAttribute('focusable', 'false');
  clone.setAttribute('aria-hidden', 'true');
  clone.setAttribute('preserveAspectRatio', clone.getAttribute('preserveAspectRatio') || 'xMinYMin meet');

  return new XMLSerializer().serializeToString(clone);
}

function getInlineSvgContent(svg: SVGSVGElement): InlineSvgContent | null {
  const candidates = [
    '[data-root="true"] > g[data-type="kf-editor-exp-content-box"]',
    'g[data-type="kf-editor-exp-content-box"]',
    'g[data-type="kf-container"]',
    'svg > g, g',
  ];

  for (const selector of candidates) {
    const content = svg.querySelector<SVGGraphicsElement>(selector);
    const rootSpace = content ? readSvgBoxInRootSpace(content) : null;
    if (content && rootSpace) {
      return {
        root: content,
        box: rootSpace.box,
        matrix: rootSpace.matrix,
      };
    }
  }

  return null;
}

function readSvgBoxInRootSpace(
  element: SVGGraphicsElement,
): Pick<InlineSvgContent, 'box' | 'matrix'> | null {
  const box = readSvgBox(element);
  const matrix = getSvgRootSpaceMatrix(element);

  if (!box || !matrix) {
    return null;
  }

  const points = [
    { x: box.x, y: box.y },
    { x: box.x + box.width, y: box.y },
    { x: box.x, y: box.y + box.height },
    { x: box.x + box.width, y: box.y + box.height },
  ].map((point) => ({
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f,
  }));

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  const width = Math.max(...xs) - x;
  const height = Math.max(...ys) - y;

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return {
    box: { x, y, width, height },
    matrix,
  };
}

function getSvgRootSpaceMatrix(element: SVGGraphicsElement): SVGMatrixLike | null {
  const elementMatrix = typeof element.getCTM === 'function' ? element.getCTM() : null;
  const rootMatrix = typeof element.ownerSVGElement?.getCTM === 'function'
    ? element.ownerSVGElement.getCTM()
    : null;

  if (!elementMatrix) {
    return null;
  }

  return rootMatrix
    ? multiplySvgMatrices(invertSvgMatrix(rootMatrix), elementMatrix)
    : toSvgMatrixLike(elementMatrix);
}

function invertSvgMatrix(matrix: DOMMatrix | SVGMatrix): SVGMatrixLike {
  const determinant = matrix.a * matrix.d - matrix.b * matrix.c;

  if (!Number.isFinite(determinant) || determinant === 0) {
    return {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 0,
      f: 0,
    };
  }

  return {
    a: matrix.d / determinant,
    b: -matrix.b / determinant,
    c: -matrix.c / determinant,
    d: matrix.a / determinant,
    e: (matrix.c * matrix.f - matrix.d * matrix.e) / determinant,
    f: (matrix.b * matrix.e - matrix.a * matrix.f) / determinant,
  };
}

function multiplySvgMatrices(
  left: DOMMatrix | SVGMatrixLike,
  right: DOMMatrix | SVGMatrixLike,
): SVGMatrixLike {
  return {
    a: left.a * right.a + left.c * right.b,
    b: left.b * right.a + left.d * right.b,
    c: left.a * right.c + left.c * right.d,
    d: left.b * right.c + left.d * right.d,
    e: left.a * right.e + left.c * right.f + left.e,
    f: left.b * right.e + left.d * right.f + left.f,
  };
}

function toSvgMatrixLike(matrix: DOMMatrix | SVGMatrix): SVGMatrixLike {
  return {
    a: matrix.a,
    b: matrix.b,
    c: matrix.c,
    d: matrix.d,
    e: matrix.e,
    f: matrix.f,
  };
}

function readSvgBox(element: SVGGraphicsElement): SvgBox | null {
  if (typeof element.getBBox !== 'function') {
    return null;
  }

  try {
    const box = element.getBBox();
    if (!Number.isFinite(box.width) || !Number.isFinite(box.height) || box.width <= 0 || box.height <= 0) {
      return null;
    }

    return {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    };
  } catch {
    return null;
  }
}

function createInlineSvgViewport(contentBox: SvgBox): SvgBox {
  const edgePadding = Math.max(0.5, Math.min(contentBox.width, contentBox.height) * 0.006);
  const inset = edgePadding / 2;

  return {
    x: contentBox.x - inset,
    y: contentBox.y - inset,
    width: contentBox.width + edgePadding,
    height: contentBox.height + edgePadding,
  };
}

function createInlineSvgClone(
  source: SVGSVGElement,
  content: InlineSvgContent,
  viewport: SvgBox,
): SVGSVGElement {
  const clone = source.cloneNode(false) as SVGSVGElement;
  const ownerDocument = source.ownerDocument;

  copySvgRootAttributes(source, clone);
  clone.setAttribute(
    'viewBox',
    `0 0 ${roundLength(viewport.width)} ${roundLength(viewport.height)}`,
  );

  Array.from(source.children).forEach((child) => {
    if (child.tagName.toLowerCase() === 'defs') {
      clone.appendChild(child.cloneNode(true));
    }
  });

  const wrapper = ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
  wrapper.setAttribute(
    'transform',
    `translate(${roundLength(-viewport.x)} ${roundLength(-viewport.y)})`,
  );
  const flattened = ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
  flattened.setAttribute(
    'transform',
    `matrix(${roundLength(content.matrix.a)} ${roundLength(content.matrix.b)} ${roundLength(content.matrix.c)} ${roundLength(content.matrix.d)} ${roundLength(content.matrix.e)} ${roundLength(content.matrix.f)})`,
  );
  flattened.appendChild(content.root.cloneNode(true));
  wrapper.appendChild(flattened);
  clone.appendChild(wrapper);

  return clone;
}

function copySvgRootAttributes(source: SVGSVGElement, target: SVGSVGElement): void {
  const excluded = new Set([
    'id',
    'width',
    'height',
    'viewBox',
    'class',
    'focusable',
    'aria-hidden',
    'xmlns',
    'xmlns:xlink',
  ]);

  Array.from(source.attributes).forEach((attribute) => {
    if (excluded.has(attribute.name)) return;
    target.setAttribute(attribute.name, attribute.value);
  });
}

function sizeSvgForInlineDisplay(
  clone: SVGSVGElement,
  source: SVGSVGElement,
  viewport: SvgBox | null,
): void {
  const viewBox = clone.viewBox?.baseVal;
  const rect = source.getBoundingClientRect();
  const width = viewport?.width || viewBox?.width || rect.width || Number(clone.getAttribute('width')) || 1;
  const height = viewport?.height || viewBox?.height || rect.height || Number(clone.getAttribute('height')) || 1;
  const ratio = Math.max(0.1, width / Math.max(1, height));
  const inlineHeightEm = 0.875;
  const inlineWidthEm = Math.min(40, Math.max(0.75, ratio * inlineHeightEm));

  clone.setAttribute('width', roundLength(width));
  clone.setAttribute('height', roundLength(height));
  clone.setAttribute(
    'style',
    mergeInlineStyles(
      clone.getAttribute('style'),
      `width:${roundLength(inlineWidthEm)}em`,
      `height:${inlineHeightEm}em`,
    ),
  );
}

function roundLength(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

function uniquifySvgIds(svg: SVGSVGElement): void {
  const idMap = new Map<string, string>();
  const prefix = `fx-${randomIdPrefix()}-`;
  const elementsWithId = svg.querySelectorAll<Element>('[id]');

  elementsWithId.forEach((element) => {
    const id = element.getAttribute('id');
    if (!id) return;

    const nextId = `${prefix}${id}`;
    idMap.set(id, nextId);
    element.setAttribute('id', nextId);
  });

  if (!idMap.size) return;

  svg.querySelectorAll<Element>('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const nextValue = rewriteSvgReferences(attribute.value, idMap);
      if (nextValue !== attribute.value) {
        element.setAttribute(attribute.name, nextValue);
      }
    });
  });
}

function randomIdPrefix(): string {
  return Math.random().toString(36).slice(2, 5).padEnd(3, '0');
}

function rewriteSvgReferences(value: string, idMap: Map<string, string>): string {
  let nextValue = value;

  idMap.forEach((nextId, id) => {
    nextValue = nextValue
      .replaceAll(`#${id}`, `#${nextId}`)
      .replaceAll(`url(${id})`, `url(${nextId})`)
      .replaceAll(`url(#${id})`, `url(#${nextId})`);
  });

  return nextValue;
}

function mergeClassNames(...values: Array<string | null | undefined>): string {
  return values
    .flatMap((value) => value?.split(/\s+/) ?? [])
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index)
    .join(' ');
}

function mergeInlineStyles(...values: Array<string | null | undefined>): string {
  return values
    .flatMap((value) => value?.split(';') ?? [])
    .map((value) => value.trim())
    .filter(Boolean)
    .join('; ');
}
