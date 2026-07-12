export class CombinationOperatorModule {
  static create(kity: any, Operator: any) {
    return kity.createClass("CombinationOperator", {
      base: Operator,
      constructor: function () {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase("Combination");
        }
        Operator.call(this, "Combination");
      },
      applyOperand: function () {
        let offsetX = 0;
        let maxHeight = 0;
        let maxOffsetTop = 0;
        let maxOffsetBottom = 0;
        const operands = arguments;
        const cached: any[] = [];
        const offsets: any[] = [];
        kity.Utils.each(operands, function (operand: any) {
          const box = operand.getFixRenderBox();
          const offsetY = operand.getOffset();
          box.height -= offsetY.top + offsetY.bottom;
          cached.push(box);
          offsets.push(offsetY);
          maxOffsetTop = Math.max(offsetY.top, maxOffsetTop);
          maxOffsetBottom = Math.max(offsetY.bottom, maxOffsetBottom);
          maxHeight = Math.max(box.height, maxHeight);
        });
        kity.Utils.each(operands, function (operand: any, index: number) {
          const box = cached[index];
          operand.translate(
            offsetX - box.x,
            (maxHeight - (box.y + box.height)) / 2 + maxOffsetBottom - offsets[index].bottom
          );
          offsetX += box.width;
        });
        this.parentExpression.setOffset(maxOffsetTop, maxOffsetBottom);
        this.parentExpression.updateBoxSize();
      }
    });
  }
}

export const createCombinationOperatorClass = CombinationOperatorModule.create;

