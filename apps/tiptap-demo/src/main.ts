import { createFormulaXNode } from '@formulax/tiptap';
import {
  loadTiptapRuntime,
  TIPTAP_VERSION_OPTIONS,
  type TiptapDemoVersion,
} from './tiptap-loader';
import './style.css';

type DemoEditor = {
  commands: {
    openFormulaX: () => boolean;
  };
  destroy?: () => void;
  getHTML?: () => string;
};

function queryRequiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Required element not found: ${selector}`);
  }

  return element;
}

const app = queryRequiredElement<HTMLDivElement>('#app');

app.innerHTML = `
  <main class="fx-demo-shell">
    <header class="fx-demo-header">
      <h1>Tiptap + FormulaX</h1>
      <p>Choose a Tiptap major version, then open the FormulaX dialog to insert or edit a formula.</p>
    </header>

    <label class="fx-demo-field">
      <span>Tiptap version</span>
      <select id="tiptap-version" aria-label="Tiptap version">
        ${TIPTAP_VERSION_OPTIONS.map((item) => `<option value="${item.value}">${item.label}</option>`).join('')}
      </select>
    </label>

    <p id="runtime-status" class="fx-demo-status" data-tone="info">Loading editor runtime…</p>

    <div id="editor" class="fx-tiptap-host"></div>

    <div class="fx-demo-actions">
      <button id="insert-formula" type="button">Open FormulaX</button>
    </div>

    <section class="fx-demo-output">
      <h2>Current HTML</h2>
      <pre id="editor-output"></pre>
    </section>
  </main>
`;

const versionSelect = queryRequiredElement<HTMLSelectElement>('#tiptap-version');
const host = queryRequiredElement<HTMLElement>('#editor');
const button = queryRequiredElement<HTMLButtonElement>('#insert-formula');
const status = queryRequiredElement<HTMLParagraphElement>('#runtime-status');
const output = queryRequiredElement<HTMLElement>('#editor-output');

let activeEditor: DemoEditor | null = null;
let activeLoadToken = 0;

function setStatus(message: string, tone: 'info' | 'success' | 'error'): void {
  status.textContent = message;
  status.dataset.tone = tone;
}

function syncOutput(): void {
  output.textContent = activeEditor?.getHTML?.() ?? '';
}

function destroyEditor(): void {
  activeEditor?.destroy?.();
  activeEditor = null;
  host.innerHTML = '';
}

button.addEventListener('click', () => {
  if (!activeEditor) {
    return;
  }

  activeEditor.commands.openFormulaX();
});

async function initTiptap(version: TiptapDemoVersion): Promise<void> {
  const loadToken = ++activeLoadToken;

  versionSelect.disabled = true;
  button.disabled = true;
  setStatus(`Loading Tiptap v${version}…`, 'info');
  destroyEditor();

  try {
    const runtime = await loadTiptapRuntime(version);
    const formulaXNode = createFormulaXNode(runtime.Node);

    if (loadToken !== activeLoadToken) {
      return;
    }

    activeEditor = new runtime.Editor({
      element: host,
      extensions: [runtime.StarterKit, formulaXNode],
      content: '<p>Click <strong>Open FormulaX</strong> to insert a formula, then double-click an existing formula to edit it.</p>',
      onCreate: syncOutput,
      onUpdate: syncOutput,
    });

    syncOutput();
    setStatus(`Loaded Tiptap v${version}. Use the dialog button or double-click a formula to edit.`, 'success');
    button.disabled = false;
  } catch (error) {
    console.error(error);
    setStatus(`Failed to load Tiptap v${version}. Check the console for details.`, 'error');
    output.textContent = '';
  } finally {
    if (loadToken === activeLoadToken) {
      versionSelect.disabled = false;
    }
  }
}

versionSelect.addEventListener('change', () => {
  void initTiptap(versionSelect.value as TiptapDemoVersion);
});

window.addEventListener('beforeunload', () => {
  destroyEditor();
});

void initTiptap(versionSelect.value as TiptapDemoVersion);
