export interface SvgBox {
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

export function readRenderedFormulaSvgBox(svg: SVGSVGElement): SvgBox | null {
  return getInlineSvgContent(svg)?.box ?? readSvgBox(svg);
}

export function serializeSvgForInsertion(svg: SVGSVGElement): string {
  const content = getInlineSvgContent(svg);
  const inlineViewport = content ? createInlineSvgViewport(content.box) : null;
  const clone = content && inlineViewport
    ? createInlineSvgClone(svg, content, inlineViewport)
    : svg.cloneNode(true) as SVGSVGElement;

  uniquifySvgIds(clone);
  sizeSvgForInlineDisplay(clone, svg, inlineViewport);
  clone.setAttribute('focusable', 'false');
  clone.setAttribute('aria-hidden', 'true');
  clone.setAttribute('class', mergeClassNames(clone.getAttribute('class'), 'formulax-math__svg'));

  return clone.outerHTML;
}

function getInlineSvgContent(svg: SVGSVGElement): InlineSvgContent | null {
  const selectorCandidates = [
    '[data-type="kf-editor-exp-content-box"]',
    '[data-root="true"] [data-type="kf-editor-exp-content-box"]',
    'g[data-root="true"]',
  ];

  for (const selector of selectorCandidates) {
    const element = svg.querySelector<SVGGraphicsElement>(selector);
    if (!element) continue;

    const rootSpace = readSvgBoxInRootSpace(element);
    if (!rootSpace) continue;

    return {
      box: rootSpace.box,
      matrix: rootSpace.matrix,
      root: element,
    };
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
