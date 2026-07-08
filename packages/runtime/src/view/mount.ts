import { createEffect, createRoot } from 'solid-js';
import type { FormulaSelection } from '../core/types';
import {
  getSelectionAnchorOffset,
  getSelectionEndOffset,
  getSelectionFocusOffset,
  getSelectionRowId,
  getSelectionStartOffset,
  isCollapsedSelection,
  isNodeSelection,
} from '../core/selection';
import { buildAbsoluteLayoutState } from '../layout/absolute';
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

  const absoluteState = buildAbsoluteLayoutState(layout);
  layout.lines.forEach((line) => {
    const lineGroup = document.createElementNS(SVG_NS, 'g');
    lineGroup.setAttribute('data-formulax-line-index', String(line.index));
    lineGroup.setAttribute('transform', `translate(${line.x}, ${line.y})`);
    svg.appendChild(lineGroup);

    line.fragments.forEach((fragment) => {
      appendBox(lineGroup, fragment.box, line, fragment.x, fragment.y, null, selection?.rowId ?? null, false);
    });
  });

  if (selection) {
    const selectionOverlay = createSelectionOverlay(layout, selection, absoluteState.boxMap);
    if (selectionOverlay) {
      svg.appendChild(selectionOverlay);
    }

    const caret = createCaretElement(layout, selection, absoluteState.boxMap);
    if (caret) {
      svg.appendChild(caret);
    }
  }
}

function appendBox(
  parent: SVGElement,
  box: LayoutBox,
  line: LayoutLine,
  offsetX: number,
  offsetY: number,
  parentRowId: string | null,
  activeRowId: string | null,
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
    group.setAttribute('data-formulax-model-child-count', String(box.modelChildCount ?? box.children.length));
  }
  if (parentRowId) {
    group.setAttribute('data-formulax-parent-row-id', parentRowId);
  }
  group.setAttribute('transform', `translate(${absoluteX}, ${absoluteY})`);
  parent.appendChild(group);

  if (box.kind === 'placeholder') {
    const isActive = parentRowId !== null && parentRowId === activeRowId;
    const placeholder = document.createElementNS(SVG_NS, 'rect');
    placeholder.setAttribute('data-formulax-role', 'placeholder');
    placeholder.setAttribute('x', box.isRootPlaceholder ? '0.5' : '1');
    placeholder.setAttribute('y', box.isRootPlaceholder ? '0.5' : '1');
    placeholder.setAttribute('rx', box.isRootPlaceholder ? '6' : '2');
    placeholder.setAttribute('ry', box.isRootPlaceholder ? '6' : '2');
    placeholder.setAttribute('width', String(Math.max(0, box.width - (box.isRootPlaceholder ? 1 : 2))));
    placeholder.setAttribute('height', String(Math.max(0, box.height - (box.isRootPlaceholder ? 1 : 2))));
    placeholder.setAttribute('fill', isActive ? 'rgba(37, 99, 235, 0.08)' : (box.isRootPlaceholder ? 'rgba(37, 99, 235, 0.03)' : 'none'));
    placeholder.setAttribute('stroke', isActive ? '#2563eb' : '#4b5563');
    placeholder.setAttribute('stroke-width', '1');
    placeholder.setAttribute('stroke-dasharray', box.isRootPlaceholder ? '6 4' : '5 5');
    group.appendChild(placeholder);

    if (box.placeholderLabel) {
      const text = document.createElementNS(SVG_NS, 'text');
      text.textContent = box.placeholderLabel;
      text.setAttribute('data-formulax-role', 'placeholder-label');
      text.setAttribute('x', String(box.width / 2));
      text.setAttribute('y', String(box.height / 2));
      text.setAttribute('dy', '0.12em');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', String(Math.max(14, Math.round(box.height * 0.38))));
      text.setAttribute('fill', isActive ? '#2563eb' : '#6b7280');
      if (box.fontFamily) {
        text.setAttribute('font-family', box.fontFamily);
      }
      group.appendChild(text);
    }
  }

  if (box.kind === 'sqrt-radical') {
    const radical = document.createElementNS(SVG_NS, 'path');
    const width = Math.max(1, box.width);
    const height = Math.max(1, box.height);
    const points = [
      `M 0 ${height * 0.58}`,
      `L ${width * 0.25} ${height * 0.58}`,
      `L ${width * 0.42} ${height * 0.92}`,
      `L ${width * 0.72} 1`,
      `L ${width} 1`,
    ];
    radical.setAttribute('d', points.join(' '));
    radical.setAttribute('fill', 'none');
    radical.setAttribute('stroke', 'currentColor');
    radical.setAttribute('stroke-width', '1.35');
    radical.setAttribute('stroke-linecap', 'square');
    radical.setAttribute('stroke-linejoin', 'miter');
    group.appendChild(radical);
  }

  if (box.kind === 'symbol' || box.kind === 'unsupported' || box.kind === 'fence-delimiter') {
    const text = document.createElementNS(SVG_NS, 'text');
    text.textContent = box.text ?? '';
    text.setAttribute('x', '0');
    text.setAttribute('y', String(box.height / 2));
    text.setAttribute('dy', '0.12em');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-size', String(Math.max(12, Math.round(box.height))));
    if (box.fontFamily) {
      text.setAttribute('font-family', box.fontFamily);
    }
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
    const value = box.children[box.children.length - 1];
    if (value) {
      const radical = box.children.find((child) => child.kind === 'sqrt-radical');
      const ruleStart = radical
        ? radical.x + radical.width * 0.72
        : value.x;
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', String(ruleStart));
      line.setAttribute('x2', String(value.x + value.width));
      line.setAttribute('y1', '1');
      line.setAttribute('y2', '1');
      line.setAttribute('stroke', 'currentColor');
      line.setAttribute('stroke-width', '1.25');
      group.appendChild(line);
    }
  }

  const rowContext = box.kind === 'row' ? box.nodeId : parentRowId;
  box.children.forEach((child) => appendBox(group, child, line, 0, 0, rowContext, activeRowId));
}

