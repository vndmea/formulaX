export class RadicalOperatorModule {
  static create(kity: any, Operator: any) {
    const SHAPE_DATA_WIDTH = 1;
    const radians = (2 * Math.PI) / 360;
    const sin15 = Math.sin(15 * radians);
    const cos15 = Math.cos(15 * radians);
    const tan15 = Math.tan(15 * radians);

    return kity.createClass("RadicalOperator", {
      base: Operator,
      constructor: function () {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase("Radical");
        }
        Operator.call(this, "Radical");
      },
      applyOperand: function (radicand: any, exponent: any) {
        const decoration = generateDecoration(radicand);
        const vLine = generateVLine(radicand);
        const padding = 5;
        const hLine = generateHLine(radicand);
        this.addOperatorShape(decoration);
        this.addOperatorShape(vLine);
        this.addOperatorShape(hLine);
        adjustmentPosition.call(this, mergeShape(decoration, vLine, hLine), this.operatorShape, radicand, exponent);
        this.parentExpression.expand(0, padding * 2);
        this.parentExpression.translateElement(0, padding);
      }
    });

    function generateDecoration(radicand: any) {
      const shape = new kity.Path();
      const a = SHAPE_DATA_WIDTH;
      const h = radicand.getHeight() / 3;
      const drawer = shape.getDrawer();
      drawer.moveTo(0, cos15 * a * 6);
      drawer.lineBy(sin15 * a, cos15 * a);
      drawer.lineBy(cos15 * a * 3, -sin15 * a * 3);
      drawer.lineBy(tan15 * h, h);
      drawer.lineBy(sin15 * a * 3, -cos15 * a * 3);
      drawer.lineBy(-sin15 * h, -h);
      drawer.close();
      return shape.fill("black");
    }

    function generateVLine(operand: any) {
      const shape = new kity.Path();
      const h = operand.getHeight() * 0.9;
      const drawer = shape.getDrawer();
      drawer.moveTo(tan15 * h, 0);
      drawer.lineTo(0, h);
      drawer.lineBy(sin15 * SHAPE_DATA_WIDTH * 3, cos15 * SHAPE_DATA_WIDTH * 3);
      drawer.lineBy(tan15 * h + sin15 * SHAPE_DATA_WIDTH * 3, -(h + 3 * SHAPE_DATA_WIDTH * cos15));
      drawer.close();
      return shape.fill("black");
    }

    function generateHLine(operand: any) {
      const w = operand.getWidth() + 2 * SHAPE_DATA_WIDTH;
      return new kity.Rect(w, 2 * SHAPE_DATA_WIDTH).fill("black");
    }

    function mergeShape(decoration: any, vLine: any, hLine: any) {
      const decoBox = decoration.getFixRenderBox();
      let vLineBox = vLine.getFixRenderBox();
      vLine.translate(decoBox.width - sin15 * SHAPE_DATA_WIDTH * 3, 0);
      decoration.translate(0, vLineBox.height - decoBox.height);
      vLineBox = vLine.getFixRenderBox();
      hLine.translate(vLineBox.x + vLineBox.width - SHAPE_DATA_WIDTH / cos15, 0);
      return {
        x: vLineBox.x + vLineBox.width - SHAPE_DATA_WIDTH / cos15,
        y: 0
      };
    }

    function adjustmentPosition(this: any, position: any, operator: any, radicand: any, exponent: any) {
      let exponentBox = null;
      const opOffset = { x: 0, y: 0 };
      const opBox = operator.getFixRenderBox();
      exponent.scale(0.66);
      exponentBox = exponent.getFixRenderBox();
      if (exponentBox.width > 0 && exponentBox.height > 0) {
        opOffset.y = exponentBox.height - opBox.height / 2;
        if (opOffset.y < 0) {
          exponent.translate(0, -opOffset.y);
          opOffset.y = 0;
        }
        opOffset.x = exponentBox.width + (opBox.height / 2) * tan15 - position.x;
      }
      operator.translate(opOffset.x, opOffset.y);
      radicand.translate(opOffset.x + position.x + SHAPE_DATA_WIDTH, opOffset.y + 2 * SHAPE_DATA_WIDTH);
    }
  }
}

export const createRadicalOperatorClass = RadicalOperatorModule.create;

