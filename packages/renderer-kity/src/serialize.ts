import {
  readRenderedFormulaSvgBox,
  serializeSvgForInsertion,
  type SvgBox,
} from '@formulaxjs/renderer';
import { waitForAnimationFrame, waitForDocumentFonts } from './dom';

export function findKityFormulaSvg(root: HTMLElement): SVGSVGElement | null {
  return root.querySelector<SVGSVGElement>(
    '.kf-editor-edit-area svg, .kf-editor-canvas-container svg, svg',
  );
}

export function serializeKityFormulaFromRoot(root: HTMLElement): string {
  const svg = findKityFormulaSvg(root);

  if (!svg) {
    return '';
  }

  return serializeSvgForInsertion(svg);
}

export async function waitForKityFormulaSvgLayout(root: HTMLElement): Promise<void> {
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

function readRenderedFormulaBox(root: HTMLElement): SvgBox | null {
  const svg = findKityFormulaSvg(root);

  if (!svg) {
    return null;
  }

  return readRenderedFormulaSvgBox(svg);
}

function areSvgBoxesClose(left: SvgBox, right: SvgBox): boolean {
  return Math.abs(left.x - right.x) < 0.01
    && Math.abs(left.y - right.y) < 0.01
    && Math.abs(left.width - right.width) < 0.01
    && Math.abs(left.height - right.height) < 0.01;
}
