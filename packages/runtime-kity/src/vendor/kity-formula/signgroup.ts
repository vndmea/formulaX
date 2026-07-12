export class SignGroupModule {
  static create(kity: any, GTYPE: any) {
    return kity.createClass("SignGroup", {
      base: kity.Group,
      constructor: function () {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase();
        }
        kity.Group.call(this);
        this.box = new kity.Rect(0, 0, 0, 0);
        this.type = GTYPE.UNKNOWN;
        this.addShape(this.box);
        this.zoom = 1;
      },
      setZoom: function (zoom: number) {
        this.zoom = zoom;
      },
      getZoom: function () {
        return this.zoom;
      },
      setBoxSize: function (w: number, h: number) {
        return this.box.setSize(w, h);
      },
      setBoxWidth: function (w: number) {
        return this.box.setWidth(w);
      },
      setBoxHeight: function (h: number) {
        return this.box.setHeight(h);
      },
      getType: function () {
        return this.type;
      },
      getBaseHeight: function () {
        return this.getHeight();
      },
      getBaseWidth: function () {
        return this.getWidth();
      },
      addedCall: function () {}
    });
  }
}

export const createSignGroupClass = SignGroupModule.create;
