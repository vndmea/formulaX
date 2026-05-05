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

export type KityEditorConstructorOptions = KityEditorOptions & {
  el: string | HTMLElement;
};

export type KityEditorHandle = {
  ready: (callback: (this: { execCommand: (name: string, value?: string) => void }) => void) => void;
  execCommand: (name: string, value?: string) => void;
  focus: () => void;
  destroy: () => void;
  host: HTMLElement;
  raw: unknown;
};

export function ensureKityRuntime(): Promise<void>;
export function createKityEditor(container: HTMLElement, options?: KityEditorOptions): Promise<KityEditorHandle>;
export function mountKityEditor(container: HTMLElement, options?: KityEditorOptions): Promise<KityEditorHandle>;
export class FormulaXEditor {
  constructor(options: KityEditorConstructorOptions);
  ready(callback: KityEditorHandle['ready'] extends (callback: infer T) => void ? T : never): this;
  execCommand(name: string, value?: string): Promise<this>;
  focus(): Promise<this>;
  destroy(): Promise<void>;
  getHandle(): Promise<KityEditorHandle>;
}

declare global {
  interface Window {
    FormulaXEditor?: typeof FormulaXEditor;
  }
}

export * from './dom-utils';
export * from './vendor/char-position';
export * from './vendor/legacy-box-type';
export * from './vendor/legacy-common';
export * from './vendor/legacy-component';
export * from './vendor/legacy-ele-type';
export * from './vendor/legacy-event';
export * from './vendor/legacy-kfevent';
export * from './vendor/legacy-group-type';
export * from './vendor/legacy-input-filter';
export * from './vendor/install-legacy-data';
export * from './vendor/legacy-item-type';
export * from './vendor/legacy-kf-ext-def';
export * from './vendor/legacy-sysconf';
export * from './vendor/legacy-ui-def';
export * from './vendor/legacy-ui-utils';
export * from './vendor/legacy-utils';
export * from './vendor/other-position';
