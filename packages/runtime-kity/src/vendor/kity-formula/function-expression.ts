export class FunctionExpressionModule {
  static create(
    kity: any,
    FUNC_CONF: any,
    CompoundExpression: any,
    FunctionOperator: any
  ) {
    return kity.createClass("FunctionExpression", {
      base: CompoundExpression,
      constructor: function (funcName: string, expr: any, sup: any, sub: any) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase();
        }
        CompoundExpression.call(this);
        this.setFlag("Func");
        this.funcName = funcName;
        this.setOperator(new FunctionOperator(funcName));
        this.setExpr(expr);
        this.setSuperscript(sup);
        this.setSubscript(sub);
      },
      isSideScript: function () {
        return !FUNC_CONF["ud-script"][this.funcName];
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

export const createFunctionExpressionClass = FunctionExpressionModule.create;

