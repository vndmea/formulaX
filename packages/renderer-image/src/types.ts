import type {
  FormulaRenderOptions,
  FormulaRenderResult,
  FormulaRenderer,
} from '@formulaxjs/renderer';

export type FormulaXOutputMode = 'svg' | 'image';

export type FormulaXImageFormat = 'png';

export type FormulaXImageFailureStrategy = 'throw' | 'fallback-svg';

export interface FormulaXImageUploadResult {
  url: string;
  width?: number;
  height?: number;
}

export interface FormulaXImageUploadContext {
  latex: string;
  svg: string;
  blob: Blob;
  filename: string;
  mimeType: 'image/png';
  width: number;
  height: number;
  displayStyle?: string;
}

export interface FormulaXImageOptions {
  format?: FormulaXImageFormat;
  scale?: number;
  backgroundColor?: string;
  filename?: string | ((latex: string) => string);
  upload: (ctx: FormulaXImageUploadContext) => Promise<FormulaXImageUploadResult>;
  onUploadError?: FormulaXImageFailureStrategy;
}

export interface FormulaXImageRenderOptions {
  output?: FormulaXOutputMode;
  renderer: FormulaRenderer;
  latex: string;
  className: string;
  render?: FormulaRenderOptions;
  image?: FormulaXImageOptions;
}

export interface FormulaXDisplayImageResult {
  url: string;
  width: number;
  height: number;
  displayStyle?: string;
}

export interface FormulaXDisplayRenderResult {
  output: FormulaXOutputMode;
  latex: string;
  renderHtml: string;
  source: FormulaRenderResult;
  image?: FormulaXDisplayImageResult;
}
