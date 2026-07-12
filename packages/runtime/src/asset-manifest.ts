import kfAmsBbUrl from '../public/resource/KF_AMS_BB.woff';
import kfAmsCalUrl from '../public/resource/KF_AMS_CAL.woff';
import kfAmsFrakUrl from '../public/resource/KF_AMS_FRAK.woff';
import kfAmsMainUrl from '../public/resource/KF_AMS_MAIN.woff';
import kfAmsRomanUrl from '../public/resource/KF_AMS_ROMAN.woff';

export type RuntimeFontAssets = {
  KF_AMS_BB: string;
  KF_AMS_CAL: string;
  KF_AMS_FRAK: string;
  KF_AMS_MAIN: string;
  KF_AMS_ROMAN: string;
};
export type RuntimeToolbarAssets = Record<string, never>;
export type RuntimeStyleAssets = Record<string, never>;

export type RuntimeAssetManifest = {
  fonts: RuntimeFontAssets;
  toolbar: RuntimeToolbarAssets;
  styles: RuntimeStyleAssets;
  defaultFontFamily: string;
  requiresBundledAssets: true;
};

export const DEFAULT_RUNTIME_FONT_FAMILY = '"KF AMS MAIN", "Cambria Math", "Times New Roman", serif';

export const runtimeFontAssets = {
  KF_AMS_BB: kfAmsBbUrl,
  KF_AMS_CAL: kfAmsCalUrl,
  KF_AMS_FRAK: kfAmsFrakUrl,
  KF_AMS_MAIN: kfAmsMainUrl,
  KF_AMS_ROMAN: kfAmsRomanUrl,
} satisfies RuntimeFontAssets;

export const runtimeAssetManifest = {
  fonts: runtimeFontAssets,
  toolbar: {},
  styles: {},
  defaultFontFamily: DEFAULT_RUNTIME_FONT_FAMILY,
  requiresBundledAssets: true,
} satisfies RuntimeAssetManifest;
