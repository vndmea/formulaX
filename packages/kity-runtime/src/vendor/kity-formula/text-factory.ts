export class TextFactoryModule {
  static create(kity: any) {
    const divNode = document.createElement("div");
    const namespace = "http://www.w3.org/XML/1998/namespace";

    function createText(content: string) {
      const text = new kity.Text();
      let resolvedContent = content;

      if ("innerHTML" in text.node) {
        text.node.setAttributeNS(namespace, "xml:space", "preserve");
      } else if (resolvedContent.indexOf(" ") !== -1) {
        resolvedContent = convertContent(resolvedContent);
      }

      text.setContent(resolvedContent);
      return text;
    }

    function convertContent(content: string) {
      divNode.innerHTML = `<svg><text gg="asfdas">${content.replace(/\s/gi, "&nbsp;")}</text></svg>`;
      return divNode.firstChild?.firstChild?.textContent ?? content;
    }

    return {
      create(content: string) {
        return createText(content);
      }
    };
  }
}

export const createTextFactory = TextFactoryModule.create;
