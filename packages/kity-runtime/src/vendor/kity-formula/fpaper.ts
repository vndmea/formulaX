export class FPaperModule {
  static create(kity: any) {
    return kity.createClass("FPaper", {
      base: kity.Paper,
      constructor: function (container: Element) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase(container);
        }
        kity.Paper.call(this, container);
        this.doc = (container as any).ownerDocument;
        this.container = new kity.Group();
        this.container.setAttr("data-type", "kf-container");
        this.background = new kity.Group();
        this.background.setAttr("data-type", "kf-bg");
        this.baseZoom = 1;
        this.zoom = 1;
        kity.Paper.prototype.addShape.call(this, this.background);
        kity.Paper.prototype.addShape.call(this, this.container);
      },
      getZoom: function () {
        return this.zoom;
      },
      getBaseZoom: function () {
        return this.baseZoom;
      },
      addShape: function (shape: any, pos?: number) {
        return this.container.addShape(shape, pos);
      },
      getBackground: function () {
        return this.background;
      },
      removeShape: function (pos: number) {
        return this.container.removeShape(pos);
      },
      clear: function () {
        return this.container.clear();
      }
    });
  }
}

export const createFPaperClass = FPaperModule.create;