function createCaretElement(
  layout: LayoutResult,
  selection: FormulaSelection,
  absoluteMap: Map<string, LayoutBox>,
): SVGElement | null {
  const rowId = getSelectionRowId(selection);
  const row = absoluteMap.get(rowId);
  const line = findSelectionLine(layout, selection);
  if (row?.placeholderRole && (row.modelChildCount ?? 0) === 0) {
    return null;
  }
  if (!row && !line) {
    return null;
  }

  if (!isCollapsedSelection(selection)) {
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

function createSelectionOverlay(
  layout: LayoutResult,
  selection: FormulaSelection,
  absoluteMap: Map<string, LayoutBox>,
): SVGElement | null {
  if (isCollapsedSelection(selection)) {
    return null;
  }

  const group = document.createElementNS(SVG_NS, 'g');
  group.setAttribute('data-formulax-role', 'selection');
  const rowId = getSelectionRowId(selection);
  const anchorOffset = getSelectionAnchorOffset(selection);
  const focusOffset = getSelectionFocusOffset(selection);
  const startOffset = getSelectionStartOffset(selection);
  const endOffset = getSelectionEndOffset(selection);

  if (isNodeSelection(selection)) {
    const target = absoluteMap.get(selection.nodeId);
    if (!target) {
      return null;
    }

    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('data-formulax-role', 'node-selection');
    rect.setAttribute('x', String(target.x - 3));
    rect.setAttribute('y', String(target.y - 3));
    rect.setAttribute('width', String(target.width + 6));
    rect.setAttribute('height', String(target.height + 6));
    rect.setAttribute('rx', '4');
    rect.setAttribute('ry', '4');
    rect.setAttribute('fill', 'rgba(37, 99, 235, 0.10)');
    rect.setAttribute('stroke', '#2563eb');
    rect.setAttribute('stroke-width', '1.25');
    group.appendChild(rect);
    return group;
  }

  if (rowId !== layout.root.rowId) {
    const row = absoluteMap.get(rowId);
    if (!row) {
      return null;
    }

    for (let index = startOffset; index < endOffset; index += 1) {
      const child = row.children[index];
      if (!child) {
        continue;
      }

      const absoluteChild = absoluteMap.get(child.nodeId) ?? child;
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('data-formulax-role', 'range-selection');
      rect.setAttribute('data-formulax-selection-direction', anchorOffset <= focusOffset ? 'forward' : 'backward');
      rect.setAttribute('x', String(absoluteChild.x));
      rect.setAttribute('y', String(absoluteChild.y));
      rect.setAttribute('width', String(absoluteChild.width));
      rect.setAttribute('height', String(absoluteChild.height));
      rect.setAttribute('fill', 'rgba(37, 99, 235, 0.18)');
      group.appendChild(rect);
    }

    return group.childNodes.length > 0 ? group : null;
  }

  const selectedLines = layout.lines.filter((line) => (
    line.fragments.some((fragment) => fragment.box.rowId === rowId)
    || (rowId === layout.root.rowId && startOffset <= line.endOffset && endOffset >= line.startOffset)
  ));

  if (selectedLines.length === 0) {
    return null;
  }

  for (const line of selectedLines) {
    const lineStartOffset = Math.max(startOffset, line.startOffset);
    const lineEndOffset = Math.min(endOffset, line.endOffset);
    if (lineEndOffset <= lineStartOffset) {
      continue;
    }

    const startX = calculateLineBoundaryX(line, lineStartOffset);
    const endX = calculateLineBoundaryX(line, lineEndOffset);
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('data-formulax-role', 'range-selection');
    rect.setAttribute('data-formulax-selection-direction', anchorOffset <= focusOffset ? 'forward' : 'backward');
    rect.setAttribute('x', String(startX));
    rect.setAttribute('y', String(line.y));
    rect.setAttribute('width', String(Math.max(0, endX - startX)));
    rect.setAttribute('height', String(line.height));
    rect.setAttribute('fill', 'rgba(37, 99, 235, 0.18)');
    group.appendChild(rect);
  }

  return group.childNodes.length > 0 ? group : null;
}

function calculateCaretX(
  layout: LayoutResult,
  selection: FormulaSelection,
  absoluteMap: Map<string, LayoutBox>,
): number {
  const rowId = getSelectionRowId(selection);
  const offset = getSelectionEndOffset(selection);
  const line = findSelectionLine(layout, selection);
  if (line) {
    if (offset <= line.startOffset) {
      return line.x + (line.fragments[0]?.x ?? 0);
    }

    if (offset >= line.endOffset) {
      const last = line.fragments[line.fragments.length - 1];
      return line.x + (last ? last.x + last.width : 0);
    }

    const fragment = line.fragments.find((item) => item.childIndex === offset);
    if (fragment) {
      return line.x + fragment.x;
    }
  }

  const row = absoluteMap.get(rowId);
  if (!row) {
    return 0;
  }

  if (offset <= 0 || row.children.length === 0) {
    return row.x;
  }

  if (offset >= row.children.length) {
    const lastChild = row.children[row.children.length - 1];
    const absoluteChild = absoluteMap.get(lastChild.nodeId);
    return absoluteChild ? absoluteChild.x + absoluteChild.width : row.x + row.width;
  }

  const nextChild = row.children[offset];
  const absoluteChild = absoluteMap.get(nextChild.nodeId);
  return absoluteChild ? absoluteChild.x : row.x;
}

function calculateLineBoundaryX(line: LayoutLine, offset: number): number {
  if (offset <= line.startOffset) {
    return line.x + (line.fragments[0]?.x ?? 0);
  }

  if (offset >= line.endOffset) {
    const last = line.fragments[line.fragments.length - 1];
    return line.x + (last ? last.x + last.width : 0);
  }

  const fragment = line.fragments.find((item) => item.childIndex === offset);
  return line.x + (fragment?.x ?? 0);
}

function findSelectionLine(layout: LayoutResult, selection: FormulaSelection): LayoutLine | null {
  const rowId = getSelectionRowId(selection);
  const startOffset = getSelectionStartOffset(selection);
  const endOffset = getSelectionEndOffset(selection);
  return layout.lines.find((line) => (
    line.fragments.some((fragment) => fragment.box.rowId === rowId)
    || (rowId === layout.root.rowId && startOffset <= line.endOffset && endOffset >= line.startOffset)
  )) ?? null;
}
