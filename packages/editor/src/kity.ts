import { createEmptyState, parseLatex, type FormulaState } from '@formulaxjs/core';
import {
  kityFontAssets,
  mountKityEditor,
  type KityEditorAssets,
} from '@formulaxjs/runtime-kity';
import type { FormulaXLocale } from '@formulaxjs/core';
import {
  createRuntimeEditor,
  type RuntimeEditorAssets,
} from '@formulaxjs/runtime';
import { escapeHtml, ensureFormulaXBaseStyles } from '@formulaxjs/renderer';
import {
  serializeKityFormulaFromRoot,
  waitForKityFormulaSvgLayout,
} from '@formulaxjs/renderer/kity';
import {
  clearFormulaXPerfMarks,
  markFormulaXPerf,
  measureFormulaXPerf,
  preloadFormulaXEditor,
  recordFormulaXPerfPoint,
} from './perf';
import { ensureRuntimeFontStyles } from './runtime-fonts';
import { mountStandardRuntimeToolbar } from './standard-runtime-toolbar';

const EMPTY_FORMULA_PLACEHOLDER = '\\placeholder ';
const STYLE_ID = 'fx-formula-modal-styles';

export type FormulaXEditorRuntime = 'kity' | 'standard';
export type FormulaXEditorRuntimePreference = FormulaXEditorRuntime | 'auto';

export const DEFAULT_FORMULAX_EDITOR_RUNTIME: FormulaXEditorRuntime = 'kity';

let defaultFormulaXEditorRuntime: FormulaXEditorRuntimePreference = DEFAULT_FORMULAX_EDITOR_RUNTIME;

export function getDefaultFormulaXEditorRuntime(): FormulaXEditorRuntimePreference {
  return defaultFormulaXEditorRuntime;
}

export function setDefaultFormulaXEditorRuntime(runtime: FormulaXEditorRuntimePreference): void {
  defaultFormulaXEditorRuntime = runtime;
}

export function resetDefaultFormulaXEditorRuntime(): void {
  defaultFormulaXEditorRuntime = DEFAULT_FORMULAX_EDITOR_RUNTIME;
}

export interface FormulaXEditorOptions {
  initialLatex?: string;
  height?: number | string;
  autofocus?: boolean;
  runtime?: FormulaXEditorRuntimePreference;
  locale?: FormulaXLocale;
  assets?: Partial<KityEditorAssets>;
  runtimeAssets?: Partial<RuntimeEditorAssets>;
  wrap?: 'none' | 'soft';
  maxWidth?: number | 'host';
  lineGap?: number;
  continuationIndent?: number;
  render?: {
    fontsize?: number;
    fontSize?: number;
  };
}

export interface MountedFormulaXEditor {
  root: HTMLElement;
  getLatex: () => Promise<string>;
  getState: () => Promise<FormulaState>;
  getRenderHtml: () => Promise<string>;
  destroy: () => void;
}

interface MountedFormulaXHandle {
  ready: Promise<void>;
  getLatex: () => Promise<string>;
  getRenderHtml: () => Promise<string>;
  destroy: () => void;
}

