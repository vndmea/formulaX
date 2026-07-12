export class CombinationExpressionModule {
  static create(
    kity: any,
    FONT_CONF: any,
    CompoundExpression: any,
    CombinationOperator: any
  ) {
    return kity.createClass("CombinationExpression", {
      base: CompoundExpression,
      constructor: function (...operands: any[]) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase();
        }
        CompoundExpression.call(this);
        this.setFlag("Combination");
        this.setOperator(new CombinationOperator());
        kity.Utils.each(operands, (operand: any, index: number) => {
          this.setOperand(operand, index);
        }, this);
      },
      getRenderBox: function (refer: any) {
        const rectBox = CompoundExpression.prototype.getRenderBox.call(this, refer);
        if (this.getOperands().length === 0) {
          rectBox.height = FONT_CONF.spaceHeight;
        }
        return rectBox;
      },
      getBaseline: function (refer: any) {
        let maxBaseline = 0;
        const operands = this.getOperands();
        if (operands.length === 0) {
          return CompoundExpression.prototype.getBaseline.call(this, refer);
        }
        kity.Utils.each(operands, function (operand: any) {
          maxBaseline = Math.max(operand.getBaseline(refer), maxBaseline);
        });
        return maxBaseline;
      },
      getMeanline: function (refer: any) {
        let minMeanline = 1e7;
        const operands = this.getOperands();
        if (operands.length === 0) {
          return CompoundExpression.prototype.getMeanline.call(this, refer);
        }
        kity.Utils.each(operands, function (operand: any) {
          minMeanline = Math.min(operand.getMeanline(refer), minMeanline);
        });
        return minMeanline;
      }
    });
  }
}

export const createCombinationExpressionClass = CombinationExpressionModule.create;
