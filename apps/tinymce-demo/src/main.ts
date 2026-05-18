import { registerFormulaXTinyMcePlugin } from '@formulaxjs/tinymce';
import {
  loadTinyMceRuntime,
  TINYMCE_VERSION_OPTIONS,
  type TinyMceDemoVersion,
} from './tinymce-loader';
import './style.css';

type FormulaOutputMode = 'svg' | 'image';

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

function createInitialTinyMceHtml(outputMode: FormulaOutputMode): string {
  if (outputMode === 'image') {
    return `
      <p>Image mode demo.</p>
    `;
  }

  return `
    <p>SVG mode demo.</p>
  `;
}

function getDemoEditorHeight(): number {
  const viewportHeight = window.innerHeight || 800;
  return Math.max(240, Math.min(360, viewportHeight - 330));
}

const app = queryRequiredElement<HTMLDivElement>('#app');

app.innerHTML = `
  <main class="fx-demo-shell">
    <header class="fx-demo-header">
      <h1>TinyMCE + FormulaX</h1>
      <p>Switch TinyMCE version and FormulaX output mode from the same demo toolbar, then rebuild the editor with the current settings.</p>
    </header>

    <section class="fx-demo-config" aria-label="TinyMCE demo configuration">
      <div class="fx-demo-row">
        <label class="fx-demo-field fx-demo-field--compact">
          <span>Version</span>
          <select id="tinymce-version" aria-label="TinyMCE version">
            ${TINYMCE_VERSION_OPTIONS.map((item) => `<option value="${item.value}">${item.label}</option>`).join('')}
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

    <textarea id="tiny-host"></textarea>
  </main>
`;

const versionSelect = queryRequiredElement<HTMLSelectElement>('#tinymce-version');
const outputModeSelect = queryRequiredElement<HTMLSelectElement>('#formulax-output-mode');
const imageConfigPanel = queryRequiredElement<HTMLElement>('#image-config-panel');
const uploadEndpointInput = queryRequiredElement<HTMLInputElement>('#image-upload-endpoint');
const statusElement = queryRequiredElement<HTMLParagraphElement>('#demo-status');
const textarea = queryRequiredElement<HTMLTextAreaElement>('#tiny-host');

let activeLoadToken = 0;

function getCurrentOutputMode(): FormulaOutputMode {
  return outputModeSelect.value === 'image' ? 'image' : 'svg';
}

function setControlsDisabled(disabled: boolean): void {
  versionSelect.disabled = disabled;
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

async function initTinyMce(version: TinyMceDemoVersion): Promise<void> {
  const loadToken = ++activeLoadToken;
  const outputMode = getCurrentOutputMode();
  const uploadEndpoint = uploadEndpointInput.value.trim();

  if (outputMode === 'image' && !uploadEndpoint) {
    setStatus('Image mode requires an upload endpoint before the editor can be rebuilt.', 'error');
    return;
  }

  setControlsDisabled(true);
  setStatus(`Loading TinyMCE ${version}...`, 'info');
  textarea.value = createInitialTinyMceHtml(outputMode);

  try {
    const tinymce = await loadTinyMceRuntime(version);
    const pluginName = `formulax_${loadToken}`;
    const buttonName = `formulax_${loadToken}`;
    const menuItemName = `formulax_${loadToken}`;

    registerFormulaXTinyMcePlugin(tinymce, {
      pluginName,
      buttonName,
      menuItemName,
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
    });

    await tinymce.init({
      target: textarea,
      height: getDemoEditorHeight(),
      menubar: false,
      plugins: pluginName,
      toolbar: `undo redo | ${buttonName}`,
      license_key: 'gpl',
      content_style: `
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      `,
    });

    if (loadToken !== activeLoadToken) {
      return;
    }

    setStatus(
      outputMode === 'image'
        ? `TinyMCE ${version} · image`
        : `TinyMCE ${version} · svg`,
      'success',
    );
  } catch (error) {
    console.error(error);

    if (loadToken !== activeLoadToken) {
      return;
    }

    setStatus(
      error instanceof Error ? error.message : 'Failed to initialize TinyMCE demo.',
      'error',
    );
  } finally {
    if (loadToken === activeLoadToken) {
      setControlsDisabled(false);
    }
  }
}

versionSelect.addEventListener('change', () => {
  void initTinyMce(versionSelect.value as TinyMceDemoVersion);
});

outputModeSelect.addEventListener('change', () => {
  syncImageConfigVisibility();
  void initTinyMce(versionSelect.value as TinyMceDemoVersion);
});

syncImageConfigVisibility();
void initTinyMce(versionSelect.value as TinyMceDemoVersion);
