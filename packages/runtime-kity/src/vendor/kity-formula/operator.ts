export class OperatorModule {
  static create(kity: any, GTYPE: any, SignGroup: any) {
    return kity.createClass("Operator", {
      base: SignGroup,
      constructor: function (operatorName: string) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase();
        }
        SignGroup.call(this);
        this.type = GTYPE.OP;
        this.parentExpression = null;
        this.operatorName = operatorName;
        this.operatorShape = new kity.Group();
        this.addShape(this.operatorShape);
      },
      applyOperand: function () {
        throw new Error("applyOperand is abstract");
      },
      setParentExpression: function (exp: any) {
        this.parentExpression = exp;
      },
      getParentExpression: function () {
        return this.parentExpression;
      },
      clearParentExpression: function () {
        this.parentExpression = null;
      },
      addOperatorShape: function (shape: any) {
        return this.operatorShape.addShape(shape);
      },
      getOperatorShape: function () {
        return this.operatorShape;
      }
    });
  }
}

export const createOperatorClass = OperatorModule.create;

