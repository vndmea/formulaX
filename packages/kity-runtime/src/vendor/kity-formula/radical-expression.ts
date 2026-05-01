export class RadicalExpressionModule {
  static create(kity: any, BinaryExpression: any, RadicalOperator: any) {
    return kity.createClass("RadicalExpression", {
      base: BinaryExpression,
      constructor: function (radicand: any, exponent: any) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase(radicand, exponent);
        }
        BinaryExpression.call(this, radicand, exponent);
        this.setFlag("Radicand");
        this.setOperator(new RadicalOperator());
      },
      setRadicand: function (operand: any) {
        return this.setFirstOperand(operand);
      },
      getRadicand: function () {
        return this.getFirstOperand();
      },
      setExponent: function (operand: any) {
        return this.setLastOperand(operand);
      },
      getExponent: function () {
        return this.getLastOperand();
      }
    });
  }
}

export const createRadicalExpressionClass = RadicalExpressionModule.create;

