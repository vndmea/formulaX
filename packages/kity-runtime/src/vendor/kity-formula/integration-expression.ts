export class IntegrationExpressionModule {
  static create(kity: any, CompoundExpression: any, IntegrationOperator: any) {
    const IntegrationExpression = kity.createClass("IntegrationExpression", {
      base: CompoundExpression,
      constructor: function (integrand: any, superscript: any, subscript: any) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase();
        }
        CompoundExpression.call(this);
        this.setFlag("Integration");
        this.setOperator(new IntegrationOperator());
        this.setIntegrand(integrand);
        this.setSuperscript(superscript);
        this.setSubscript(subscript);
      },
      setType: function (type: number) {
        this.getOperator().setType(type);
        return this;
      },
      resetType: function () {
        this.getOperator().resetType();
        return this;
      },
      setIntegrand: function (integrand: any) {
        this.setOperand(integrand, 0);
      },
      setSuperscript: function (sup: any) {
        this.setOperand(sup, 1);
      },
      setSubscript: function (sub: any) {
        this.setOperand(sub, 2);
      }
    });

    return IntegrationExpression;
  }
}

export const createIntegrationExpressionClass = IntegrationExpressionModule.create;

