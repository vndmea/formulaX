const DEFAULT_OPTIONS = {
  fontsize: 50,
  autoresize: true,
  padding: [0]
};

const EXPRESSION_INTERVAL = 10;

class ExpressionWrap {
  wrap: any;
  bg: any;
  exp: any;
  config: any;

  constructor(kity: any, exp: any, config: any) {
    this.wrap = new kity.Group();
    this.bg = new kity.Rect(0, 0, 0, 0).fill("transparent");
    this.exp = exp;
    this.config = config;
    this.wrap.setAttr("data-type", "kf-exp-wrap");
    this.bg.setAttr("data-type", "kf-exp-wrap-bg");
    this.wrap.addShape(this.bg);
    this.wrap.addShape(this.exp);
  }

  getWrapShape() {
    return this.wrap;
  }

  getExpression() {
    return this.exp;
  }

  getBackground() {
    return this.bg;
  }

  resize() {
    const padding = this.config.padding;
    const expBox = this.exp.getFixRenderBox();
    if (padding.length === 1) {
      padding[1] = padding[0];
    }
    this.bg.setSize(padding[1] * 2 + expBox.width, padding[0] * 2 + expBox.height);
    this.exp.translate(padding[1], padding[0]);
  }
}

export class FormulaModule {
  static create(kity: any, GTYPE: any, FontManager: any, FontInstaller: any, FPaper: any, Output: any) {
    const Formula = kity.createClass("Formula", {
      base: FPaper,
      constructor: function (container: Element, config?: any) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase(container);
        }
        FPaper.call(this, container);
        this.expressions = [];
        this.fontInstaller = new FontInstaller(this);
        this.config = kity.Utils.extend({}, DEFAULT_OPTIONS, config);
        this.initEnvironment();
        this.initInnerFont();
      },
      getContentContainer: function () {
        return this.container;
      },
      initEnvironment: function () {
        this.zoom = this.config.fontsize / 50;
        if ("width" in this.config) {
          this.setWidth(this.config.width);
        }
        if ("height" in this.config) {
          this.setHeight(this.config.height);
        }
        this.node.setAttribute("font-size", DEFAULT_OPTIONS.fontsize);
      },
      initInnerFont: function () {
        const fontList = FontManager.getFontList();
        kity.Utils.each(fontList, (fontInfo: any) => {
          const stylesheet = this.doc.createElement("style");
          const tpl = '@font-face{font-family: "${fontFamily}";font-style: normal;src: url("${src}") format("woff");}';
          stylesheet.setAttribute("type", "text/css");
          stylesheet.innerHTML = tpl
            .replace("${fontFamily}", fontInfo.meta.fontFamily)
            .replace("${src}", fontInfo.meta.src);
          this.resourceNode.appendChild(stylesheet);
        });
      },
      insertExpression: function (expression: any, index: number) {
        const expWrap = this.wrap(expression);
        this.container.clearTransform();
        this.expressions.splice(index, 0, expWrap.getWrapShape());
        this.addShape(expWrap.getWrapShape());
        notifyExpression(kity, GTYPE, expWrap.getExpression());
        expWrap.resize();
        correctOffset(kity, this);
        this.resetZoom();
        this.config.autoresize && this.resize();
      },
      appendExpression: function (expression: any) {
        this.insertExpression(expression, this.expressions.length);
      },
      resize: function () {
        const renderBox = this.container.getFixRenderBox();
        this.node.setAttribute("width", renderBox.width);
        this.node.setAttribute("height", renderBox.height);
      },
      resetZoom: function () {
        const zoomLevel = this.zoom / this.getBaseZoom();
        if (zoomLevel !== 0) {
          this.container.scale(zoomLevel);
        }
      },
      wrap: function (exp: any) {
        return new ExpressionWrap(kity, exp, this.config);
      },
      clear: function () {
        FPaper.prototype.clear.call(this);
        this.expressions = [];
      },
      clearExpressions: function () {
        kity.Utils.each(this.expressions, (exp: any) => {
          exp.remove();
        });
        this.expressions = [];
      },
      toJPG: function (cb: (arg: unknown) => void) {
        new Output(this).toJPG(cb);
      },
      toPNG: function (cb: (arg: unknown) => void) {
        new Output(this).toPNG(cb);
      }
    });

    kity.Utils.extend(Formula, {
      registerFont: function (fontData: any) {
        FontManager.registerFont(fontData);
      }
    });

    return Formula;
  }
}

function correctOffset(kity: any, formula: any) {
  let exprOffset = 0;
  kity.Utils.each(formula.expressions, (expr: any) => {
    if (!expr) {
      return;
    }
    expr.setMatrix(new kity.Matrix(1, 0, 0, 1, 0, 0));
    const box = expr.getFixRenderBox();
    expr.translate(0 - box.x, exprOffset);
    exprOffset += box.height + EXPRESSION_INTERVAL;
  });
  return formula;
}

function notifyExpression(kity: any, GTYPE: any, expression: any) {
  if (!expression) {
    return;
  }
  if (expression.getType() === GTYPE.EXP) {
    for (let i = 0, len = expression.getChildren().length; i < len; i += 1) {
      notifyExpression(kity, GTYPE, expression.getChild(i));
    }
  } else if (expression.getType() === GTYPE.COMPOUND_EXP) {
    for (let i = 0, len = expression.getOperands().length; i < len; i += 1) {
      notifyExpression(kity, GTYPE, expression.getOperand(i));
    }
    notifyExpression(kity, GTYPE, expression.getOperator());
  }
  expression.addedCall && expression.addedCall();
}

export const createFormulaClass = FormulaModule.create;
