import { createFormulaXNode } from '@formulaxjs/tiptap';
import {
  loadTiptapRuntime,
  TIPTAP_VERSION_OPTIONS,
  type TiptapDemoVersion,
} from './tiptap-loader';
import './style.css';

type FormulaOutputMode = 'svg' | 'image';

type DemoEditor = {
  commands: {
    openFormulaX: () => boolean;
  };
  destroy?: () => void;
  getJSON?: () => unknown;
  getHTML?: () => string;
};

type DemoUploadPayload = {
  blob: Blob;
  filename: string;
  latex: string;
};

const DEFAULT_UPLOAD_ENDPOINT = 'http://localhost:3109/api/formula-image/upload';

function queryRequiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Required element not found: ${selector}`);
  }

  return element;
}

function createDemoImageUpload(getEndpoint: () => string) {
  return async ({ blob, filename, latex }: DemoUploadPayload): Promise<{ url: string }> => {
    const normalizedEndpoint = getEndpoint().trim();

    if (!normalizedEndpoint) {
      throw new Error('Image mode requires an upload endpoint.');
    }

    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('latex', latex);

    const response = await fetch(normalizedEndpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Formula image upload failed: ${response.status}`);
    }

    const payload = await response.json() as {
      url?: string;
      location?: string;
    };
    const url = payload.url?.trim() || payload.location?.trim();
    if (!url) {
      throw new Error('Upload response did not include a usable image URL.');
    }

    return { url };
  };
}

function createInitialTiptapContent(outputMode: FormulaOutputMode): string {
  if (outputMode === 'image') {
    return '<p>Image mode demo.</p>';
  }

  return '<p>SVG mode demo.</p>';
}

const app = queryRequiredElement<HTMLDivElement>('#app');

app.innerHTML = `
  <main class="fx-demo-shell">
    <header class="fx-demo-header">
      <h1>Tiptap + FormulaX</h1>
      <p>Switch Tiptap version and FormulaX output mode from the same demo toolbar, then rebuild the editor with the current settings.</p>
    </header>

    <section class="fx-demo-config" aria-label="Tiptap demo configuration">
      <div class="fx-demo-row">
        <label class="fx-demo-field fx-demo-field--compact">
          <span>Version</span>
          <select id="tiptap-version" aria-label="Tiptap version">
            ${TIPTAP_VERSION_OPTIONS.map((item) => `<option value="${item.value}">${item.label}</option>`).join('')}
          </select>
        </label>

        <p id="demo-status" class="fx-demo-status" role="status" aria-live="polite"></p>
      </div>

      <div class="fx-demo-row">
        <label class="fx-demo-field fx-demo-field--compact">
          <span>Output</span>
          <select id="formulax-output-mode" aria-label="FormulaX output mode">
            <option value="svg">Kity (SVG)</option>
            <option value="image">Image</option>
          </select>
        </label>
      </div>

      <section id="image-config-panel" class="fx-demo-panel" aria-label="Image mode configuration">
        <div class="fx-demo-row">
          <label class="fx-demo-field fx-demo-field--endpoint">
            <span>Upload endpoint</span>
            <input
              id="image-upload-endpoint"
              type="url"
              value="${DEFAULT_UPLOAD_ENDPOINT}"
              spellcheck="false"
              aria-label="Image upload endpoint"
            >
          </label>
        </div>

        <p class="fx-demo-note">
          Use a CORS-enabled upload API. GitHub Pages cannot call your local <code>localhost</code> service directly.
        </p>
      </section>
    </section>

    <div class="fx-demo-actions fx-demo-actions--toolbar">
      <button id="insert-formula" type="button">Open FormulaX</button>
    </div>

    <div id="editor" class="fx-tiptap-host"></div>
  </main>
`;

const versionSelect = queryRequiredElement<HTMLSelectElement>('#tiptap-version');
const outputModeSelect = queryRequiredElement<HTMLSelectElement>('#formulax-output-mode');
const imageConfigPanel = queryRequiredElement<HTMLElement>('#image-config-panel');
const uploadEndpointInput = queryRequiredElement<HTMLInputElement>('#image-upload-endpoint');
const statusElement = queryRequiredElement<HTMLParagraphElement>('#demo-status');
const host = queryRequiredElement<HTMLElement>('#editor');
const button = queryRequiredElement<HTMLButtonElement>('#insert-formula');

let activeEditor: DemoEditor | null = null;
let activeLoadToken = 0;

function getCurrentOutputMode(): FormulaOutputMode {
  return outputModeSelect.value === 'image' ? 'image' : 'svg';
}

function setControlsDisabled(disabled: boolean): void {
  versionSelect.disabled = disabled;
  outputModeSelect.disabled = disabled;
  uploadEndpointInput.disabled = disabled || getCurrentOutputMode() !== 'image';
  button.disabled = disabled || !activeEditor;
}

function setStatus(message: string, tone: 'info' | 'success' | 'error'): void {
  statusElement.textContent = message;
  statusElement.dataset.tone = tone;
  button.title = message;
}

function syncImageConfigVisibility(): void {
  const isImageMode = getCurrentOutputMode() === 'image';
  imageConfigPanel.hidden = !isImageMode;
  uploadEndpointInput.required = isImageMode;
  setControlsDisabled(false);
}

function logEditorSnapshot(reason: 'create' | 'update'): void {
  if (!activeEditor?.getJSON || !activeEditor?.getHTML) {
    return;
  }

  console.log(`[tiptap-demo] ${reason} JSON`, activeEditor.getJSON());
  console.log(`[tiptap-demo] ${reason} HTML`, activeEditor.getHTML());
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
  const outputMode = getCurrentOutputMode();
  const uploadEndpoint = uploadEndpointInput.value.trim();

  if (outputMode === 'image' && !uploadEndpoint) {
    setStatus('Image mode requires an upload endpoint before the editor can be rebuilt.', 'error');
    return;
  }

  setControlsDisabled(true);
  setStatus(`Loading Tiptap ${version}...`, 'info');
  destroyEditor();

  try {
    const runtime = await loadTiptapRuntime(version);
    const formulaXNode = createFormulaXNode(
      runtime.Node,
      outputMode === 'image'
        ? {
            output: 'image',
            image: {
              upload: createDemoImageUpload(() => uploadEndpointInput.value),
            },
          }
        : undefined,
    );

    if (loadToken !== activeLoadToken) {
      return;
    }

    activeEditor = new runtime.Editor({
      element: host,
      extensions: [runtime.StarterKit, formulaXNode],
      content: createInitialTiptapContent(outputMode),
      onCreate: () => {
        logEditorSnapshot('create');
      },
      onUpdate: () => {
        logEditorSnapshot('update');
      },
    });

    setStatus(
      outputMode === 'image'
        ? `Tiptap ${version} · image`
        : `Tiptap ${version} · svg`,
      'success',
    );
  } catch (error) {
    console.error(error);

    if (loadToken !== activeLoadToken) {
      return;
    }

    setStatus(
      error instanceof Error ? error.message : 'Failed to initialize Tiptap demo.',
      'error',
    );
  } finally {
    if (loadToken === activeLoadToken) {
      setControlsDisabled(false);
    }
  }
}

versionSelect.addEventListener('change', () => {
  void initTiptap(versionSelect.value as TiptapDemoVersion);
});

outputModeSelect.addEventListener('change', () => {
  syncImageConfigVisibility();
  void initTiptap(versionSelect.value as TiptapDemoVersion);
});

window.addEventListener('beforeunload', () => {
  destroyEditor();
});

syncImageConfigVisibility();
void initTiptap(versionSelect.value as TiptapDemoVersion);
