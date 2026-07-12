export class FunctionOperatorModule {
  static create(kity: any, Operator: any, Text: any, ScriptController: any) {
    return kity.createClass("FunctionOperator", {
      base: Operator,
      constructor: function (funcName: string) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase(`Function: ${funcName}`);
        }
        Operator.call(this, `Function: ${funcName}`);
        this.funcName = funcName;
      },
      applyOperand: function (expr: any, sup: any, sub: any) {
        const opShape = new Text(this.funcName, "KF AMS ROMAN");
        this.addOperatorShape(opShape);
        const expBox = expr.getFixRenderBox();
        const scriptHandler = this.parentExpression.isSideScript() ? "applySide" : "applyUpDown";
        const space = new ScriptController(this, opShape, sup, sub, { zoom: 0.5 })[scriptHandler]();
        const padding = 5;
        let diff = (space.height + space.top + space.bottom - expBox.height) / 2;
        opShape.translate(0, space.top);
        sup.translate(0, space.top);
        sub.translate(0, space.top);
        if (diff >= 0) {
          expr.translate(space.width + padding, diff);
        } else {
          diff = -diff;
          opShape.translate(0, diff);
          sup.translate(0, diff);
          sub.translate(0, diff);
          expr.translate(space.width + padding, 0);
        }
        this.parentExpression.expand(padding, padding * 2);
        this.parentExpression.translateElement(padding, padding);
      }
    });
  }
}

export const createFunctionOperatorClass = FunctionOperatorModule.create;

