export class TextExpressionModule {
  static create(kity: any, FONT_CONF: any, Expression: any, Text: any) {
    const TextExpression = kity.createClass("TextExpression", {
      base: Expression,
      constructor: function (content: unknown, fontFamily?: string) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase();
        }
        Expression.call(this);
        this.fontFamily = fontFamily || FONT_CONF.defaultFont;
        this.setFlag("Text");
        this.content = `${content ?? ''}`;
        this.textContent = new Text(this.content, this.fontFamily);
        this.setChildren(0, this.textContent);
        this.setChildren(1, new kity.Rect(0, 0, 0, 0).fill("transparent"));
      },
      setFamily: function (fontFamily: string) {
        this.textContent.setFamily(fontFamily);
      },
      setFontSize: function (fontSize: number) {
        this.textContent.setFontSize(fontSize);
      },
      addedCall: function () {
        const box = this.textContent.getFixRenderBox();
        this.getChild(1).setSize(box.width, box.height);
        this.updateBoxSize();
        return this;
      }
    });

    Expression.registerWrap("text", function (operand: unknown) {
      const operandType = typeof operand;
      if (operandType === "number" || operandType === "string") {
        return new TextExpression(operand);
      }
      return operand;
    });

    return TextExpression;
  }
}

export const createTextExpressionClass = TextExpressionModule.create;

