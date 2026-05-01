export class EmptyExpressionModule {
  static create(kity: any, FONT_CONF: any, Expression: any) {
    const EmptyExpression = kity.createClass("EmptyExpression", {
      base: Expression,
      constructor: function () {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase();
        }
        Expression.call(this);
        this.setFlag("Empty");
      },
      getRenderBox: function () {
        return {
          width: 0,
          height: FONT_CONF.spaceHeight,
          x: 0,
          y: 0
        };
      }
    });

    EmptyExpression.isEmpty = function (target: unknown) {
      return target instanceof EmptyExpression;
    };

    Expression.registerWrap("empty", function (operand: unknown) {
      if (operand === null || operand === undefined) {
        return new EmptyExpression();
      }
    });

    return EmptyExpression;
  }
}

export const createEmptyExpressionClass = EmptyExpressionModule.create;

