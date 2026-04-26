export interface Position {
  top: number;
  left: number;
}

export function getPosition(anchor: HTMLElement, popup: HTMLElement): Position {
  const anchorRect = anchor.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();

  let top = anchorRect.bottom + window.scrollY;
  let left = anchorRect.left + window.scrollX;

  if (top + popupRect.height > window.innerHeight + window.scrollY) {
    top = anchorRect.top + window.scrollY - popupRect.height;
  }

  if (left + popupRect.width > window.innerWidth + window.scrollX) {
    left = window.innerWidth + window.scrollX - popupRect.width;
  }

  return { top, left };
}

export function isInside(element: HTMLElement, point: { x: number; y: number }): boolean {
  const rect = element.getBoundingClientRect();
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}