export const formulaXModalStyles = `
.fx-formula-modal-open {
  overflow: hidden;
}

.fx-formula-modal-root {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  overflow-x: hidden;
  overflow-y: auto;
}

.fx-formula-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(48, 48, 48, 0.5);
}

.fx-formula-modal {
  --fx-formula-editor-body-height: 280px;
  --fx-formula-workspace-height: 184px;
  position: relative;
  width: min(900px, calc(100vw - 40px));
  height: auto;
  max-height: none;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #b3aead;
  border-radius: 3px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: visible;
  isolation: isolate;
}

.fx-formula-modal__header,
.fx-formula-modal__footer,
.fx-formula-modal__title,
.fx-formula-modal__close,
.fx-formula-modal__button,
.fx-formula-editor-loading,
.fx-formula-editor-error {
  font-family: Helvetica, Arial, "微软雅黑", "Microsoft YaHei", "宋体", sans-serif;
}

.fx-formula-modal__header {
  min-height: 42px;
  padding: 0 14px;
  border-bottom: 1px solid #d8d6cd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  position: relative;
  z-index: 3;
  background: #f7f6f0;
  border-radius: 3px 3px 0 0;
}

.fx-formula-modal__title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.fx-formula-modal__close {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid #cfc9bf;
  background: linear-gradient(180deg, #ffffff, #ece8dc);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  color: #5d5d5d;
  border-radius: 3px;
}

.fx-formula-modal__close:hover {
  border-color: #9fcfa0;
  background: #ebf7e6;
}

.fx-formula-modal__body {
  flex: 0 0 auto;
  height: var(--fx-formula-editor-body-height);
  padding: 0;
  overflow: visible;
  min-height: var(--fx-formula-editor-body-height);
  position: relative;
  z-index: 2;
  background: #fff;
}

.fx-formula-editor-host {
  width: 100%;
  height: var(--fx-formula-editor-body-height);
  min-height: var(--fx-formula-editor-body-height);
  overflow: visible;
  position: relative;
  background: #fff;
}

.fx-formula-runtime-host {
  width: 100%;
  height: var(--fx-formula-editor-body-height);
  min-height: var(--fx-formula-editor-body-height);
  overflow: visible;
  position: relative;
  background: #fff;
}

.fx-formula-runtime-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: visible;
  border: 1px solid #e0e0e0;
  background: #f6f5ee;
}

.fx-formula-runtime-toolbar-host {
  flex: 0 0 auto;
  background: #f6f5ee;
  position: relative;
  z-index: 20;
  overflow: visible;
}

.fx-runtime-toolbar {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding: 1px 10px;
  background-color: #f6f5ee;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  color: #000;
  font-family: Helvetica, Arial, "微软雅黑", "Microsoft YaHei", "宋体", sans-serif;
}

.fx-runtime-toolbar__row {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow: visible;
}

.fx-runtime-toolbar__button {
  appearance: none;
  box-sizing: border-box;
  flex: 0 0 auto;
  padding: 7px 6px 6px;
  height: 79px;
  font-size: 12px;
  display: inline-block;
  border: 1px solid transparent;
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  z-index: 3;
  vertical-align: top;
  opacity: 1;
  margin-right: 1px;
  background: transparent;
  color: inherit;
  overflow: visible;
}

.fx-runtime-toolbar__history {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: flex-start;
  gap: 2px;
  margin: 8px 8px 0 0;
}

.fx-runtime-toolbar__history .fx-runtime-toolbar__button {
  min-width: 34px;
  height: 32px;
  padding: 0;
}

.fx-runtime-toolbar__history .fx-runtime-toolbar__button-in {
  height: 30px;
}

.fx-runtime-toolbar__history .fx-runtime-toolbar__button-icon {
  width: 30px;
  height: 30px;
  margin: 0 auto;
}

.fx-runtime-toolbar__history .fx-runtime-toolbar__button-label {
  display: none;
}

.fx-runtime-toolbar__delimiter {
  flex: 0 0 11px;
  height: 79px;
  display: inline-block;
}

.fx-runtime-toolbar__delimiter-line {
  display: block;
  width: 1px;
  height: 100%;
  margin: 0 auto;
  background: linear-gradient(
    to bottom,
    rgba(233, 233, 233, 0.11),
    rgba(92, 92, 92, 0.2) 60%,
    rgba(92, 92, 92, 0.41) 80%,
    rgba(123, 123, 123, 0.5)
  );
}

.fx-runtime-toolbar__button:hover,
.fx-runtime-toolbar__button.is-open,
.fx-runtime-toolbar__button[data-active="true"] {
  border-color: #a9d9ab;
  background: #ebf7e6;
}

.fx-runtime-toolbar__button.is-open .fx-runtime-toolbar__button-label,
.fx-runtime-toolbar__button[data-active="true"] .fx-runtime-toolbar__button-label {
  color: #2b6a2f;
}

.fx-runtime-toolbar__button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.fx-runtime-toolbar__button-in {
  height: 100%;
  width: 100%;
  display: block;
  overflow: visible;
}

.fx-runtime-toolbar__button-icon {
  width: 32px;
  height: 30px;
  flex: 0 0 auto;
  margin: 0 auto 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #000;
}

.fx-runtime-toolbar__button-icon--template {
  height: 26px;
}

.fx-runtime-toolbar__button--presets .fx-runtime-toolbar__button-label {
  margin-top: 2px;
}

.fx-runtime-toolbar__button-icon--presets {
  color: #53b856;
}

.fx-runtime-toolbar__button-icon--presets svg {
  display: block;
  width: 24px;
  height: 24px;
}

.fx-runtime-toolbar__button-icon .fx-runtime-svg,
.fx-runtime-toolbar__item-preview .fx-runtime-svg {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: 100%;
  overflow: visible;
  transform-origin: center center;
}

.fx-runtime-toolbar__button[data-formulax-toolbar-control="fraction"] .fx-runtime-toolbar__button-icon .fx-runtime-svg {
  transform: translateY(1px) scale(0.94);
}

.fx-runtime-toolbar__button[data-formulax-toolbar-control="scripts"] .fx-runtime-toolbar__button-icon .fx-runtime-svg {
  transform: translateY(1px) scale(0.96);
}

.fx-runtime-toolbar__button[data-formulax-toolbar-control="radicals"] .fx-runtime-toolbar__button-icon .fx-runtime-svg {
  transform: translateY(1px) scale(0.94);
}

.fx-runtime-toolbar__button[data-formulax-toolbar-control="integrals"] .fx-runtime-toolbar__button-icon .fx-runtime-svg {
  transform: translateY(1px) scale(0.94);
}

.fx-runtime-toolbar__button[data-formulax-toolbar-control="large-ops"] .fx-runtime-toolbar__button-icon .fx-runtime-svg,
.fx-runtime-toolbar__button[data-formulax-toolbar-control="大型-运算符"] .fx-runtime-toolbar__button-icon .fx-runtime-svg {
  transform: translateY(-1px) scale(1.02);
}

.fx-runtime-toolbar__button[data-formulax-toolbar-control="brackets"] .fx-runtime-toolbar__button-icon .fx-runtime-svg {
  transform: scale(0.94);
}

.fx-runtime-toolbar__button[data-formulax-toolbar-control="functions"] .fx-runtime-toolbar__button-icon .fx-runtime-svg {
  transform: translateY(1px) scale(0.92);
}

.fx-runtime-toolbar__button-icon[aria-busy="true"],
.fx-runtime-toolbar__item-preview[aria-busy="true"] {
  background: linear-gradient(90deg, #f1f0ea 25%, #faf9f5 50%, #f1f0ea 75%);
  background-size: 200% 100%;
  animation: fx-runtime-preview-loading 1.1s linear infinite;
}

@keyframes fx-runtime-preview-loading {
  to {
    background-position: -200% 0;
  }
}

.fx-runtime-toolbar__area {
  flex: 0 0 315px;
  width: 315px;
  height: 79px;
  display: flex;
  align-items: stretch;
  position: relative;
  box-sizing: border-box;
  margin-right: 10px;
  border: 1px solid #e0dfd5;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.fx-runtime-toolbar__area-container {
  width: 293px;
  height: 70px;
  margin: 5px;
  display: grid;
  grid-template-columns: repeat(9, 32px);
  grid-auto-rows: 32px;
  gap: 2px 0;
  overflow: hidden;
}

.fx-runtime-toolbar__area-button-container {
  width: 18px;
  min-width: 18px;
  height: 79px;
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  border-left: 1px solid #d3d3d3;
  background: #f2f0e6;
}

.fx-runtime-toolbar__area-item {
  appearance: none;
  padding: 0;
  border: 0;
  display: block;
  background: transparent;
  cursor: pointer;
  position: relative;
}

.fx-runtime-toolbar__area-page,
.fx-runtime-toolbar__area-open {
  appearance: none;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  position: relative;
  cursor: pointer;
}

.fx-runtime-toolbar__area-page--down {
  border-top: 1px solid #d3d3d3;
  border-bottom: 1px solid #d3d3d3;
}

.fx-runtime-toolbar__area-page::before,
.fx-runtime-toolbar__area-open::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  transform: translate(-50%, -50%);
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
}

.fx-runtime-toolbar__area-page--up::before {
  border-bottom: 5px solid #6b6b6b;
}

.fx-runtime-toolbar__area-page--down::before {
  border-top: 5px solid #6b6b6b;
}

.fx-runtime-toolbar__area-open::before {
  top: calc(50% + 3px);
  border-top: 5px solid #6b6b6b;
}

.fx-runtime-toolbar__area-open::after {
  content: '';
  position: absolute;
  top: calc(50% - 2px);
  left: 50%;
  width: 7px;
  height: 1px;
  background: #6b6b6b;
  transform: translate(-50%, -50%);
}

.fx-runtime-toolbar__area-page:hover,
.fx-runtime-toolbar__area-open:hover,
.fx-runtime-toolbar__area-open.is-open {
  background-color: #e5e4e1;
}

.fx-runtime-toolbar__area-page:disabled {
  cursor: default;
  opacity: 0.3;
}

.fx-runtime-toolbar__area-item {
  width: 26px;
  height: 26px;
}

.fx-runtime-toolbar__area-item-inner {
  position: absolute;
  top: -4px;
  left: -4px;
  width: 34px;
  height: 34px;
  border: 1px solid #fff;
  transition: transform 0.1s linear, border-color 0.1s linear;
  transform: scale(0.76);
}

.fx-runtime-toolbar__area-item .fx-runtime-toolbar__item-preview {
  box-sizing: border-box;
  transition: border-color 0.1s linear;
}

.fx-runtime-toolbar__area-item:hover .fx-runtime-toolbar__area-item-inner {
  border-color: #dff3df;
  transform: scale(1);
}

.fx-runtime-toolbar__area-item:hover .fx-runtime-toolbar__item-preview--symbol {
  border-color: #6eb864;
}

.fx-runtime-toolbar__button-label {
  color: #666;
  text-align: center;
  display: block;
  font-size: 11px;
  line-height: 17px;
  white-space: nowrap;
}

.fx-runtime-toolbar__button-sign {
  border: 4px solid transparent;
  border-top-color: #2d2d2d;
  width: 0;
  height: 0;
  display: inline-block;
  margin: 6px 0 0 3px;
  vertical-align: top;
}

.fx-runtime-toolbar__popover {
  position: absolute;
  left: 0;
  top: 78px;
  z-index: 40;
  border: 1px solid #b3aead;
  border-radius: 3px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.11);
  background: #fff;
  overflow: visible;
}

.fx-runtime-toolbar__popover.is-hidden {
  display: none;
}

.fx-runtime-toolbar__popover-body,
.fx-runtime-toolbar__popover-card {
  max-height: none;
  overflow: visible;
}

.fx-runtime-toolbar__section + .fx-runtime-toolbar__section {
  margin-top: 0;
}

.fx-runtime-toolbar__section-title {
  background-color: #f7f6f0;
  min-height: 23px;
  line-height: 1.35;
  font-size: 12px;
  border: 1px solid #ebeae4;
  border-width: 1px 0;
  padding: 4px 12px;
  white-space: normal;
}

.fx-runtime-toolbar__grid {
  padding: 6px 4px;
  white-space: normal;
}

.fx-runtime-toolbar__grid--presets {
  padding: 6px 10px;
}

.fx-runtime-toolbar__item {
  appearance: none;
  display: inline-block;
  width: var(--fx-runtime-toolbar-item-width, 72px);
  height: var(--fx-runtime-toolbar-item-height, 64px);
  margin: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  vertical-align: top;
  cursor: pointer;
}

.fx-runtime-toolbar__item--symbols {
  position: relative;
  width: 32px;
  height: 32px;
  margin: 3px;
  padding: 0;
}

.fx-runtime-toolbar__item--presets {
  display: block;
  width: calc(100% - 8px);
  height: auto;
  min-height: 0;
  margin: 0 0 12px;
  text-align: left;
}

.fx-runtime-toolbar__item--presets:last-child {
  margin-bottom: 0;
}

.fx-runtime-toolbar__item-content {
  box-sizing: border-box;
  display: flex;
  width: var(--fx-runtime-toolbar-item-width, 70px);
  height: var(--fx-runtime-toolbar-item-height, 56px);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #fff;
  padding: 0;
}

.fx-runtime-toolbar__item-content--symbols {
  position: absolute;
  top: 0;
  left: 0;
  width: 32px;
  height: 32px;
}

.fx-runtime-toolbar__item-content--symbols:hover {
  border-color: #dff3df;
}

.fx-runtime-toolbar__item-content--presets {
  width: 100%;
  height: auto;
  min-height: 54px;
  align-items: stretch;
  justify-content: flex-start;
  padding: 5px;
}

.fx-runtime-toolbar__item-content:hover {
  border-color: #6eb864;
}

.fx-runtime-toolbar__item-label {
  margin-bottom: 5px;
  line-height: 1.35;
  white-space: normal;
  display: block;
  color: #000;
}

.fx-runtime-toolbar__item-preview--symbol {
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  line-height: 32px;
  font-size: 20px;
  text-align: center;
  color: #000;
  border: 1px solid #808080;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: transform 0.1s linear, border-color 0.1s linear;
}

.fx-runtime-toolbar__item-preview--symbol .fx-runtime-svg {
  max-width: 28px;
  max-height: 28px;
  overflow: hidden;
}

.fx-runtime-toolbar__item:hover .fx-runtime-toolbar__item-preview--symbol {
  border-color: #6eb864;
  transform: scale(1.2);
}

.fx-runtime-toolbar__item-preview--template {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: var(--fx-runtime-toolbar-preview-width, 60px);
  height: var(--fx-runtime-toolbar-preview-height, 42px);
  padding: 4px;
  line-height: 1.15;
  border: 1px solid #808080;
  white-space: nowrap;
  overflow: hidden;
}

.fx-runtime-toolbar__item-preview--template .fx-runtime-svg {
  max-width: calc(var(--fx-runtime-toolbar-preview-width, 60px) - 10px);
  max-height: calc(var(--fx-runtime-toolbar-preview-height, 42px) - 10px);
  margin: auto;
}

.fx-runtime-toolbar__item--presets .fx-runtime-toolbar__item-preview--template {
  width: 100%;
  height: var(--fx-runtime-toolbar-preview-height, auto);
  min-height: var(--fx-runtime-toolbar-preview-height, 42px);
  align-items: flex-start;
  justify-content: center;
  padding: 6px 5px 4px;
  overflow: hidden;
  line-height: 0;
}

.fx-runtime-toolbar__item--presets .fx-runtime-toolbar__item-preview--template .fx-runtime-svg {
  max-width: 100%;
  max-height: 100%;
  margin: 0 auto;
}

.fx-runtime-toolbar__item:hover .fx-runtime-toolbar__item-preview--template {
  border-color: #6eb864;
}

.fx-formula-runtime-surface {
  flex: 1 1 auto;
  width: 100%;
  height: auto !important;
  min-height: 0;
  overflow: hidden;
  background: #fff;
  position: relative;
  cursor: text;
}

.fx-formula-runtime-surface.fx-runtime-editor-host {
  min-height: 0 !important;
}

.fx-formula-runtime-surface .fx-runtime-editor {
  width: 100%;
  height: 100% !important;
  min-height: 0 !important;
  overflow: auto;
}

.fx-formula-runtime-surface .fx-runtime-editor__surface {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0 !important;
  padding: 16px !important;
  display: flex;
  align-items: safe center;
  justify-content: safe center;
}

.fx-formula-runtime-surface .fx-runtime-svg {
  flex: 0 0 auto;
  max-width: none;
}

.fx-formula-kity-host {
  width: 100%;
  height: var(--fx-formula-editor-body-height);
  min-height: var(--fx-formula-editor-body-height);
  overflow: visible;
  position: relative;
}

.fx-formula-kity-host .kf-editor {
  box-sizing: border-box;
  width: 100%;
  height: var(--fx-formula-editor-body-height) !important;
  overflow: visible !important;
}

.fx-formula-kity-host .kf-editor-toolbar {
  overflow: visible;
  position: relative;
  z-index: 20;
}

.fx-formula-kity-host .kf-editor-ui-button-mount-point,
.fx-formula-kity-host .kf-editor-ui-area-mount,
.fx-formula-kity-host .kf-editor-ui-box,
.fx-formula-kity-host .kf-editor-ui-list {
  z-index: 1000;
}

.fx-formula-kity-host .kf-editor-edit-area,
.fx-formula-kity-host .kf-editor-canvas-container {
  min-height: var(--fx-formula-workspace-height);
  height: var(--fx-formula-workspace-height);
}

.fx-formula-kity-host .kf-editor-edit-area {
  flex: 0 0 auto;
  overflow: hidden;
}

.fx-formula-kity-host .kf-editor,
.fx-formula-kity-host .kf-editor svg text {
  font-family: "KF AMS MAIN", "Cambria Math", "Latin Modern Math", "Times New Roman", serif !important;
}

.fx-formula-kity-host .kf-editor-ui-box-item-content,
.fx-formula-kity-host .kf-editor-ui-box-item-val {
  min-width: 32px;
  min-height: 32px;
}

.fx-formula-kity-host .kf-editor-ui-box-item-val svg,
.fx-formula-kity-host .kf-editor-ui-box-item-val img,
.fx-formula-kity-host .kf-editor-ui-area-item-img,
.fx-formula-kity-host .kf-editor-ui-area-item-text {
  display: block;
}

.fx-formula-editor-loading {
  height: var(--fx-formula-editor-body-height);
  padding: 24px;
  color: #4b5563;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fx-formula-editor-error {
  padding: 24px;
  color: #dc2626;
  font-size: 14px;
}

.fx-formula-editor-error pre {
  white-space: pre-wrap;
  word-break: break-all;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
}

.fx-formula-modal__footer {
  min-height: 56px;
  padding: 10px 14px;
  border-top: 1px solid #d8d6cd;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  background: #f7f6f0;
  border-radius: 0 0 3px 3px;
}

.fx-formula-modal__button {
  appearance: none;
  border: 1px solid #b1b1b1;
  background: linear-gradient(180deg, #fff, #ece9dd);
  color: #333;
  border-radius: 3px;
  padding: 7px 14px;
  font-size: 14px;
  cursor: pointer;
}

.fx-formula-modal__button--primary {
  border-color: #53b856;
  background: linear-gradient(180deg, #6cc96a, #53b856);
  color: #fff;
}

.fx-formula-modal__button:hover {
  border-color: #9fcfa0;
  background: #ebf7e6;
}

.fx-formula-modal__button--primary:hover {
  border-color: #45a949;
  background: linear-gradient(180deg, #60c260, #45a949);
}
`;

