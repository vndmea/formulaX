export class SuperscriptExpressionModule {
  static create(kity: any, ScriptExpression: any) {
    return kity.createClass("SuperscriptExpression", {
      base: ScriptExpression,
      constructor: function (operand: any, superscript: any) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase(operand, superscript, null);
        }
        ScriptExpression.call(this, operand, superscript, null);
        this.setFlag("Superscript");
      }
    });
  }
}

export const createSuperscriptExpressionClass = SuperscriptExpressionModule.create;

