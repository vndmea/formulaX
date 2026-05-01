import { legacyKfExtDef } from '../vendor/legacy-kf-ext-def';
import { legacySysconf } from '../vendor/legacy-sysconf';
import { getLegacyKf, getLegacyKity } from '../vendor/runtime-interop';

type PlaceholderExpressionLike = {
  getLabel: () => string | null;
  expand: (width: number, height: number) => void;
  translateElement: (x: number, y: number) => void;
};

type PlaceholderOperatorInstance = {
  opShape: {
    fill: (color: string) => void;
  } | null;
  parentExpression: PlaceholderExpressionLike;
  addOperatorShape: (shape: unknown) => void;
  applyOperand: () => void;
  select: () => void;
  selectAll: () => void;
  unselect: () => void;
};

const kity = getLegacyKity() as any;
const kf = getLegacyKf() as any;

function createCommonShape(operator: PlaceholderOperatorInstance) {
  const shape = new kity.Rect(35, 50, 0, 0).stroke('black').fill('transparent');
  shape.setAttr('stroke-dasharray', '5, 5');
  operator.addOperatorShape(shape);
  return shape;
}

function createRootPlaceholder(operator: PlaceholderOperatorInstance, label: string) {
  const textShape = new kity.Text(label).fill(legacySysconf.rootPlaceholder.color);
  const shapeGroup = new kity.Group();
  const padding = 20;
  const radius = 7;
  const borderBoxShape = new kity.Rect(0, 0, 0, 0, radius).stroke(legacySysconf.rootPlaceholder.color).fill('transparent');

  textShape.setFontSize(40);
  shapeGroup.addShape(borderBoxShape);
  shapeGroup.addShape(textShape);
  operator.addOperatorShape(shapeGroup);

  const textBox = textShape.getFixRenderBox();

  borderBoxShape.stroke(legacySysconf.rootPlaceholder.color).fill('transparent');
  borderBoxShape.setSize(textBox.width + padding * 2, textBox.height + padding * 2);
  borderBoxShape.setRadius(radius);
  borderBoxShape.setAttr('stroke-dasharray', '5, 5');

  textShape.setAttr({
    dx: -textBox.x,
    dy: -textBox.y,
  });
  textShape.translate(padding, padding);

  return borderBoxShape;
}

function generateOpShape(operator: PlaceholderOperatorInstance, label: string | null) {
  if (label !== null) {
    return createRootPlaceholder(operator, label);
  }

  return createCommonShape(operator);
}

const PlaceholderOperator = kity.createClass('PlaceholderOperator', {
  base: kf.Operator,

  constructor(this: PlaceholderOperatorInstance) {
    this.opShape = null;
    if ((this as any).__formulaxNeverCallBase__) {
      (this as any).callBase('Placeholder');
    }
    kf.Operator.call(this, 'Placeholder');
  },

  applyOperand(this: PlaceholderOperatorInstance) {
    this.opShape = generateOpShape(this, this.parentExpression.getLabel());
    this.parentExpression.expand(20, 20);
    this.parentExpression.translateElement(10, 10);
  },

  select(this: PlaceholderOperatorInstance) {
    this.opShape?.fill(legacyKfExtDef.selectColor);
  },

  selectAll(this: PlaceholderOperatorInstance) {
    this.opShape?.fill(legacyKfExtDef.allSelectColor);
  },

  unselect(this: PlaceholderOperatorInstance) {
    this.opShape?.fill('transparent');
  },
});

export default PlaceholderOperator;
