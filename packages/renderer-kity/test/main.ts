import { renderLatexToSvgMarkup } from '@formulaxjs/renderer-kity';

declare global {
  interface Window {
    __FORMULAX_RENDERER_KITY_TEST__?: {
      renderLatexToSvgMarkup: typeof renderLatexToSvgMarkup;
    };
  }
}

window.__FORMULAX_RENDERER_KITY_TEST__ = {
  renderLatexToSvgMarkup,
};

document.querySelector<HTMLDivElement>('#app')!.textContent = 'renderer-kity test ready';
