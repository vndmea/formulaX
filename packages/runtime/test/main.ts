import { createRuntimeEditor, type FormulaCommand } from '@formulaxjs/runtime';
import type { FormulaSelection } from '@formulaxjs/runtime';
import { ensureFormulaXModalStyles, mountFormulaXEditor } from '@formulaxjs/editor';
import { renderLatexToSvgMarkup } from '@formulaxjs/renderer-next';

declare global {
  interface Window {
    __FORMULAX_RUNTIME_TEST__?: {
      mount: (latex?: string, options?: { wrap?: 'none' | 'soft'; maxWidth?: number }) => Promise<void>;
      getLatex: () => string;
      getRenderHtml: () => string;
      getSelection: () => FormulaSelection | null;
      dispatch: (command: FormulaCommand) => void;
      renderLatexToSvgMarkup: typeof renderLatexToSvgMarkup;
      mountModal: (latex?: string) => Promise<void>;
      getModalLatex: () => Promise<string>;
      destroyModal: () => void;
    };
  }
}

let handle: Awaited<ReturnType<typeof createRuntimeEditor>> | null = null;
let modalHandle: ReturnType<typeof mountFormulaXEditor> | null = null;

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
  getSelection() {
    if (!handle) {
      throw new Error('runtime test editor not mounted');
    }
    return handle.editor.getSelection();
  },
  dispatch(command) {
    if (!handle) {
      throw new Error('runtime test editor not mounted');
    }
    handle.editor.dispatch(command);
  },
  renderLatexToSvgMarkup,
  async mountModal(latex = '') {
    ensureFormulaXModalStyles();

    let host = document.querySelector<HTMLElement>('#runtime-modal');
    if (!host) {
      host = document.createElement('div');
      host.id = 'runtime-modal';
      document.body.appendChild(host);
    }

    modalHandle?.destroy();
    modalHandle = mountFormulaXEditor(host, {
      runtime: 'v2',
      initialLatex: latex,
      autofocus: false,
    });
    await modalHandle.getLatex();
  },
  async getModalLatex() {
    if (!modalHandle) {
      throw new Error('runtime test modal not mounted');
    }
    return modalHandle.getLatex();
  },
  destroyModal() {
    modalHandle?.destroy();
    modalHandle = null;
  },
};

void mount('\\frac{a}{b}');
