import { createFormulaXNode } from '@formulaxjs/tiptap';
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
  getJSON?: () => unknown;
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

    <div class="fx-demo-actions">
      <button id="insert-formula" type="button">Open FormulaX</button>
    </div>

    <div id="editor" class="fx-tiptap-host"></div>
  </main>
`;

const versionSelect = queryRequiredElement<HTMLSelectElement>('#tiptap-version');
const host = queryRequiredElement<HTMLElement>('#editor');
const button = queryRequiredElement<HTMLButtonElement>('#insert-formula');

let activeEditor: DemoEditor | null = null;
let activeLoadToken = 0;

function setStatus(message: string, tone: 'info' | 'success' | 'error'): void {
  button.title = message;
  button.dataset.tone = tone;
  button.setAttribute('aria-label', `Open FormulaX. ${message}`);
}

function logNodeTree(reason: 'create' | 'update'): void {
  if (!activeEditor?.getJSON) {
    return;
  }

  console.log(`[tiptap-demo] ${reason} node tree`, activeEditor.getJSON());
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
      onCreate: () => {
        logNodeTree('create');
      },
      onUpdate: () => {
        logNodeTree('update');
      },
    });

    setStatus(`Loaded Tiptap v${version}. Use the dialog button or double-click a formula to edit.`, 'success');
    button.disabled = false;
  } catch (error) {
    console.error(error);
    setStatus(`Failed to load Tiptap v${version}. Check the console for details.`, 'error');
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
