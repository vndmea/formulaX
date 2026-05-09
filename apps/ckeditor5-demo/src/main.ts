import {
  Bold,
  ClassicEditor,
  Essentials,
  Italic,
  Paragraph,
  Undo,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import '../../../packages/kity-assets/public/assets/styles/base.css';
import '../../../packages/kity-assets/public/assets/styles/ui.css';
import '../../../packages/kity-assets/public/assets/styles/scrollbar.css';

import { FormulaX } from '@formulax/ckeditor5';
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
      <h1>CKEditor 5 + FormulaX</h1>
      <p>Minimal CKEditor 5 plugin integration demo. Click the FormulaX toolbar button to insert a formula.</p>
    </header>

    <div id="ckeditor-host">
      <p>Click the <strong>FormulaX</strong> toolbar button to insert a formula.</p>
    </div>
  </main>
`;

const host = queryRequiredElement<HTMLElement>('#ckeditor-host');

void ClassicEditor
  .create(host, {
    licenseKey: 'GPL',
    plugins: [
      Essentials,
      Paragraph,
      Bold,
      Italic,
      Undo,
      FormulaX,
    ],
    toolbar: [
      'undo',
      'redo',
      '|',
      'bold',
      'italic',
      '|',
      'formulaX',
    ],
    formulaX: {
      toolbarText: 'FormulaX',
      tooltip: 'Insert or edit formula',
      modal: {
        title: 'FormulaX Editor',
      },
      editor: {
        render: {
          fontsize: 40,
        },
      },
    },
  } as any)
  .catch((error) => {
    console.error(error);
  });
