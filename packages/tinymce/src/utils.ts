export function noop(): void {}

export function warn(message: string): void {
  console.warn(`[@formulax/tinymce] ${message}`);
}

export function injectStyles(css: string): void {
  if (document.getElementById('fx-tinymce-modal-styles')) return;
  const style = document.createElement('style');
  style.id = 'fx-tinymce-modal-styles';
  style.textContent = css;
  document.head.appendChild(style);
}