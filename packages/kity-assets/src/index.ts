import btnUrl from '../public/assets/images/toolbar/btn.png';
import otherUrl from '../public/assets/images/toolbar/other.png';
import editorCssUrl from '../public/assets/styles/editor.css?url';
import kfAmsBbUrl from '../public/resource/KF_AMS_BB.woff';
import kfAmsCalUrl from '../public/resource/KF_AMS_CAL.woff';
import kfAmsFrakUrl from '../public/resource/KF_AMS_FRAK.woff';
import kfAmsMainUrl from '../public/resource/KF_AMS_MAIN.woff';
import kfAmsRomanUrl from '../public/resource/KF_AMS_ROMAN.woff';

export type KityFontAssets = {
  KF_AMS_BB: string;
  KF_AMS_CAL: string;
  KF_AMS_FRAK: string;
  KF_AMS_MAIN: string;
  KF_AMS_ROMAN: string;
};

export type KityToolbarAssets = {
  btn: string;
  other: string;
};

export type KityStyleAssets = {
  editor: string;
};

export type KityAssetManifest = {
  fonts: KityFontAssets;
  toolbar: KityToolbarAssets;
  styles: KityStyleAssets;
};

export const kityFontAssets = {
  KF_AMS_BB: kfAmsBbUrl,
  KF_AMS_CAL: kfAmsCalUrl,
  KF_AMS_FRAK: kfAmsFrakUrl,
  KF_AMS_MAIN: kfAmsMainUrl,
  KF_AMS_ROMAN: kfAmsRomanUrl,
} satisfies KityFontAssets;

export const kityToolbarAssets = {
  btn: btnUrl,
  other: otherUrl,
} satisfies KityToolbarAssets;

export const kityStyleAssets = {
  editor: editorCssUrl,
} satisfies KityStyleAssets;

export const kityAssetManifest = {
  fonts: kityFontAssets,
  toolbar: kityToolbarAssets,
  styles: kityStyleAssets,
} satisfies KityAssetManifest;
