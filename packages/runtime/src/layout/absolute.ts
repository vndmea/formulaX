import type { LayoutBox, LayoutResult } from './types';

export interface AbsoluteLayoutState {
  boxMap: Map<string, LayoutBox>;
  rowBoxes: LayoutBox[];
}

export function buildAbsoluteLayoutState(layout: LayoutResult): AbsoluteLayoutState {
  const boxMap = new Map<string, LayoutBox>();
  const rowBoxes: LayoutBox[] = [];

  for (const line of layout.lines) {
    for (const fragment of line.fragments) {
      collectAbsoluteBoxes(fragment.box, line.x + fragment.x, line.y + fragment.y, boxMap, rowBoxes, false);
    }
  }

  return { boxMap, rowBoxes };
}

function collectAbsoluteBoxes(
  box: LayoutBox,
  offsetX: number,
  offsetY: number,
  boxMap: Map<string, LayoutBox>,
  rowBoxes: LayoutBox[],
  includeOwnPosition = true,
): void {
  const absolute = {
    ...box,
    x: offsetX + (includeOwnPosition ? box.x : 0),
    y: offsetY + (includeOwnPosition ? box.y : 0),
  };

  boxMap.set(box.nodeId, absolute);
  if (absolute.kind === 'row' && absolute.rowId) {
    rowBoxes.push(absolute);
  }

  for (const child of box.children) {
    collectAbsoluteBoxes(child, absolute.x, absolute.y, boxMap, rowBoxes);
  }
}
