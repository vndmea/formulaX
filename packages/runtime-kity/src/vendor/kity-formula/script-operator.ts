export class ScriptOperatorModule {
  static create(kity: any, Operator: any, ScriptController: any) {
    return kity.createClass("ScriptOperator", {
      base: Operator,
      constructor: function (operatorName?: string) {
        const resolvedName = operatorName || "Script";
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase(resolvedName);
        }
        Operator.call(this, resolvedName);
      },
      applyOperand: function (operand: any, sup: any, sub: any) {
        const padding = 1;
        const parent = this.parentExpression;
        const space = new ScriptController(this, operand, sup, sub).applySide();
        space && parent.setOffset(space.top, space.bottom);
        parent.expand(4, padding * 2);
        parent.translateElement(2, padding);
      }
    });
  }
}

export const createScriptOperatorClass = ScriptOperatorModule.create;

