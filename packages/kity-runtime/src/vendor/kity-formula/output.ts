export class OutputModule {
  static create(kity: any, canvg: any) {
    return kity.createClass("Output", {
      constructor: function (formula: any) {
        this.formula = formula;
      },
      toJPG: function (cb: (value: string) => void) {
        toImage(this.formula, "image/jpeg", cb);
      },
      toPNG: function (cb: (value: string) => void) {
        toImage(this.formula, "image/png", cb);
      }
    });

    function toImage(formula: any, type: string, cb: (value: string) => void) {
      const rectSpace = formula.container.getRenderBox();
      return getBase64DataURL(
        formula.node.ownerDocument,
        {
          width: rectSpace.width,
          height: rectSpace.height,
          content: getSVGContent(formula.node)
        },
        type,
        cb
      );
    }

    function getBase64DataURL(doc: Document, data: any, type: string, cb: (value: string) => void) {
      if (!isChromeCore()) {
        drawToCanvas(doc, data, type, cb);
        return;
      }

      const canvas = getImageCanvas(doc, data.width, data.height, type);
      const ctx = canvas.getContext("2d");
      const image = new Image();
      image.onload = function () {
        try {
          ctx?.drawImage(image, 0, 0);
          cb(canvas.toDataURL(type));
        } catch (_error) {
          drawToCanvas(doc, data, type, cb);
        }
      };
      image.src = getSVGDataURL(data.content);
    }

    function getSVGContent(svgNode: SVGElement) {
      const tmp = svgNode.ownerDocument.createElement("div");
      const start = [
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="',
        svgNode.getAttribute("width"),
        '" height="',
        svgNode.getAttribute("height"),
        '">'
      ];
      tmp.appendChild(svgNode.cloneNode(true));
      return tmp.innerHTML.replace(/<svg[^>]+?>/i, start.join("")).replace(/&nbsp;/g, "");
    }

    function getSVGDataURL(data: string) {
      return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(data)))}`;
    }

    function getImageCanvas(doc: Document, width: number, height: number, type: string) {
      const canvas = doc.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;
      if (type !== "image/png") {
        ctx!.fillStyle = "white";
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
      }
      return canvas;
    }

    function drawToCanvas(doc: Document, data: any, type: string, cb: (value: string) => void) {
      const canvas = getImageCanvas(doc, data.width, data.height, type);
      canvas.style.cssText = "position: absolute; top: 0; left: 100000px; z-index: -1;";
      doc.body.appendChild(canvas);
      canvg(canvas, data.content);
      doc.body.removeChild(canvas);
      window.setTimeout(function () {
        cb(canvas.toDataURL(type));
      }, 50);
    }

    function isChromeCore() {
      return window.navigator.userAgent.indexOf("Chrome") !== -1;
    }
  }
}

export const createOutputClass = OutputModule.create;
