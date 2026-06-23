import { createEffect, createRoot } from 'solid-js';
import type { FormulaSelection } from '../core/types';
import type { LayoutBox, LayoutResult } from '../layout/types';

const SVG_NS = 'http://www.w3.org/2000/svg';

export interface FormulaSvgViewState {
  getLayout: () => LayoutResult;
  getSelection: () => FormulaSelection | null;
  readOnly?: boolean;
}

export function mountFormulaSvgView(
  host: HTMLElement,
  state: FormulaSvgViewState,
): () => void {
  host.innerHTML = '';
  const dispose = createRoot((disposeRoot) => {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.classList.add('formulax-math__svg', 'fx-runtime-svg');
    svg.setAttribute('data-formulax-runtime', 'solid-svg');
    svg.setAttribute('aria-hidden', 'true');
    host.appendChild(svg);

    createEffect(() => {
      const layout = state.getLayout();
      const selection = state.getSelection();
      syncSvg(svg, layout, selection);
    });

    return disposeRoot;
  });

  return () => {
    dispose();
    host.innerHTML = '';
  };
}

function syncSvg(
  svg: SVGSVGElement,
  layout: LayoutResult,
  selection: FormulaSelection | null,
): void {
  svg.replaceChildren();
  svg.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
  svg.setAttribute('width', String(layout.width));
  svg.setAttribute('height', String(layout.height));
  svg.style.overflow = 'visible';

  const absoluteMap = new Map<string, LayoutBox>();
  buildAbsoluteMap(layout.root, 0, 0, absoluteMap);
  appendBox(svg, layout.root, absoluteMap, null, 0, 0);

  if (selection) {
    const caret = createCaretElement(layout.root, selection, absoluteMap);
    if (caret) {
      svg.appendChild(caret);
    }
  }
}

function buildAbsoluteMap(
  box: LayoutBox,
  offsetX: number,
  offsetY: number,
  map: Map<string, LayoutBox>,
): void {
  const absolute = {
    ...box,
    x: offsetX + box.x,
    y: offsetY + box.y,
  };
  map.set(box.nodeId, absolute);
  box.children.forEach((child) => buildAbsoluteMap(child, absolute.x, absolute.y, map));
}

function appendBox(
  parent: SVGElement,
  box: LayoutBox,
  absoluteMap: Map<string, LayoutBox>,
  parentRowId: string | null,
  offsetX: number,
  offsetY: number,
): void {
  const absoluteX = offsetX + box.x;
  const absoluteY = offsetY + box.y;
  const group = document.createElementNS(SVG_NS, 'g');
  group.setAttribute('data-formulax-node-id', box.nodeId);
  group.setAttribute('data-formulax-box-kind', box.kind);
  if (box.rowId) {
    group.setAttribute('data-formulax-row-id', box.rowId);
  }
  if (parentRowId) {
    group.setAttribute('data-formulax-parent-row-id', parentRowId);
  }
  group.setAttribute('transform', `translate(${absoluteX}, ${absoluteY})`);
  parent.appendChild(group);

  if (box.kind === 'symbol' || box.kind === 'unsupported' || box.kind === 'fence-delimiter' || box.kind === 'sqrt-radical') {
    const text = document.createElementNS(SVG_NS, 'text');
    text.textContent = box.text ?? '';
    text.setAttribute('x', '0');
    text.setAttribute('y', String(box.ascent));
    text.setAttribute('dominant-baseline', 'alphabetic');
    text.setAttribute('font-size', String(Math.max(12, Math.round(box.height))));
    group.appendChild(text);
  }

  if (box.kind === 'frac') {
    const line = document.createElementNS(SVG_NS, 'line');
    const ruleY = box.children[0]?.height + 3;
    line.setAttribute('x1', '0');
    line.setAttribute('x2', String(box.width));
    line.setAttribute('y1', String(ruleY));
    line.setAttribute('y2', String(ruleY));
    line.setAttribute('stroke', 'currentColor');
    line.setAttribute('stroke-width', '1.5');
    group.appendChild(line);
  }

  if (box.kind === 'sqrt') {
    const value = box.children[1];
    if (value) {
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', String(value.x));
      line.setAttribute('x2', String(value.x + value.width));
      line.setAttribute('y1', '1');
      line.setAttribute('y2', '1');
      line.setAttribute('stroke', 'currentColor');
      line.setAttribute('stroke-width', '1.25');
      group.appendChild(line);
    }
  }

  const rowContext = box.kind === 'row' ? box.nodeId : parentRowId;
  box.children.forEach((child) => appendBox(group, child, absoluteMap, rowContext, 0, 0));
}

function createCaretElement(
  root: LayoutBox,
  selection: FormulaSelection,
  absoluteMap: Map<string, LayoutBox>,
): SVGElement | null {
  const row = absoluteMap.get(selection.rowId);
  if (!row) {
    return null;
  }

  const caretX = calculateCaretX(root, selection, absoluteMap);
  const caret = document.createElementNS(SVG_NS, 'line');
  caret.setAttribute('data-formulax-role', 'caret');
  caret.setAttribute('x1', String(caretX));
  caret.setAttribute('x2', String(caretX));
  caret.setAttribute('y1', String(row.y));
  caret.setAttribute('y2', String(row.y + row.height));
  caret.setAttribute('stroke', '#2563eb');
  caret.setAttribute('stroke-width', '1.5');
  return caret;
}

function calculateCaretX(
  root: LayoutBox,
  selection: FormulaSelection,
  absoluteMap: Map<string, LayoutBox>,
): number {
  const row = absoluteMap.get(selection.rowId);
  if (!row) {
    return 0;
  }

  if (selection.offset <= 0 || row.children.length === 0) {
    return row.x;
  }

  if (selection.offset >= row.children.length) {
    const lastChild = row.children[row.children.length - 1];
    const absoluteChild = absoluteMap.get(lastChild.nodeId);
    return absoluteChild ? absoluteChild.x + absoluteChild.width : row.x + row.width;
  }

  const nextChild = row.children[selection.offset];
  const absoluteChild = absoluteMap.get(nextChild.nodeId);
  return absoluteChild ? absoluteChild.x : row.x;
}
