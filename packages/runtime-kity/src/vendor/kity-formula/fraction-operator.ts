export class FractionOperatorModule {
  static create(kity: any, ZOOM: number, Operator: any) {
    return kity.createClass("FractionOperator", {
      base: Operator,
      constructor: function () {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase("Fraction");
        }
        Operator.call(this, "Fraction");
      },
      applyOperand: function (upOperand: any, downOperand: any) {
        upOperand.scale(ZOOM);
        downOperand.scale(ZOOM);
        const upWidth = Math.ceil(upOperand.getWidth());
        const downWidth = Math.ceil(downOperand.getWidth());
        const upHeight = Math.ceil(upOperand.getHeight());
        const downHeight = Math.ceil(downOperand.getHeight());
        const overflow = 3;
        const padding = 1;
        const maxWidth = Math.max(upWidth, downWidth);
        const maxHeight = Math.max(upHeight, downHeight);
        const operatorShape = new kity.Rect(maxWidth + overflow * 2, 1).fill("black");
        this.addOperatorShape(operatorShape);
        upOperand.translate((maxWidth - upWidth) / 2 + overflow, 0);
        operatorShape.translate(0, upHeight + 1);
        downOperand.translate((maxWidth - downWidth) / 2 + overflow, upHeight + operatorShape.getHeight() + 2);
        this.parentExpression.setOffset(maxHeight - upHeight, maxHeight - downHeight);
        this.parentExpression.expand(padding * 2, padding * 2);
        this.parentExpression.translateElement(padding, padding);
      }
    });
  }
}

export const createFractionOperatorClass = FractionOperatorModule.create;

