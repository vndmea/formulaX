type FontInfo = {
  meta: {
    fontFamily: string;
    src: string;
  };
  data: Record<string, unknown>;
};

export class FontInstallerModule {
  static create(kity: any, FontManager: any, fontConfig: any, checkerTemplate: string[]) {
    let nodeList: HTMLElement[] = [];

    return kity.createClass("FontInstaller", {
      constructor: function (doc: Document, resource?: string) {
        this.resource = resource || "../src/resource/";
        this.doc = doc;
      },
      mount: function (callback: () => void) {
        const fontList = FontManager.getFontList();
        let count = 0;

        kity.Utils.each(fontList, (fontInfo: FontInfo) => {
          count += 1;
          fontInfo.meta.src = this.resource + fontInfo.meta.src;
          this.createFontStyle(fontInfo);
          preloadFont(this.doc, fontInfo)
            .then(() => {
              applyFonts(this.doc, fontInfo);
            })
            .catch(() => undefined)
            .finally(() => {
              count -= 1;
              if (count === 0) {
                complete(this.doc, callback);
              }
            });
        });
      },
      createFontStyle: function (fontInfo: FontInfo) {
        const stylesheet = this.doc.createElement("style");
        const tpl = '@font-face{\nfont-family: "${fontFamily}";\nsrc: url("${src}");\n}';

        stylesheet.setAttribute("type", "text/css");
        stylesheet.innerHTML = tpl
          .replace("${fontFamily}", fontInfo.meta.fontFamily)
          .replace("${src}", fontInfo.meta.src);
        this.doc.head.appendChild(stylesheet);
      }
    });

    function preloadFont(doc: Document, fontInfo: FontInfo) {
      const view = doc.defaultView ?? window;
      return view.fetch(fontInfo.meta.src, { method: "GET" }).then(() => undefined);
    }

    function complete(doc: Document, callback: () => void) {
      const view = doc.defaultView ?? window;
      view.setTimeout(() => {
        initFontSystemInfo(doc);
        removeTmpNode();
        callback();
      }, 100);
    }

    function applyFonts(doc: Document, fontInfo: FontInfo) {
      const node = doc.createElement("div");
      const strs: string[] = [];

      node.style.cssText = "position: absolute; top: 0; left: -100000px;";
      kity.Utils.each(fontInfo.data, (_value: unknown, key: string) => {
        strs.push(key);
      });
      node.style.fontFamily = fontInfo.meta.fontFamily;
      node.innerHTML = strs.join("");
      doc.body.appendChild(node);
      nodeList.push(node);
    }

    function initFontSystemInfo(doc: Document) {
      const tmpNode = doc.createElement("div");
      tmpNode.style.cssText = "position: absolute; top: 0; left: -100000px;";
      tmpNode.innerHTML = checkerTemplate.join("");
      doc.body.appendChild(tmpNode);
      const rectBox = tmpNode.getElementsByTagName("text")[0].getBBox();
      fontConfig.spaceHeight = rectBox.height;
      fontConfig.topSpace = -rectBox.y - fontConfig.baseline;
      fontConfig.bottomSpace = fontConfig.spaceHeight - fontConfig.topSpace - fontConfig.baseHeight;
      fontConfig.offset = fontConfig.baseline + fontConfig.topSpace;
      fontConfig.baselinePosition = (fontConfig.topSpace + fontConfig.baseline) / fontConfig.spaceHeight;
      fontConfig.meanlinePosition = (fontConfig.topSpace + fontConfig.meanline) / fontConfig.spaceHeight;
      fontConfig.ascenderPosition = fontConfig.topSpace / fontConfig.spaceHeight;
      fontConfig.descenderPosition = (fontConfig.topSpace + fontConfig.baseHeight) / fontConfig.spaceHeight;
      doc.body.removeChild(tmpNode);
    }

    function removeTmpNode() {
      kity.Utils.each(nodeList, (node: HTMLElement) => {
        node.parentNode?.removeChild(node);
      });
      nodeList = [];
    }
  }
}

export const createFontInstallerClass = FontInstallerModule.create;
