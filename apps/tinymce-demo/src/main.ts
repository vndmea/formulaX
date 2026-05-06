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
  margin-bottom: 6px;
}

.fx-demo-header h1 {
  margin: 0 0 8px;
}

.fx-demo-header p {
  margin: 0;
  color: #4b5563;
}

#tinymce-version {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  min-width: 180px;
  margin: 0 0 4px;
  display: block;
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
    </header>

    <select id="tinymce-version" aria-label="TinyMCE version">
      ${TINYMCE_VERSION_OPTIONS.map((item) => `<option value="${item.value}">${item.label}</option>`).join('')}
    </select>

    <textarea id="tiny-host">
      <p>Click the <strong>FormulaX</strong> toolbar button to insert a formula.</p>
    </textarea>
  </main>
`;

const versionSelect = document.querySelector<HTMLSelectElement>('#tinymce-version');
const textarea = document.querySelector<HTMLTextAreaElement>('#tiny-host');

if (!versionSelect || !textarea) {
  throw new Error('TinyMCE demo DOM missing');
}

const versionControl = versionSelect;

async function initTinyMce(version: TinyMceDemoVersion): Promise<void> {
  versionControl.disabled = true;

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

  versionControl.disabled = false;
}

versionSelect.addEventListener('change', () => {
  void initTinyMce(versionSelect.value as TinyMceDemoVersion).catch((error) => {
    console.error(error);
    versionControl.disabled = false;
  });
});

void initTinyMce(versionSelect.value as TinyMceDemoVersion).catch((error) => {
  console.error(error);
  versionControl.disabled = false;
});
