import { createEffect, createRoot } from 'solid-js';
import type { FormulaSelection } from '../core/types';
import type { LayoutBox, LayoutLine, LayoutResult } from '../layout/types';

const SVG_NS = 'http://www.w3.org/2000/svg';

export interface FormulaSvgViewState {
  getLayout: () => LayoutResult;
  getSelection: () => FormulaSelection | null;
  readOnly?: boolean;
}

export interface MountedFormulaSvgView {
  dispose: () => void;
  sync: (layout: LayoutResult, selection: FormulaSelection | null) => void;
}

export function mountFormulaSvgView(
  host: HTMLElement,
  state: FormulaSvgViewState,
): MountedFormulaSvgView {
  host.innerHTML = '';
  let svg: SVGSVGElement | null = null;
  const dispose = createRoot((disposeRoot) => {
    svg = document.createElementNS(SVG_NS, 'svg');
    svg.classList.add('formulax-math__svg', 'fx-runtime-svg');
    svg.setAttribute('data-formulax-runtime', 'solid-svg');
    svg.setAttribute('aria-hidden', 'true');
    host.appendChild(svg);
    syncSvg(svg, state.getLayout(), state.getSelection());

    createEffect(() => {
      if (!svg) {
        return;
      }
      const layout = state.getLayout();
      const selection = state.getSelection();
      syncSvg(svg, layout, selection);
    });

    return disposeRoot;
  });

  return {
    dispose: () => {
      dispose();
      host.innerHTML = '';
    },
    sync: (layout, selection) => {
      if (!svg) {
        return;
      }
      syncSvg(svg, layout, selection);
    },
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
  layout.lines.forEach((line) => {
    const lineGroup = document.createElementNS(SVG_NS, 'g');
    lineGroup.setAttribute('data-formulax-line-index', String(line.index));
    lineGroup.setAttribute('transform', `translate(${line.x}, ${line.y})`);
    svg.appendChild(lineGroup);

    line.fragments.forEach((fragment) => {
      buildAbsoluteMap(fragment.box, fragment.x, line.y, absoluteMap, false);
      appendBox(lineGroup, fragment.box, line, fragment.x, 0, null, false);
    });
  });

  if (selection) {
    const caret = createCaretElement(layout, selection, absoluteMap);
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
  includeOwnPosition = true,
): void {
  const absolute = {
    ...box,
    x: offsetX + (includeOwnPosition ? box.x : 0),
    y: offsetY + (includeOwnPosition ? box.y : 0),
  };
  map.set(box.nodeId, absolute);
  box.children.forEach((child) => buildAbsoluteMap(child, absolute.x, absolute.y, map));
}

function appendBox(
  parent: SVGElement,
  box: LayoutBox,
  line: LayoutLine,
  offsetX: number,
  offsetY: number,
  parentRowId: string | null,
  includeOwnPosition = true,
): void {
  const absoluteX = offsetX + (includeOwnPosition ? box.x : 0);
  const absoluteY = offsetY + (includeOwnPosition ? box.y : 0);
  const group = document.createElementNS(SVG_NS, 'g');
  group.setAttribute('data-formulax-node-id', box.nodeId);
  group.setAttribute('data-formulax-box-kind', box.kind);
  group.setAttribute('data-formulax-line-index', String(line.index));
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
  box.children.forEach((child) => appendBox(group, child, line, 0, 0, rowContext));
}

function createCaretElement(
  layout: LayoutResult,
  selection: FormulaSelection,
  absoluteMap: Map<string, LayoutBox>,
): SVGElement | null {
  const row = absoluteMap.get(selection.rowId);
  const line = findSelectionLine(layout, selection);
  if (!row && !line) {
    return null;
  }

  const caretX = calculateCaretX(layout, selection, absoluteMap);
  const caret = document.createElementNS(SVG_NS, 'line');
  caret.setAttribute('data-formulax-role', 'caret');
  caret.setAttribute('x1', String(caretX));
  caret.setAttribute('x2', String(caretX));
  const caretTop = row?.y ?? line?.y ?? 0;
  const caretBottom = row ? row.y + row.height : (line ? line.y + line.height : 0);
  caret.setAttribute('y1', String(caretTop));
  caret.setAttribute('y2', String(caretBottom));
  caret.setAttribute('stroke', '#2563eb');
  caret.setAttribute('stroke-width', '1.5');
  return caret;
}

function calculateCaretX(
  layout: LayoutResult,
  selection: FormulaSelection,
  absoluteMap: Map<string, LayoutBox>,
): number {
  const line = findSelectionLine(layout, selection);
  if (line) {
    if (selection.offset <= line.startOffset) {
      return line.x + (line.fragments[0]?.x ?? 0);
    }

    if (selection.offset >= line.endOffset) {
      const last = line.fragments[line.fragments.length - 1];
      return line.x + (last ? last.x + last.width : 0);
    }

    const fragment = line.fragments.find((item) => item.childIndex === selection.offset);
    if (fragment) {
      return line.x + fragment.x;
    }
  }

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

function findSelectionLine(layout: LayoutResult, selection: FormulaSelection): LayoutLine | null {
  return layout.lines.find((line) => (
    line.fragments.some((fragment) => fragment.box.rowId === selection.rowId)
    || (selection.rowId === layout.root.rowId && selection.offset >= line.startOffset && selection.offset <= line.endOffset)
  )) ?? null;
}
