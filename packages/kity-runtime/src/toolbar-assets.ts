let toolbarAssetFileMap: Record<string, string> = {};

export function setToolbarAssetUrls(assets: { btn: string; other: string }): void {
  toolbarAssetFileMap = {
    'btn.png': assets.btn,
    'other.png': assets.other,
  };
}

export function resolveToolbarAssetPath(fileName: string, preferSvg = false): string {
  const normalizedFileName =
    preferSvg && fileName.toLowerCase().endsWith('.png')
      ? `${fileName.slice(0, -4)}.svg`
      : fileName;

  const mapped = toolbarAssetFileMap[normalizedFileName];
  if (mapped) {
    return mapped;
  }

  throw new Error(`Missing Kity toolbar asset URL for "${normalizedFileName}".`);
}
