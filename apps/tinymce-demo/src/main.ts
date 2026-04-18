import tinymce from 'tinymce';
import { createTinyMceFormulaMarkup } from '@formulax/tinymce';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root not found');
}

app.innerHTML = `
  <main style="max-width: 900px; margin: 0 auto; padding: 32px; font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;">
    <h1>TinyMCE + FormulaX</h1>
    <textarea id="tiny-host"><p>Minimal TinyMCE integration demo for FormulaX.</p></textarea>
    <button id="insert-formula" type="button" style="margin-top:16px;">Insert Formula</button>
  </main>
`;

const textarea = document.querySelector<HTMLTextAreaElement>('#tiny-host');
const button = document.querySelector<HTMLButtonElement>('#insert-formula');

if (!textarea || !button) {
  throw new Error('TinyMCE host missing');
}

tinymce.init({
  target: textarea,
  height: 320,
  menubar: false,
  toolbar: 'undo redo | bold italic',
});

button.addEventListener('click', async () => {
  const editor = tinymce.activeEditor;
  if (!editor) return;
  editor.insertContent(createTinyMceFormulaMarkup('\\sqrt{x}'));
});
