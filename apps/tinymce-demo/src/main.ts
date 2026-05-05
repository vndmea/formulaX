import { registerFormulaXTinyMcePlugin } from '@formulax/tinymce';
import {
  loadTinyMceRuntime,
  TINYMCE_VERSION_OPTIONS,
  type TinyMceDemoVersion,
} from './tinymce-loader';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root not found');
}

const style = document.createElement('style');
style.textContent = `
.fx-demo-shell {
  max-width: 980px;
  margin: 0 auto;
  padding: 32px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.fx-demo-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.fx-demo-header h1 {
  margin: 0 0 8px;
}

.fx-demo-header p {
  margin: 0;
  color: #4b5563;
}

.fx-demo-version {
  display: grid;
  gap: 6px;
  min-width: 200px;
}

.fx-demo-version span {
  font-size: 13px;
  color: #4b5563;
}

.fx-demo-version select {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

.fx-demo-status {
  color: #4b5563;
  font-size: 14px;
}
`;
document.head.appendChild(style);

app.innerHTML = `
  <main class="fx-demo-shell">
    <header class="fx-demo-header">
      <div>
        <h1>TinyMCE + FormulaX</h1>
        <p>Minimal TinyMCE plugin integration demo. Choose a TinyMCE major version and click the FormulaX toolbar button.</p>
      </div>

      <label class="fx-demo-version">
        <span>TinyMCE version</span>
        <select id="tinymce-version">
          ${TINYMCE_VERSION_OPTIONS.map((item) => `<option value="${item.value}">${item.label}</option>`).join('')}
        </select>
      </label>
    </header>

    <p id="tinymce-status" class="fx-demo-status">Loading TinyMCE...</p>

    <textarea id="tiny-host">
      <p>Click the <strong>FormulaX</strong> toolbar button to insert a formula.</p>
    </textarea>
  </main>
`;

const versionSelect = document.querySelector<HTMLSelectElement>('#tinymce-version');
const status = document.querySelector<HTMLElement>('#tinymce-status');
const textarea = document.querySelector<HTMLTextAreaElement>('#tiny-host');

if (!versionSelect || !status || !textarea) {
  throw new Error('TinyMCE demo DOM missing');
}

async function initTinyMce(version: TinyMceDemoVersion): Promise<void> {
  status!.textContent = `Loading TinyMCE ${version}...`;

  const tinymce = await loadTinyMceRuntime(version);

  registerFormulaXTinyMcePlugin(tinymce, {
    toolbarText: 'FormulaX',
    tooltip: 'Insert or edit formula',
    modal: {
      title: 'FormulaX Editor',
    },
    editor: {
      mode: 'kity',
      height: '100%',
      autofocus: true,
      render: { fontsize: 40 },
    },
  });

  await tinymce.init({
    target: textarea,
    height: 420,
    menubar: false,
    plugins: 'formulax',
    toolbar: 'undo redo | formulax',
    license_key: 'gpl',
    content_style: `
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    `,
  });

  const major = tinymce.majorVersion ?? version;
  status!.textContent = `Loaded TinyMCE ${major}.`;
}

versionSelect.addEventListener('change', () => {
  void initTinyMce(versionSelect.value as TinyMceDemoVersion).catch((error) => {
    console.error(error);
    status.textContent = error instanceof Error ? error.message : String(error);
  });
});

void initTinyMce(versionSelect.value as TinyMceDemoVersion).catch((error) => {
  console.error(error);
  status.textContent = error instanceof Error ? error.message : String(error);
});
