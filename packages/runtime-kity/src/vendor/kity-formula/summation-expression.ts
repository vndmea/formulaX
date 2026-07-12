export class SummationExpressionModule {
  static create(kity: any, CompoundExpression: any, SummationOperator: any) {
    return kity.createClass("SummationExpression", {
      base: CompoundExpression,
      constructor: function (expr: any, superscript: any, subscript: any) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase();
        }
        CompoundExpression.call(this);
        this.setFlag("Summation");
        this.setOperator(new SummationOperator());
        this.setExpr(expr);
        this.setSuperscript(superscript);
        this.setSubscript(subscript);
      },
      setExpr: function (expr: any) {
        return this.setOperand(expr, 0);
      },
      setSuperscript: function (sup: any) {
        return this.setOperand(sup, 1);
      },
      setSubscript: function (sub: any) {
        return this.setOperand(sub, 2);
      }
    });
  }
}

export const createSummationExpressionClass = SummationExpressionModule.create;

