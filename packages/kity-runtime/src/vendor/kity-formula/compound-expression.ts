export class CompoundExpressionModule {
  static create(kity: any, GTYPE: any, Expression: any) {
    return kity.createClass("CompoundExpression", {
      base: Expression,
      constructor: function () {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase();
        }
        Expression.call(this);
        this.type = GTYPE.COMPOUND_EXP;
        this.operands = [];
        this.operator = null;
        this.operatorBox = new kity.Group();
        this.operatorBox.setAttr("data-type", "kf-editor-exp-op-box");
        this.operandBox = new kity.Group();
        this.operandBox.setAttr("data-type", "kf-editor-exp-operand-box");
        this.setChildren(0, this.operatorBox);
        this.setChildren(1, this.operandBox);
      },
      setOperator: function (operator: any) {
        if (operator === undefined) {
          return this;
        }
        if (this.operator) {
          this.operator.remove();
        }
        this.operatorBox.addShape(operator);
        this.operator = operator;
        this.operator.setParentExpression(this);
        operator.expression = this;
        return this;
      },
      getOperator: function () {
        return this.operator;
      },
      setOperand: function (operand: any, index: number, isWrap?: boolean) {
        if (isWrap === false) {
          this.operands[index] = operand;
          return this;
        }
        operand = Expression.wrap(operand);
        if (this.operands[index]) {
          this.operands[index].remove();
        }
        this.operands[index] = operand;
        this.operandBox.addShape(operand);
        return this;
      },
      getOperand: function (index: number) {
        return this.operands[index];
      },
      getOperands: function () {
        return this.operands;
      },
      addedCall: function () {
        this.operator.applyOperand.apply(this.operator, this.operands);
        return this;
      }
    });
  }
}

export const createCompoundExpressionClass = CompoundExpressionModule.create;

