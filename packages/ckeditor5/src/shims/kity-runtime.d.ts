export type KityFontAssetMap = {
  KF_AMS_BB: string;
  KF_AMS_CAL: string;
  KF_AMS_FRAK: string;
  KF_AMS_MAIN: string;
  KF_AMS_ROMAN: string;
};

export type KityToolbarAssetMap = {
  btn: string;
  other: string;
};

export type KityStyleAssetMap = {
  editor: string;
};

export type KityEditorAssets = {
  fonts: KityFontAssetMap;
  toolbar: KityToolbarAssetMap;
  styles: KityStyleAssetMap;
};

export type KityEditorOptions = {
  height?: number | string;
  initialLatex?: string;
  autofocus?: boolean;
  assets?: Partial<KityEditorAssets>;
  render?: {
    fontsize?: number;
  };
};

export type KityEditorHandle = {
  ready: (callback: (this: { execCommand: (name: string, value?: string) => unknown }) => void) => void;
  execCommand: (name: string, value?: string) => void;
  focus: () => void;
  destroy: () => void;
  host: HTMLElement;
  raw: unknown;
};

export function mountKityEditor(container: HTMLElement, options?: KityEditorOptions): Promise<KityEditorHandle>;
