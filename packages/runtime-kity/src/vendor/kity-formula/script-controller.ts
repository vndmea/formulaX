export class ScriptControllerModule {
  static create(kity: any, EmptyExpression: any) {
    const defaultOptions = {
      subOffset: 0,
      supOffset: 0,
      zoom: 0.66
    };

    return kity.createClass("ScriptController", {
      constructor: function (opObj: any, target: any, sup: any, sub: any, options?: Record<string, unknown>) {
        this.observer = opObj.getParentExpression();
        this.target = target;
        this.sup = sup;
        this.sub = sub;
        this.options = kity.Utils.extend({}, defaultOptions, options);
      },
      applyUpDown: function () {
        const target = this.target;
        const sup = this.sup;
        const sub = this.sub;
        const options = this.options;
        sup.scale(options.zoom);
        sub.scale(options.zoom);
        const targetBox = target.getFixRenderBox();
        if (EmptyExpression.isEmpty(sup) && EmptyExpression.isEmpty(sub)) {
          return { width: targetBox.width, height: targetBox.height, top: 0, bottom: 0 };
        }
        if (!EmptyExpression.isEmpty(sup) && EmptyExpression.isEmpty(sub)) {
          return this.applyUp(target, sup);
        }
        if (EmptyExpression.isEmpty(sup) && !EmptyExpression.isEmpty(sub)) {
          return this.applyDown(target, sub);
        }
        return this.applyUpDownScript(target, sup, sub);
      },
      applySide: function () {
        const target = this.target;
        const sup = this.sup;
        const sub = this.sub;
        if (EmptyExpression.isEmpty(sup) && EmptyExpression.isEmpty(sub)) {
          const targetRectBox = target.getRenderBox(this.observer);
          return { width: targetRectBox.width, height: targetRectBox.height, top: 0, bottom: 0 };
        }
        if (EmptyExpression.isEmpty(sup) && !EmptyExpression.isEmpty(sub)) {
          return this.applySideSub(target, sub);
        }
        if (!EmptyExpression.isEmpty(sup) && EmptyExpression.isEmpty(sub)) {
          return this.applySideSuper(target, sup);
        }
        return this.applySideScript(target, sup, sub);
      },
      applySideSuper: function (target: any, sup: any) {
        sup.scale(this.options.zoom);
        const targetRectBox = target.getRenderBox(this.observer);
        const supRectBox = sup.getRenderBox(this.observer);
        const targetMeanline = target.getMeanline(this.observer);
        const supBaseline = sup.getBaseline(this.observer);
        const positionline = targetMeanline;
        const diff = supBaseline - positionline;
        const space = {
          top: 0,
          bottom: 0,
          width: targetRectBox.width + supRectBox.width,
          height: targetRectBox.height
        };
        sup.translate(targetRectBox.width, 0);
        if (this.options.supOffset) {
          sup.translate(this.options.supOffset, 0);
        }
        if (diff > 0) {
          target.translate(0, diff);
          space.bottom = diff;
          space.height += diff;
        } else {
          sup.translate(0, -diff);
        }
        return space;
      },
      applySideSub: function (target: any, sub: any) {
        sub.scale(this.options.zoom);
        const targetRectBox = target.getRenderBox(this.observer);
        const subRectBox = sub.getRenderBox(this.observer);
        const subOffset = sub.getOffset();
        const targetBaseline = target.getBaseline(this.observer);
        const subPosition = (subRectBox.height + subOffset.top + subOffset.bottom) / 2;
        const diff = targetRectBox.height - targetBaseline - subPosition;
        const space = {
          top: 0,
          bottom: 0,
          width: targetRectBox.width + subRectBox.width,
          height: targetRectBox.height
        };
        sub.translate(targetRectBox.width, subOffset.top + targetBaseline - subPosition);
        if (this.options.subOffset) {
          sub.translate(this.options.subOffset, 0);
        }
        if (diff < 0) {
          space.top = -diff;
          space.height -= diff;
        }
        return space;
      },
      applySideScript: function (target: any, sup: any, sub: any) {
        sup.scale(this.options.zoom);
        sub.scale(this.options.zoom);
        const targetRectBox = target.getRenderBox(this.observer);
        const subRectBox = sub.getRenderBox(this.observer);
        const supRectBox = sup.getRenderBox(this.observer);
        const targetMeanline = target.getMeanline(this.observer);
        const targetBaseline = target.getBaseline(this.observer);
        const supBaseline = sup.getBaseline(this.observer);
        const subAscenderline = sub.getAscenderline(this.observer);
        const supPosition = targetMeanline;
        const subPosition = targetMeanline + (targetBaseline - targetMeanline) * 2 / 3;
        let topDiff = supPosition - supBaseline;
        let bottomDiff = targetRectBox.height - subPosition - (subRectBox.height - subAscenderline);
        const space = {
          top: 0,
          bottom: 0,
          width: targetRectBox.width + Math.max(subRectBox.width, supRectBox.width),
          height: targetRectBox.height
        };
        sup.translate(targetRectBox.width, topDiff);
        sub.translate(targetRectBox.width, subPosition - subAscenderline);
        if (this.options.supOffset) {
          sup.translate(this.options.supOffset, 0);
        }
        if (this.options.subOffset) {
          sub.translate(this.options.subOffset, 0);
        }
        if (topDiff > 0) {
          if (bottomDiff < 0) {
            targetRectBox.height -= bottomDiff;
            space.top = -bottomDiff;
          }
        } else {
          target.translate(0, -topDiff);
          sup.translate(0, -topDiff);
          sub.translate(0, -topDiff);
          space.height -= topDiff;
          if (bottomDiff > 0) {
            space.bottom = -topDiff;
          } else {
            space.height -= bottomDiff;
            topDiff = -topDiff;
            bottomDiff = -bottomDiff;
            if (topDiff > bottomDiff) {
              space.bottom = topDiff - bottomDiff;
            } else {
              space.top = bottomDiff - topDiff;
            }
          }
        }
        return space;
      },
      applyUp: function (target: any, sup: any) {
        const supBox = sup.getFixRenderBox();
        const targetBox = target.getFixRenderBox();
        const space = {
          width: Math.max(targetBox.width, supBox.width),
          height: supBox.height + targetBox.height,
          top: 0,
          bottom: supBox.height
        };
        sup.translate((space.width - supBox.width) / 2, 0);
        target.translate((space.width - targetBox.width) / 2, supBox.height);
        return space;
      },
      applyDown: function (target: any, sub: any) {
        const subBox = sub.getFixRenderBox();
        const targetBox = target.getFixRenderBox();
        const space = {
          width: Math.max(targetBox.width, subBox.width),
          height: subBox.height + targetBox.height,
          top: subBox.height,
          bottom: 0
        };
        sub.translate((space.width - subBox.width) / 2, targetBox.height);
        target.translate((space.width - targetBox.width) / 2, 0);
        return space;
      },
      applyUpDownScript: function (target: any, sup: any, sub: any) {
        sup.scale(this.options.zoom);
        sub.scale(this.options.zoom);
        const supBox = sup.getFixRenderBox();
        const subBox = sub.getFixRenderBox();
        const targetBox = target.getFixRenderBox();
        const space = {
          width: Math.max(targetBox.width, supBox.width, subBox.width),
          height: supBox.height + targetBox.height + subBox.height,
          top: supBox.height,
          bottom: subBox.height
        };
        sup.translate((space.width - supBox.width) / 2, 0);
        target.translate((space.width - targetBox.width) / 2, supBox.height);
        sub.translate((space.width - subBox.width) / 2, supBox.height + targetBox.height);
        return space;
      }
    });
  }
}

export const createScriptControllerClass = ScriptControllerModule.create;

