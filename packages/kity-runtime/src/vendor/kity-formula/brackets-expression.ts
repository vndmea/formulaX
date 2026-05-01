export class BracketsExpressionModule {
  static create(kity: any, CompoundExpression: any, BracketsOperator: any) {
    return kity.createClass("BracketsExpression", {
      base: CompoundExpression,
      constructor: function (left: any, right: any, exp?: any) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase();
        }
        CompoundExpression.call(this);
        this.setFlag("Brackets");
        if (arguments.length === 2) {
          exp = right;
          right = left;
        }
        this.leftSymbol = left;
        this.rightSymbol = right;
        this.setOperator(new BracketsOperator());
        this.setOperand(exp, 0);
      },
      getLeftSymbol: function () {
        return this.leftSymbol;
      },
      getRightSymbol: function () {
        return this.rightSymbol;
      }
    });
  }
}

export const createBracketsExpressionClass = BracketsExpressionModule.create;
