export class FractionExpressionModule {
  static create(kity: any, BinaryExpression: any, FractionOperator: any) {
    return kity.createClass("FractionExpression", {
      base: BinaryExpression,
      constructor: function (upOperand: any, downOperand: any) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase(upOperand, downOperand);
        }
        BinaryExpression.call(this, upOperand, downOperand);
        this.setFlag("Fraction");
        this.setOperator(new FractionOperator());
      },
      getBaseline: function (refer: any) {
        const downOperand = this.getOperand(1);
        const rectBox = downOperand.getRenderBox(refer);
        return rectBox.y + downOperand.getBaselineProportion() * rectBox.height;
      },
      getMeanline: function (refer: any) {
        const upOperand = this.getOperand(0);
        const rectBox = upOperand.getRenderBox(refer);
        return upOperand.getMeanlineProportion() * rectBox.height;
      }
    });
  }
}

export const createFractionExpressionClass = FractionExpressionModule.create;

