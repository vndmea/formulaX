import { registerFormulaXTinyMcePlugin } from '@formulaxjs/tinymce';
import {
  loadTinyMceRuntime,
  TINYMCE_VERSION_OPTIONS,
  type TinyMceDemoVersion,
} from './tinymce-loader';
import './style.css';

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
      <h1>TinyMCE + FormulaX</h1>
      <p>Minimal TinyMCE plugin integration demo. Choose a TinyMCE major version and click the FormulaX toolbar button.</p>
    </header>

    <select id="tinymce-version" aria-label="TinyMCE version">
      ${TINYMCE_VERSION_OPTIONS.map((item) => `<option value="${item.value}">${item.label}</option>`).join('')}
    </select>

    <textarea id="tiny-host">
      <p>Click the <strong>FormulaX</strong> toolbar button to insert a formula.</p>
    </textarea>
  </main>
`;

const versionSelect = queryRequiredElement<HTMLSelectElement>('#tinymce-version');
const textarea = queryRequiredElement<HTMLTextAreaElement>('#tiny-host');

async function initTinyMce(version: TinyMceDemoVersion): Promise<void> {
  versionSelect.disabled = true;

  try {
    const tinymce = await loadTinyMceRuntime(version);

    registerFormulaXTinyMcePlugin(tinymce, {
      tooltip: 'Insert or edit formula',
      modal: {
        title: 'FormulaX Editor',
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
  } catch (error) {
    console.error(error);
  } finally {
    versionSelect.disabled = false;
  }
}

versionSelect.addEventListener('change', () => {
  void initTinyMce(versionSelect.value as TinyMceDemoVersion);
});

void initTinyMce(versionSelect.value as TinyMceDemoVersion);
