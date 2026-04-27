export const KITY_TOOLBAR_ASSET_BASE = 'kity/assets/images/toolbar/';

export function resolveToolbarAssetPath(fileName: string, preferSvg = true) {
  if (preferSvg && fileName.toLowerCase().endsWith('.png')) {
    return `${KITY_TOOLBAR_ASSET_BASE}${fileName.slice(0, -4)}.svg`;
  }

  return `${KITY_TOOLBAR_ASSET_BASE}${fileName}`;
}
