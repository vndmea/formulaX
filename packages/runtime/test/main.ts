import { createRuntimeEditor, type FormulaCommand } from '@formulaxjs/runtime';
import { renderLatexToSvgMarkup } from '@formulaxjs/renderer-next';

declare global {
  interface Window {
    __FORMULAX_RUNTIME_TEST__?: {
      mount: (latex?: string, options?: { wrap?: 'none' | 'soft'; maxWidth?: number }) => Promise<void>;
      getLatex: () => string;
      getRenderHtml: () => string;
      dispatch: (command: FormulaCommand) => void;
      renderLatexToSvgMarkup: typeof renderLatexToSvgMarkup;
    };
  }
}

let handle: Awaited<ReturnType<typeof createRuntimeEditor>> | null = null;

async function mount(latex = '', options: { wrap?: 'none' | 'soft'; maxWidth?: number } = {}): Promise<void> {
  const host = document.querySelector<HTMLElement>('#runtime-editor');
  if (!host) {
    throw new Error('runtime test host not found');
  }

  handle?.destroy();
  handle = await createRuntimeEditor(host, {
    initialLatex: latex,
    autofocus: false,
    height: 180,
    wrap: options.wrap,
    maxWidth: options.maxWidth,
  });
}

window.__FORMULAX_RUNTIME_TEST__ = {
  async mount(latex?: string, options?: { wrap?: 'none' | 'soft'; maxWidth?: number }) {
    await mount(latex, options);
  },
  getLatex() {
    if (!handle) {
      throw new Error('runtime test editor not mounted');
    }
    return handle.getLatex();
  },
  getRenderHtml() {
    if (!handle) {
      throw new Error('runtime test editor not mounted');
    }
    return handle.getRenderHtml();
  },
  dispatch(command) {
    if (!handle) {
      throw new Error('runtime test editor not mounted');
    }
    handle.editor.dispatch(command);
  },
  renderLatexToSvgMarkup,
};

void mount('\\frac{a}{b}');
