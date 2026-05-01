export function createFontManager(kity: any, fontListConfig: any[]) {
  const fontList: Record<string, any> = {};

  kity.Utils.each(fontListConfig, (fontData: any) => {
    fontList[fontData.meta.fontFamily] = fontData;
  });

  return {
    getFontList() {
      return fontList;
    },
    getCharacterValue(key: string, fontFamily: string) {
      if (!fontList[fontFamily]) {
        return null;
      }
      return fontList[fontFamily].map[key] || null;
    }
  };
}