export function ensureFormulaXModalStyles(doc: Document = document): void {
  ensureFormulaXBaseStyles(doc);
  ensureRuntimeFontStyles(doc, kityFontAssets);

  if (doc.getElementById(STYLE_ID)) return;

  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = formulaXModalStyles;
  doc.head.appendChild(style);
}

export function renderFormulaXEditorLoadingState(root: HTMLElement): void {
  root.classList.add('fx-formula-kity-host');
  root.innerHTML = `
    <div class="fx-formula-editor-loading" role="status" aria-live="polite">
      Loading FormulaX editor...
    </div>
  `;
}

export function mountFormulaXEditor(
  root: HTMLElement,
  options: FormulaXEditorOptions = {},
): MountedFormulaXEditor {
  recordFormulaXPerfPoint('fx:formula-editor:mount:start');
  const mountStart = markFormulaXPerf('fx:formula-editor:mount:start:scope');
  let destroyed = false;
  let latestLatex = options.initialLatex ?? '';
  let handle: MountedFormulaXHandle | null = null;
  const initialLatex = latestLatex.trim() ? latestLatex : EMPTY_FORMULA_PLACEHOLDER;
  const runtime = resolveFormulaXEditorRuntime(options);

  renderFormulaXEditorLoadingState(root);
  const loadingVisibleMark = markFormulaXPerf('fx:formula-editor:loading-visible');
  measureFormulaXPerf('fx:formula-editor:loading-visible', mountStart, loadingVisibleMark);
  clearFormulaXPerfMarks(loadingVisibleMark);

  if (runtime === 'standard') {
    void preloadFormulaXEditor({
      doc: root.ownerDocument ?? document,
      runtimeAssets: options.runtimeAssets,
      initialLatex,
      renderFontSize: options.render?.fontSize ?? options.render?.fontsize ?? 36,
      height: options.height ?? '100%',
      wrap: options.wrap,
      maxWidth: options.maxWidth,
      lineGap: options.lineGap,
      continuationIndent: options.continuationIndent,
    });
  }

  const readyPromise = mountFormulaEditorHandle(root, {
    ...options,
    initialLatex,
    runtime,
  })
    .then((nextHandle) => {
      if (destroyed) {
        nextHandle.destroy();
        throw new Error('FormulaX editor mount cancelled');
      }

      const readyMark = markFormulaXPerf('fx:kity-editor:ready');
      measureFormulaXPerf('fx:kity-editor:ready', mountStart, readyMark);
      clearFormulaXPerfMarks(readyMark);
      handle = nextHandle;
      return nextHandle;
    })
    .catch((error) => {
      console.error('[FormulaX] Failed to load FormulaX editor:', error);

      if (!destroyed) {
        root.innerHTML = `
          <div class="fx-formula-editor-error">
            Failed to load FormulaX editor.
            <pre>${escapeHtml(error instanceof Error ? error.message : String(error))}</pre>
          </div>
        `;
      }

      throw error;
    })
    .finally(() => {
      clearFormulaXPerfMarks(mountStart);
    });

  const getCurrentLatex = async (): Promise<string> => {
    const readyHandle = handle ?? await readyPromise;
    const latex = await readyHandle.getLatex();

    if (latex !== null) {
      latestLatex = latex;
    }

    return latestLatex;
  };

  return {
    root,

    getLatex: getCurrentLatex,

    async getState(): Promise<FormulaState> {
      const latex = await getCurrentLatex();

      try {
        return {
          ...createEmptyState(),
          doc: parseLatex(latex),
        };
      } catch {
        return createEmptyState();
      }
    },

    async getRenderHtml(): Promise<string> {
      const readyHandle = handle ?? await readyPromise;
      return readyHandle.getRenderHtml();
    },

    destroy(): void {
      if (destroyed) return;
      destroyed = true;

      void readyPromise
        .then((readyHandle) => readyHandle.destroy())
        .catch(() => undefined);

      root.innerHTML = '';
    },
  };
}

