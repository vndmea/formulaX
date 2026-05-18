import {
  ClassicEditor,
  Essentials,
  Paragraph,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

import { FormulaX } from '@formulaxjs/ckeditor5';
import './style.css';

type FormulaOutputMode = 'svg' | 'image';

type DemoEditor = {
  destroy: () => Promise<void>;
  getData?: () => string;
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

function createInitialHostMarkup(outputMode: FormulaOutputMode): string {
  if (outputMode === 'image') {
    return '<div id="ckeditor-host"><p>Image mode demo.</p></div>';
  }

  return '<div id="ckeditor-host"><p>SVG mode demo.</p></div>';
}

const app = queryRequiredElement<HTMLDivElement>('#app');

app.innerHTML = `
  <main class="fx-demo-shell">
    <header class="fx-demo-header">
      <h1>CKEditor 5 + FormulaX</h1>
      <p>Switch FormulaX output mode for the same CKEditor 5 demo and rebuild the editor with the current settings.</p>
    </header>

    <section class="fx-demo-config" aria-label="CKEditor 5 demo configuration">
      <div class="fx-demo-row">
        <label class="fx-demo-field fx-demo-field--compact">
          <span>Output</span>
          <select id="formulax-output-mode" aria-label="FormulaX output mode">
            <option value="svg">Kity (SVG)</option>
            <option value="image">Image</option>
          </select>
        </label>

        <p id="demo-status" class="fx-demo-status" role="status" aria-live="polite"></p>
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

    <div id="ckeditor-stage"></div>
  </main>
`;

const outputModeSelect = queryRequiredElement<HTMLSelectElement>('#formulax-output-mode');
const imageConfigPanel = queryRequiredElement<HTMLElement>('#image-config-panel');
const uploadEndpointInput = queryRequiredElement<HTMLInputElement>('#image-upload-endpoint');
const statusElement = queryRequiredElement<HTMLParagraphElement>('#demo-status');
const stage = queryRequiredElement<HTMLDivElement>('#ckeditor-stage');

let activeEditor: DemoEditor | null = null;
let activeLoadToken = 0;

function getCurrentOutputMode(): FormulaOutputMode {
  return outputModeSelect.value === 'image' ? 'image' : 'svg';
}

function setControlsDisabled(disabled: boolean): void {
  outputModeSelect.disabled = disabled;
  uploadEndpointInput.disabled = disabled || getCurrentOutputMode() !== 'image';
}

function setStatus(message: string, tone: 'info' | 'success' | 'error'): void {
  statusElement.textContent = message;
  statusElement.dataset.tone = tone;
}

function syncImageConfigVisibility(): void {
  const isImageMode = getCurrentOutputMode() === 'image';
  imageConfigPanel.hidden = !isImageMode;
  uploadEndpointInput.required = isImageMode;
  setControlsDisabled(false);
}

function createHostElement(outputMode: FormulaOutputMode): HTMLElement {
  stage.innerHTML = createInitialHostMarkup(outputMode);
  return queryRequiredElement<HTMLElement>('#ckeditor-host');
}

async function destroyEditor(): Promise<void> {
  const editor = activeEditor;
  activeEditor = null;

  if (!editor) {
    return;
  }

  await editor.destroy();
}

async function initCkeditor(): Promise<void> {
  const loadToken = ++activeLoadToken;
  const outputMode = getCurrentOutputMode();
  const uploadEndpoint = uploadEndpointInput.value.trim();

  if (outputMode === 'image' && !uploadEndpoint) {
    setStatus('Image mode requires an upload endpoint before the editor can be rebuilt.', 'error');
    return;
  }

  setControlsDisabled(true);
  setStatus('Loading CKEditor 5...', 'info');
  await destroyEditor();

  try {
    const host = createHostElement(outputMode);
    const editor = await ClassicEditor.create(host, {
      licenseKey: 'GPL',
      plugins: [
        Essentials,
        Paragraph,
        FormulaX,
      ],
      toolbar: ['formulaX'],
      formulaX: {
        toolbarText: 'FormulaX',
        tooltip: 'Insert or edit formula',
        output: outputMode,
        image: outputMode === 'image'
          ? {
              upload: createDemoImageUpload(() => uploadEndpointInput.value),
            }
          : undefined,
        modal: {
          title: 'FormulaX Editor',
        },
        editor: {
          render: {
            fontsize: 40,
          },
        },
      },
    } as any);

    if (loadToken !== activeLoadToken) {
      await editor.destroy();
      return;
    }

    activeEditor = editor as DemoEditor;

    console.log('[ckeditor5-demo] data', activeEditor.getData?.());
    setStatus(outputMode === 'image' ? 'CKEditor 5 · image' : 'CKEditor 5 · svg', 'success');
  } catch (error) {
    console.error(error);

    if (loadToken !== activeLoadToken) {
      return;
    }

    setStatus(
      error instanceof Error ? error.message : 'Failed to initialize CKEditor 5 demo.',
      'error',
    );
  } finally {
    if (loadToken === activeLoadToken) {
      setControlsDisabled(false);
    }
  }
}

outputModeSelect.addEventListener('change', () => {
  syncImageConfigVisibility();
  void initCkeditor();
});

window.addEventListener('beforeunload', () => {
  void destroyEditor();
});

syncImageConfigVisibility();
void initCkeditor();
