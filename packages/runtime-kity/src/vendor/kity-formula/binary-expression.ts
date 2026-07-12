export class BinaryExpressionModule {
  static create(kity: any, CompoundExpression: any) {
    return kity.createClass("BinaryExpression", {
      base: CompoundExpression,
      constructor: function (firstOperand: any, lastOperand: any) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase();
        }
        CompoundExpression.call(this);
        this.setFirstOperand(firstOperand);
        this.setLastOperand(lastOperand);
      },
      setFirstOperand: function (operand: any) {
        return this.setOperand(operand, 0);
      },
      getFirstOperand: function () {
        return this.getOperand(0);
      },
      setLastOperand: function (operand: any) {
        return this.setOperand(operand, 1);
      },
      getLastOperand: function () {
        return this.getOperand(1);
      }
    });
  }
}

export const createBinaryExpressionClass = BinaryExpressionModule.create;

