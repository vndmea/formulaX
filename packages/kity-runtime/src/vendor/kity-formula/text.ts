export class TextModule {
  static create(
    kity: any,
    fontConfig: any,
    FontManager: any,
    TextFactory: any,
    SignGroup: any
  ) {
    return kity.createClass("Text", {
      base: SignGroup,
      constructor: function (content?: string, fontFamily?: string) {
        if ((this as any).__FORMULAX_PRESERVE_CALL_BASE__) {
          (this as any).callBase();
        }
        SignGroup.call(this);
        this.fontFamily = fontFamily;
        this.fontSize = 50;
        this.content = content || "";
        this.box.remove();
        this.translationContent = this.translation(this.content);
        this.contentShape = new kity.Group();
        this.contentNode = this.createContent();
        this.contentShape.addShape(this.contentNode);
        this.addShape(this.contentShape);
      },
      createContent: function () {
        const contentNode = TextFactory.create(this.translationContent);
        contentNode.setAttr({
          "font-family": this.fontFamily,
          "font-size": 50,
          x: 0,
          y: fontConfig.offset
        });
        return contentNode;
      },
      setFamily: function (fontFamily: string) {
        this.fontFamily = fontFamily;
        this.contentNode.setAttr("font-family", fontFamily);
      },
      setFontSize: function (fontSize: number) {
        this.fontSize = fontSize;
        this.contentNode.setAttr("font-size", `${fontSize}px`);
        this.contentNode.setAttr("y", (fontSize / 50) * fontConfig.offset);
      },
      getBaseHeight: function () {
        const chars = this.contentShape.getItems();
        let currentChar = null;
        let index = 0;
        let height = 0;
        while ((currentChar = chars[index])) {
          height = Math.max(height, currentChar.getHeight());
          index += 1;
        }
        return height;
      },
      translation: function (content: string) {
        const currentFontFamily = this.fontFamily;
        return content.replace(/``/g, "\u201c").replace(/\\([a-zA-Z,]+)\\/g, (_match: string, input: string) => {
          if (input === ",") {
            return " ";
          }
          const data = FontManager.getCharacterValue(input, currentFontFamily);
          if (!data) {
            console.warn(`Missing glyph mapping for "${input}".`);
            return "";
          }
          return data;
        });
      }
    });
  }
}

export const createTextClass = TextModule.create;