async function mountFormulaEditorHandle(
  root: HTMLElement,
  options: FormulaXEditorOptions & { initialLatex: string; runtime: FormulaXEditorRuntime },
): Promise<MountedFormulaXHandle> {
  if (options.runtime === 'standard') {
    return mountStandardRuntimeHandle(root, options);
  }

  return mountLegacyKityHandle(root, options);
}

function resolveFormulaXEditorRuntime(options: FormulaXEditorOptions): FormulaXEditorRuntime {
  const requestedRuntime = options.runtime ?? defaultFormulaXEditorRuntime;
  if (requestedRuntime !== 'auto') {
    return requestedRuntime;
  }

  if (
    options.runtimeAssets
    || options.wrap
    || options.maxWidth !== undefined
    || options.lineGap !== undefined
    || options.continuationIndent !== undefined
  ) {
    return 'standard';
  }

  return DEFAULT_FORMULAX_EDITOR_RUNTIME;
}

async function mountStandardRuntimeHandle(
  root: HTMLElement,
  options: FormulaXEditorOptions & { initialLatex: string },
): Promise<MountedFormulaXHandle> {
  const doc = root.ownerDocument ?? document;
  ensureRuntimeFontStyles(root.ownerDocument ?? document, kityFontAssets);
  root.classList.remove('fx-formula-kity-host');
  root.classList.add('fx-formula-runtime-host');
  root.innerHTML = '';

  const shell = doc.createElement('div');
  shell.className = 'fx-formula-runtime-shell';

  const toolbarHost = doc.createElement('div');
  toolbarHost.className = 'fx-formula-runtime-toolbar-host';

  const surfaceHost = doc.createElement('div');
  surfaceHost.className = 'fx-formula-runtime-surface';

  shell.append(toolbarHost, surfaceHost);
  root.appendChild(shell);

  const handle = await createRuntimeEditor(surfaceHost, {
    initialLatex: options.initialLatex,
    height: options.height ?? '100%',
    autofocus: options.autofocus ?? true,
    readOnly: false,
    assets: options.runtimeAssets,
    wrap: options.wrap,
    maxWidth: options.maxWidth,
    lineGap: options.lineGap,
    continuationIndent: options.continuationIndent,
    render: {
      fontSize: options.render?.fontSize ?? options.render?.fontsize ?? 36,
    },
  });
  surfaceHost.querySelector('.fx-runtime-editor__surface')?.classList.add('fx-formula-runtime-canvas');

  const toolbar = mountStandardRuntimeToolbar(toolbarHost, handle, {
    locale: options.locale,
    runtimeAssets: options.runtimeAssets,
  });

  return {
    ready: handle.ready,
    getLatex: async () => handle.getLatex(),
    getRenderHtml: async () => handle.getRenderHtml(),
    destroy: () => {
      toolbar.destroy();
      handle.destroy();
    },
  };
}

