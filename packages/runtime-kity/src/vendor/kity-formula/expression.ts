export class ExpressionModule {
  static create(kity: any, GTYPE: any, FONT_CONF: any, SignGroup: any) {
    const WRAP_FN: Array<((operand: unknown) => unknown) | null> = [];
    const WRAP_FN_INDEX: Record<string, number> = {};

    const Expression = kity.createClass("Expression", {
      base: SignGroup,
      constructor: function () {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase();
        }
        SignGroup.call(this);
        this.type = GTYPE.EXP;
        this._offset = { top: 0, bottom: 0 };
        this.children = [];
        this.box.fill("transparent").setAttr("data-type", "kf-editor-exp-box");
        this.box.setAttr("data-type", "kf-editor-exp-bg-box");
        this.expContent = new kity.Group();
        this.expContent.setAttr("data-type", "kf-editor-exp-content-box");
        this.addShape(this.expContent);
      },
      getChildren: function () {
        return this.children;
      },
      getChild: function (index: number) {
        return this.children[index] || null;
      },
      getTopOffset: function () {
        return this._offset.top;
      },
      getBottomOffset: function () {
        return this._offset.bottom;
      },
      getOffset: function () {
        return this._offset;
      },
      setTopOffset: function (val: number) {
        this._offset.top = val;
      },
      setBottomOffset: function (val: number) {
        this._offset.bottom = val;
      },
      setOffset: function (top: number, bottom: number) {
        this._offset.top = top;
        this._offset.bottom = bottom;
      },
      setFlag: function (flag: string) {
        this.setAttr("data-flag", flag || "Expression");
      },
      setChildren: function (index: number, exp: any) {
        if (this.children[index]) {
          this.children[index].remove();
        }
        this.children[index] = exp;
        this.expContent.addShape(exp);
      },
      getBaselineProportion: function () {
        return FONT_CONF.baselinePosition;
      },
      getMeanlineProportion: function () {
        return FONT_CONF.meanlinePosition;
      },
      getBaseline: function (refer: any) {
        return this.getRenderBox(refer).height * FONT_CONF.baselinePosition - 3;
      },
      getMeanline: function (refer: any) {
        return this.getRenderBox(refer).height * FONT_CONF.meanlinePosition - 1;
      },
      getAscenderline: function () {
        return this.getFixRenderBox().height * FONT_CONF.ascenderPosition;
      },
      getDescenderline: function () {
        return this.getFixRenderBox().height * FONT_CONF.descenderPosition;
      },
      translateElement: function (x: number, y: number) {
        this.expContent.translate(x, y);
      },
      expand: function (width: number, height: number) {
        const renderBox = this.getFixRenderBox();
        this.setBoxSize(renderBox.width + width, renderBox.height + height);
      },
      getBaseWidth: function () {
        return this.getWidth();
      },
      getBaseHeight: function () {
        return this.getHeight();
      },
      updateBoxSize: function () {
        const renderBox = this.expContent.getFixRenderBox();
        this.setBoxSize(renderBox.width, renderBox.height);
      },
      getBox: function () {
        return this.box;
      }
    });

    kity.Utils.extend(Expression, {
      registerWrap(name: string, fn: (operand: unknown) => unknown) {
        WRAP_FN_INDEX[name] = WRAP_FN.length;
        WRAP_FN.push(fn);
      },
      revokeWrap(name: string) {
        let fn: ((operand: unknown) => unknown) | null = null;
        if (name in WRAP_FN_INDEX) {
          fn = WRAP_FN[WRAP_FN_INDEX[name]];
          WRAP_FN[WRAP_FN_INDEX[name]] = null;
          delete WRAP_FN_INDEX[name];
        }
        return fn;
      },
      wrap(operand: unknown) {
        let result: unknown;
        kity.Utils.each(WRAP_FN, function (fn: any) {
          if (!fn) {
            return;
          }
          result = fn(operand);
          if (result) {
            return false;
          }
        });
        return result;
      }
    });

    return Expression;
  }
}

export const createExpressionClass = ExpressionModule.create;

