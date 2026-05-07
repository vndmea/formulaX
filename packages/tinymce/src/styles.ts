const STYLE_ID = 'fx-tinymce-styles';

export const tinymceStyles = `
.fx-tinymce-modal-open {
  overflow: hidden;
}

.fx-tinymce-modal-root {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fx-tinymce-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.48);
}

.fx-tinymce-modal {
  --fx-tinymce-editor-body-height: 264px;
  --fx-tinymce-workspace-height: 168px;
  position: relative;
  width: min(860px, calc(100vw - 32px));
  height: auto;
  max-height: calc(100vh - 32px);
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.28);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fx-tinymce-modal__header {
  min-height: 56px;
  padding: 0 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.fx-tinymce-modal__header,
.fx-tinymce-modal__footer,
.fx-tinymce-modal__title,
.fx-tinymce-modal__close,
.fx-tinymce-modal__button,
.fx-tinymce-editor-loading,
.fx-tinymce-editor-error {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.fx-tinymce-modal__title {
  font-size: 16px;
  font-weight: 650;
  margin: 0;
  color: #111827;
}

.fx-tinymce-modal__close {
  border: 0;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #6b7280;
}

.fx-tinymce-modal__body {
  flex: 0 0 auto;
  height: var(--fx-tinymce-editor-body-height);
  padding: 0;
  overflow: hidden;
  min-height: var(--fx-tinymce-editor-body-height);
}

.fx-tinymce-editor-host {
  width: 100%;
  height: var(--fx-tinymce-editor-body-height);
  min-height: var(--fx-tinymce-editor-body-height);
  overflow: hidden;
}

.fx-tinymce-kity-host {
  width: 100%;
  height: var(--fx-tinymce-editor-body-height);
  min-height: var(--fx-tinymce-editor-body-height);
  overflow: hidden;
}

.fx-tinymce-kity-host .kf-editor {
  height: var(--fx-tinymce-editor-body-height) !important;
}

.fx-tinymce-kity-host .kf-editor-edit-area,
.fx-tinymce-kity-host .kf-editor-canvas-container {
  min-height: var(--fx-tinymce-workspace-height);
  height: var(--fx-tinymce-workspace-height);
}

.fx-tinymce-kity-host .kf-editor-edit-area {
  flex: 0 0 auto;
}

.fx-tinymce-editor-loading {
  padding: 24px;
  color: #4b5563;
  text-align: center;
}

.fx-tinymce-editor-error {
  padding: 24px;
  color: #dc2626;
  font-size: 14px;
}

.fx-tinymce-editor-error pre {
  white-space: pre-wrap;
  word-break: break-all;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
}

.fx-tinymce-modal__footer {
  min-height: 64px;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.fx-tinymce-modal__button {
  appearance: none;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #111827;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
}

.fx-tinymce-modal__button--primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}

.formulax-math {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  padding: 0 2px;
  margin: 0 1px;
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
  user-select: none;
}

.formulax-math:hover {
  outline: 1px solid rgba(37, 99, 235, 0.35);
  background: rgba(37, 99, 235, 0.06);
}

.formulax-math__image {
  display: inline-block;
  max-width: 100%;
  height: auto;
  vertical-align: middle;
  pointer-events: none;
}

.formulax-math__render {
  font-family: "Times New Roman", serif;
}
`;

export function ensureTinyMceStyles(doc: Document = document): void {
  if (doc.getElementById(STYLE_ID)) return;

  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = tinymceStyles;
  doc.head.appendChild(style);
}
