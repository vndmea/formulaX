export class SubscriptExpressionModule {
  static create(kity: any, ScriptExpression: any) {
    return kity.createClass("SubscriptExpression", {
      base: ScriptExpression,
      constructor: function (operand: any, subscript: any) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase(operand, null, subscript);
        }
        ScriptExpression.call(this, operand, null, subscript);
        this.setFlag("Subscript");
      }
    });
  }
}

export const createSubscriptExpressionClass = SubscriptExpressionModule.create;

