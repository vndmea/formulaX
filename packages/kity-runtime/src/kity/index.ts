import { createClass, extendClass, Class } from './class-system';
import utils, { type KityUtils } from './utils';
import { Box, Point, g, Matrix } from './geometry';
import {
  svg,
  EventHandler,
  Styled,
  Data,
  Container,
  Shape,
  ShapeContainer,
  ViewBox,
  PathDrawer,
  Path,
  Rect,
  Group,
  Text,
  Paper,
  Use,
} from './graphics';

export interface Kity {
  version: string;
  createClass: typeof createClass;
  extendClass: typeof extendClass;
  Utils: KityUtils;
  Class: typeof Class;
  Box: typeof Box;
  Point: typeof Point;
  Matrix: typeof Matrix;
  g: typeof g;
  Container: typeof Container;
  Shape: typeof Shape;
  ShapeContainer: typeof ShapeContainer;
  Group: typeof Group;
  Rect: typeof Rect;
  Path: typeof Path;
  Text: typeof Text;
  Paper: typeof Paper;
  Use: typeof Use;
  ViewBox: typeof ViewBox;
  EventHandler: typeof EventHandler;
  Styled: typeof Styled;
  Data: typeof Data;
  PathDrawer: typeof PathDrawer;
  svg: typeof svg;
}

const kity: Kity = {
  version: '2.0.5',
  createClass,
  extendClass,
  Utils: utils as unknown as KityUtils,
  Class: Class as unknown as typeof Class,
  Box: Box as unknown as typeof Box,
  Point: Point as unknown as typeof Point,
  Matrix: Matrix as unknown as typeof Matrix,
  g,
  Container: Container as unknown as typeof Container,
  Shape: Shape as unknown as typeof Shape,
  ShapeContainer: ShapeContainer as unknown as typeof ShapeContainer,
  Group: Group as unknown as typeof Group,
  Rect: Rect as unknown as typeof Rect,
  Path: Path as unknown as typeof Path,
  Text: Text as unknown as typeof Text,
  Paper: Paper as unknown as typeof Paper,
  Use: Use as unknown as typeof Use,
  ViewBox: ViewBox as unknown as typeof ViewBox,
  EventHandler: EventHandler as unknown as typeof EventHandler,
  Styled: Styled as unknown as typeof Styled,
  Data: Data as unknown as typeof Data,
  PathDrawer: PathDrawer as unknown as typeof PathDrawer,
  svg,
};

export default kity;

export function installKityRuntime(targetWindow: Window & typeof globalThis = window) {
  if ((targetWindow as any).kity) {
    return;
  }
  (targetWindow as any).kity = kity;
}
