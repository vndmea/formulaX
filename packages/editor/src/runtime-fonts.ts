export type RuntimeFontAssetUrls = {
  KF_AMS_BB: string;
  KF_AMS_CAL: string;
  KF_AMS_FRAK: string;
  KF_AMS_MAIN: string;
  KF_AMS_ROMAN: string;
};

export const RUNTIME_FONT_STYLE_ID = 'fx-runtime-font-styles';

const RUNTIME_FONT_FAMILIES = [
  'KF AMS MAIN',
  'KF AMS CAL',
  'KF AMS FRAK',
  'KF AMS BB',
  'KF AMS ROMAN',
] as const;

export function ensureRuntimeFontStyles(
  doc: Document,
  fontAssets: RuntimeFontAssetUrls,
): void {
  if (doc.getElementById(RUNTIME_FONT_STYLE_ID)) {
    return;
  }

  const style = doc.createElement('style');
  style.id = RUNTIME_FONT_STYLE_ID;
  style.textContent = [
    ['KF AMS MAIN', fontAssets.KF_AMS_MAIN],
    ['KF AMS CAL', fontAssets.KF_AMS_CAL],
    ['KF AMS FRAK', fontAssets.KF_AMS_FRAK],
    ['KF AMS BB', fontAssets.KF_AMS_BB],
    ['KF AMS ROMAN', fontAssets.KF_AMS_ROMAN],
  ].map(([family, source]) => (
    `@font-face{font-family:"${family}";font-style:normal;font-weight:400;src:url("${source}") format("woff");}`
  )).join('\n');
  doc.head.appendChild(style);
}

export async function loadRuntimeFonts(doc: Document): Promise<void> {
  const fonts = doc.fonts;
  if (!fonts || typeof fonts.load !== 'function') {
    return;
  }

  await Promise.all(RUNTIME_FONT_FAMILIES.map((family) => (
    fonts.load(`20px "${family}"`).catch(() => undefined)
  )));
}

