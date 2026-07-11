export type RuntimeFontAssets = Record<string, never>;
export type RuntimeToolbarAssets = Record<string, never>;
export type RuntimeStyleAssets = Record<string, never>;

export type RuntimeAssetManifest = {
  fonts: RuntimeFontAssets;
  toolbar: RuntimeToolbarAssets;
  styles: RuntimeStyleAssets;
  defaultFontFamily: string;
  requiresBundledAssets: false;
};

export const DEFAULT_RUNTIME_FONT_FAMILY = '"KF AMS MAIN", "Cambria Math", "Times New Roman", serif';

export const runtimeAssetManifest = {
  fonts: {},
  toolbar: {},
  styles: {},
  defaultFontFamily: DEFAULT_RUNTIME_FONT_FAMILY,
  requiresBundledAssets: false,
} satisfies RuntimeAssetManifest;