async function mountLegacyKityHandle(
  root: HTMLElement,
  options: FormulaXEditorOptions & { initialLatex: string },
): Promise<MountedFormulaXHandle> {
  const handle = await mountKityEditor(root, {
    initialLatex: options.initialLatex,
    height: options.height ?? '100%',
    autofocus: options.autofocus ?? true,
    locale: options.locale,
    assets: options.assets as Partial<KityEditorAssets> | undefined,
    render: {
      fontsize: options.render?.fontsize ?? options.render?.fontSize ?? 40,
    },
  });

  return {
    ready: Promise.resolve(),
    getLatex: async () => tryReadLatexFromKityHandle(handle),
    getRenderHtml: async () => {
      await waitForKityFormulaSvgLayout(root);
      return serializeKityFormulaFromRoot(root);
    },
    destroy: () => handle.destroy(),
  };
}

async function tryReadLatexFromKityHandle(handle: {
  ready: (callback: (this: { execCommand: (name: string, value?: string) => unknown }) => void) => void;
}): Promise<string> {
  try {
    let isEmpty = false;

    handle.ready(function ready() {
      const result = this.execCommand('content.is.empty');
      isEmpty = result === true;
    });

    if (isEmpty) {
      return '';
    }
  } catch {
    // Fall back to source commands for runtimes without content.is.empty.
  }

  const candidates = [
    'get.source',
    'getSource',
    'getLatex',
    'get.latex',
    'get.content',
    'getContent',
  ];

  for (const command of candidates) {
    try {
      let value: unknown = null;

      handle.ready(function ready() {
        value = this.execCommand(command);
      });

      if (typeof value === 'string' && value.trim()) {
        return value;
      }

      if (value && typeof value === 'object' && 'latex' in value) {
        const latex = (value as { latex?: unknown }).latex;
        if (typeof latex === 'string' && latex.trim()) {
          return latex;
        }
      }
    } catch {
      // Try the next available command name.
    }
  }

  return '';
}
