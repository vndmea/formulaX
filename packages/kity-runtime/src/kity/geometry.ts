import { createClass, type KityCtor } from './class-system';
import utils from './utils';

/* ===== Box ===== */

export interface BoxInstance {
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  cx: number;
  cy: number;
  getRangeX(): number[];
  getRangeY(): number[];
  merge(another: BoxInstance): BoxInstance;
  intersect(another: BoxInstance): BoxInstance;
  expand(top: number, right?: number, bottom?: number, left?: number): BoxInstance;
  valueOf(): number[];
  toString(): string;
  isEmpty(): boolean;
  container?: unknown;
}

export interface BoxConstructor extends KityCtor<BoxInstance> {
  parse(unknown: any): BoxInstance;
}

const Box = createClass<BoxInstance>('Box', {
  constructor(x?: any, y?: any, width?: number, height?: number) {
    const box = arguments[0];
    if (box && typeof box === 'object' && ('x' in box || 'left' in box)) {
      x = box.x ?? box.left;
      y = box.y ?? box.top;
      width = box.width;
      height = box.height;
    }
    const w = (width as number) ?? 0;
    const h = (height as number) ?? 0;
    if (w < 0) {
      x = (x as number) - (width = -w);
    }
    if (h < 0) {
      y = (y as number) - (height = -h);
    }
    this.x = (x as number) || 0;
    this.y = (y as number) || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.left = this.x;
    this.right = this.x + this.width;
    this.top = this.y;
    this.bottom = this.y + this.height;
    this.cx = this.x + this.width / 2;
    this.cy = this.y + this.height / 2;
  },

  getRangeX() {
    return [this.left, this.right];
  },

  getRangeY() {
    return [this.top, this.bottom];
  },

  merge(another: any) {
    if (this.isEmpty()) return new Box(another.x, another.y, another.width, another.height);
    const left = Math.min(this.left, another.left);
    const right = Math.max(this.right, another.right);
    const top = Math.min(this.top, another.top);
    const bottom = Math.max(this.bottom, another.bottom);
    return new Box(left, top, right - left, bottom - top);
  },

  intersect(another: any) {
    if (!(another instanceof Box) || this.isEmpty() || another.isEmpty()) return new Box();
    if (
      this.right <= another.left ||
      another.right <= this.left ||
      this.bottom <= another.top ||
      another.bottom <= this.top
    )
      return new Box();
    const x = Math.max(this.left, another.left),
      y = Math.max(this.top, another.top);
    return new Box(
      x,
      y,
      Math.min(this.right, another.right) - x,
      Math.min(this.bottom, another.bottom) - y,
    );
  },

  expand(top: number, right?: number, bottom?: number, left?: number) {
    if (arguments.length < 4) {
      right = top;
      bottom = top;
      left = top;
    }
    return new Box(
      this.x - (left as number),
      this.y - top,
      this.width + (right as number) + (left as number),
      this.height + top + (bottom as number),
    );
  },

  valueOf() {
    return [this.x, this.y, this.width, this.height];
  },

  toString() {
    return (this.valueOf() as number[]).join(' ');
  },

  isEmpty() {
    return !this.width || !this.height;
  },
}) as unknown as BoxConstructor;

(Box as BoxConstructor).parse = function (unknown: any): BoxInstance {
  if (!unknown) return new Box();
  if (unknown instanceof Box) return unknown;
  if (typeof unknown === 'string') return Box.parse(unknown.split(/\s*[\s,]\s*/));
  if ('0' in unknown && '1' in unknown && '2' in unknown && '3' in unknown)
    return new Box(unknown[0], unknown[1], unknown[2], unknown[3]);
  return new Box();
};

/* ===== Point ===== */

export interface PointInstance {
  x: number;
  y: number;
  offset(dx: number | PointInstance, dy?: number): PointInstance;
  valueOf(): number[];
  toString(): string;
  spof(): PointInstance;
  round(): PointInstance;
  isOrigin(): boolean;
  container?: unknown;
}

export interface PointConstructor extends KityCtor<PointInstance> {
  fromPolar(radius: number, angle: number, unit?: string): PointInstance;
  parse(unknown: any): PointInstance;
}

const Point = createClass<PointInstance>('Point', {
  constructor(x?: number, y?: number) {
    this.x = x || 0;
    this.y = y || 0;
  },

  offset(dx: any, dy?: number) {
    if (arguments.length === 1) {
      dy = dx.y;
      dx = dx.x;
    }
    return new Point(this.x + (dx as number), this.y + (dy as number));
  },

  valueOf() {
    return [this.x, this.y];
  },

  toString() {
    return (this.valueOf() as number[]).join(' ');
  },

  spof() {
    return new Point((this.x | 0) + 0.5, (this.y | 0) + 0.5);
  },

  round() {
    return new Point(this.x | 0, this.y | 0);
  },

  isOrigin() {
    return this.x === 0 && this.y === 0;
  },
}) as unknown as PointConstructor;

