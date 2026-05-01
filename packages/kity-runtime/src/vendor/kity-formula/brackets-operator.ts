export class BracketsOperatorModule {
  static create(kity: any, Operator: any, Text: any) {
    return kity.createClass("BracketsOperator", {
      base: Operator,
      constructor: function () {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase("Brackets");
        }
        Operator.call(this, "Brackets");
      },
      applyOperand: function (exp: any) {
        const left = this.getParentExpression().getLeftSymbol();
        const right = this.getParentExpression().getRightSymbol();
        const fontSize = exp.getFixRenderBox().height;
        const group = new kity.Group();
        let offset = 0;
        const leftOp = new Text(left, "KF AMS MAIN").fill("black");
        const rightOp = new Text(right, "KF AMS MAIN").fill("black");
        leftOp.setFontSize(fontSize);
        rightOp.setFontSize(fontSize);
        this.addOperatorShape(group.addShape(leftOp).addShape(rightOp));
        offset += leftOp.getFixRenderBox().width;
        exp.translate(offset, 0);
        offset += exp.getFixRenderBox().width;
        rightOp.translate(offset, 0);
      }
    });
  }
}

export const createBracketsOperatorClass = BracketsOperatorModule.create;

