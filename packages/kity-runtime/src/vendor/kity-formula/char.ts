declare const CHAR_DATA: Record<
  string,
  Record<
    string,
    {
      size: [number, number];
      offset: { x: number; y: number };
      path: string;
    }
  >
>;

export class CharModule {
  static create(kity: any, SignGroup: any) {
    return kity.createClass("Char", {
      base: SignGroup,
      constructor: function (value: string, type?: string) {
        const resolvedType = type || "std";
        let currentData = CHAR_DATA[resolvedType]?.[value];

        if (!currentData) {
          currentData = CHAR_DATA.std?.[value];
        }

        if (!currentData) {
          throw new Error(`invalid character: ${value}`);
        }

        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase();
        }
        SignGroup.call(this);
        this.value = value;
        this.contentShape = new kity.Group();
        this.box = new kity.Rect(
          currentData.size[0] + currentData.offset.x * 2,
          currentData.size[1]
        ).fill("transparent");
        this.char = new kity.Path(currentData.path).fill("black");
        this.char.translate(currentData.offset.x, currentData.offset.y);
        this.contentShape.addShape(this.box);
        this.contentShape.addShape(this.char);
        this.addShape(this.contentShape);
      },
      getBaseWidth: function () {
        return this.char.getWidth();
      },
      getBaseHeight: function () {
        return this.char.getHeight();
      },
      getBoxWidth: function () {
        return this.box.getWidth();
      }
    });
  }
}

export const createCharClass = CharModule.create;
