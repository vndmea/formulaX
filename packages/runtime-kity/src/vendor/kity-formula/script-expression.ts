export class ScriptExpressionModule {
  static create(kity: any, CompoundExpression: any, ScriptOperator: any) {
    return kity.createClass("ScriptExpression", {
      base: CompoundExpression,
      constructor: function (operand: any, superscript: any, subscript: any) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase();
        }
        CompoundExpression.call(this);
        this.setFlag("Script");
        this.setOperator(new ScriptOperator());
        this.setOpd(operand);
        this.setSuperscript(superscript);
        this.setSubscript(subscript);
      },
      setOpd: function (operand: any) {
        this.setOperand(operand, 0);
      },
      setSuperscript: function (sup: any) {
        this.setOperand(sup, 1);
      },
      setSubscript: function (sub: any) {
        this.setOperand(sub, 2);
      }
    });
  }
}

export const createScriptExpressionClass = ScriptExpressionModule.create;

