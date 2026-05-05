export interface KityFontAssets {
  KF_AMS_BB: string;
  KF_AMS_CAL: string;
  KF_AMS_FRAK: string;
  KF_AMS_MAIN: string;
  KF_AMS_ROMAN: string;
}

export interface KityToolbarAssets {
  btn: string;
  other: string;
}

export interface KityStyleAssets {
  editor: string;
}

export interface KityAssetManifest {
  fonts: KityFontAssets;
  toolbar: KityToolbarAssets;
  styles: KityStyleAssets;
}

export const kityFontAssets: KityFontAssets;
export const kityToolbarAssets: KityToolbarAssets;
export const kityStyleAssets: KityStyleAssets;
export const kityAssetManifest: KityAssetManifest;