(Point as PointConstructor).fromPolar = function (
  radius: number,
  angle: number,
  unit?: string,
): PointInstance {
  if (unit !== 'rad') angle = (angle / 180) * Math.PI;
  return new Point(radius * Math.cos(angle), radius * Math.sin(angle));
};

(Point as PointConstructor).parse = function (unknown: any): PointInstance {
  if (!unknown) return new Point();
  if (unknown instanceof Point) return unknown;
  if (typeof unknown === 'string') return Point.parse(unknown.split(/\s*[\s,]\s*/));
  if ('0' in unknown && '1' in unknown) return new Point(unknown[0], unknown[1]);
  return new Point();
};

/* ===== g (path utilities) ===== */

const g: Record<string, any> = {};
g.pathToString = function (pathSegment: any): string {
  pathSegment = pathSegment || this;
  if (typeof pathSegment === 'string') return pathSegment;
  if (pathSegment instanceof Array)
    return utils
      .flatten(pathSegment)
      .join(',')
      .replace(/,?([achlmqrstvxz]),?/gi, '$1');
  return '';
};

/* ===== Matrix ===== */

function d2r(deg: number) {
  return (deg * Math.PI) / 180;
}

export interface MatrixData {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

function mergeMatrixData(m2: MatrixData, m1: MatrixData): MatrixData {
  return {
    a: m1.a * m2.a + m1.c * m2.b,
    b: m1.b * m2.a + m1.d * m2.b,
    c: m1.a * m2.c + m1.c * m2.d,
    d: m1.b * m2.c + m1.d * m2.d,
    e: m1.a * m2.e + m1.c * m2.f + m1.e,
    f: m1.b * m2.e + m1.d * m2.f + m1.f,
  };
}

const mPattern = /matrix\s*\((.+)\)/i;

export interface MatrixInstance {
  m: MatrixData;
  translate(x: number, y: number): MatrixInstance;
  rotate(deg: number): MatrixInstance;
  scale(sx: number, sy?: number): MatrixInstance;
  skew(degX: number, degY?: number): MatrixInstance;
  inverse(): MatrixInstance;
  setMatrix(
    a: number | MatrixData,
    b?: number,
    c?: number,
    d?: number,
    e?: number,
    f?: number,
  ): MatrixInstance;
  getMatrix(): MatrixData;
  getTranslate(): { x: number; y: number };
  mergeMatrix(matrix: MatrixInstance): MatrixInstance;
  merge(matrix: MatrixInstance): MatrixInstance;
  toString(): string;
  valueOf(): number[];
  equals(matrix: MatrixInstance): boolean;
  transformPoint(...args: any[]): PointInstance;
  transformBox(box: BoxInstance): BoxInstance;
  clone(): MatrixInstance;
  reverse(): MatrixInstance;
}

export interface MatrixConstructor extends KityCtor<MatrixInstance> {
  parse(str: any): MatrixInstance;
  transformPoint(x: number | PointInstance, y?: number | MatrixData, m?: MatrixData): PointInstance;
  transformBox(box: BoxInstance, matrix: MatrixData): BoxInstance;
  getCTM(target: any, refer?: string | any): MatrixInstance;
}

const Matrix = createClass<MatrixInstance>('Matrix', {
  constructor(..._args: any[]) {
    if (arguments.length) {
      (this as any).setMatrix.apply(this, arguments);
    } else {
      this.setMatrix(1, 0, 0, 1, 0, 0);
    }
  },

  translate(x: number, y: number) {
    this.m = mergeMatrixData(this.m, {
      a: 1,
      c: 0,
      e: x,
      b: 0,
      d: 1,
      f: y,
    });
    return this;
  },

  rotate(deg: number) {
    const r = d2r(deg),
      s = Math.sin(r),
      c = Math.cos(r);
    this.m = mergeMatrixData(this.m, {
      a: c,
      c: -s,
      e: 0,
      b: s,
      d: c,
      f: 0,
    });
    return this;
  },

  scale(sx: number, sy?: number) {
    if (sy === undefined) sy = sx;
    this.m = mergeMatrixData(this.m, {
      a: sx,
      c: 0,
      e: 0,
      b: 0,
      d: sy,
      f: 0,
    });
    return this;
  },

  skew(degX: number, degY?: number) {
    if (degY === undefined) degY = degX;
    this.m = mergeMatrixData(this.m, {
      a: 1,
      c: Math.tan(d2r(degX)),
      e: 0,
      b: Math.tan(d2r(degY)),
      d: 1,
      f: 0,
    });
    return this;
  },

  inverse() {
    const m = this.m,
      k = m.a * m.d - m.b * m.c;
    return new Matrix(
      m.d / k,
      -m.b / k,
      -m.c / k,
      m.a / k,
      (m.c * m.f - m.e * m.d) / k,
      (m.b * m.e - m.a * m.f) / k,
    );
  },

  setMatrix(a: any, b?: number, c?: number, d?: number, e?: number, f?: number) {
    if (arguments.length === 1) {
      this.m = utils.clone(arguments[0]);
    } else {
      this.m = {
        a: a as number,
        b: b as number,
        c: c as number,
        d: d as number,
        e: e as number,
        f: f as number,
      };
    }
    return this;
  },

  getMatrix() {
    return utils.clone(this.m) as MatrixData;
  },

  getTranslate() {
    const m = this.m;
    return { x: m.e / m.a, y: m.f / m.d };
  },

  mergeMatrix(matrix: any) {
    return new Matrix(mergeMatrixData(this.m, matrix.m));
  },

  merge(matrix: any) {
    return this.mergeMatrix(matrix);
  },

  toString() {
    return (this.valueOf() as number[]).join(' ');
  },

  valueOf() {
    const m = this.m;
    return [m.a, m.b, m.c, m.d, m.e, m.f];
  },

  equals(matrix: any) {
    const m1 = this.m,
      m2 = matrix.m;
    return (
      m1.a === m2.a &&
      m1.b === m2.b &&
      m1.c === m2.c &&
      m1.d === m2.d &&
      m1.e === m2.e &&
      m1.f === m2.f
    );
  },

  transformPoint() {
    return ((Matrix as MatrixConstructor).transformPoint as Function).apply(
      null,
      ([].slice.call(arguments) as any[]).concat([this.m]),
    );
  },

  transformBox(box: any) {
    return (Matrix as MatrixConstructor).transformBox(box, this.m);
  },

  clone() {
    return new Matrix(this.m);
  },

  reverse() {
    return this.inverse();
  },
}) as unknown as MatrixConstructor;

(Matrix as MatrixConstructor).parse = function (str: any): MatrixInstance {
  const f = parseFloat;
  if (str instanceof Array)
    return new Matrix({
      a: f(str[0]),
      b: f(str[1]),
      c: f(str[2]),
      d: f(str[3]),
      e: f(str[4]),
      f: f(str[5]),
    });
  const match = mPattern.exec(str);
  if (match) {
    let values = match[1].split(',');
    if (values.length !== 6) values = match[1].split(' ');
    return new Matrix({
      a: f(values[0]),
      b: f(values[1]),
      c: f(values[2]),
      d: f(values[3]),
      e: f(values[4]),
      f: f(values[5]),
    });
  }
  return new Matrix();
};

(Matrix as MatrixConstructor).transformPoint = function (
  x: any,
  y?: any,
  m?: MatrixData,
): PointInstance {
  if (arguments.length === 2) {
    m = y;
    y = x.y;
    x = x.x;
  }
  return new Point(
    m!.a * (x as number) + m!.c * (y as number) + m!.e,
    m!.b * (x as number) + m!.d * (y as number) + m!.f,
  );
};

(Matrix as MatrixConstructor).transformBox = function (box: any, matrix: MatrixData): BoxInstance {
  let xMin = Number.MAX_VALUE,
    xMax = -Number.MAX_VALUE,
    yMin = Number.MAX_VALUE,
    yMax = -Number.MAX_VALUE;
  const bps = [
    [box.x, box.y],
    [box.x + box.width, box.y],
    [box.x, box.y + box.height],
    [box.x + box.width, box.y + box.height],
  ];
  const rps: PointInstance[] = [];
  let bp: number[] | undefined;
  while ((bp = bps.pop())) {
    const rp = (Matrix as MatrixConstructor).transformPoint(bp[0], bp[1], matrix);
    rps.push(rp);
    xMin = Math.min(xMin, rp.x);
    xMax = Math.max(xMax, rp.x);
    yMin = Math.min(yMin, rp.y);
    yMax = Math.max(yMax, rp.y);
  }
  const result = new Box({
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin,
  });
  utils.extend(result, { closurePoints: rps });
  return result;
};

function getTransformToElement(target: SVGGraphicsElement, source: SVGGraphicsElement): DOMMatrix {
  try {
    return source.getScreenCTM()!.inverse().multiply(target.getScreenCTM()!);
  } catch {
    throw new Error("Unable to invert the source element's transformation matrix.");
  }
}

(Matrix as MatrixConstructor).getCTM = function (
  target: any,
  refer?: string | any,
): MatrixInstance {
  let ctm: MatrixData = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0,
  };
  const node = target.shapeNode || target.node;
  refer = refer || 'parent';
  switch (refer) {
    case 'screen':
      ctm = node.getScreenCTM();
      break;
    case 'doc':
    case 'paper':
      ctm = node.getCTM();
      break;
    case 'view':
    case 'top':
      if (target.getPaper()) {
        ctm = getTransformToElement(node, target.getPaper().shapeNode);
      }
      break;
    case 'parent':
      if (target.node.parentNode) {
        ctm = getTransformToElement(node, target.node.parentNode);
      }
      break;
    default:
      if (refer && (refer as any).node) {
        ctm = getTransformToElement(node, (refer as any).shapeNode || (refer as any).node);
      }
  }
  return new Matrix(ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f);
};

export { Box, Point, g, Matrix };
