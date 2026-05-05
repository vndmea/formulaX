export const KITY_TOOLBAR_ASSET_BASE = 'assets/images/toolbar/';

let toolbarAssetBase = 'assets/images/toolbar/';

function normalizeAssetBase(value: string): string {
  if (!value) return '';
  return value.endsWith('/') ? value : `${value}/`;
}

export function setToolbarAssetBase(assetBase?: string): void {
  const normalized = normalizeAssetBase(assetBase ?? '');
  toolbarAssetBase = `${normalized}assets/images/toolbar/`;
}

export function getToolbarAssetBase(): string {
  return toolbarAssetBase;
}

export function resolveToolbarAssetPath(fileName: string, preferSvg = false): string {
  const normalizedFileName =
    preferSvg && fileName.toLowerCase().endsWith('.png')
      ? `${fileName.slice(0, -4)}.svg`
      : fileName;

  return `${toolbarAssetBase}${normalizedFileName}`;
}
