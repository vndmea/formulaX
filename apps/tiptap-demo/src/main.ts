import StarterKit from '@tiptap/starter-kit';
import { Editor } from '@tiptap/core';
import { FormulaXNode } from '@formulax/tiptap';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root not found');
}

app.innerHTML = `
  <main style="max-width: 900px; margin: 0 auto; padding: 32px; font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;">
    <h1>Tiptap + FormulaX</h1>
    <p>Minimal host integration demo showing FormulaX as a Tiptap node extension.</p>
    <div id="editor"></div>
    <button id="insert-formula" type="button" style="margin-top:16px;">Insert Formula Node</button>
  </main>
`;

const host = document.querySelector<HTMLElement>('#editor');
const button = document.querySelector<HTMLButtonElement>('#insert-formula');

if (!host || !button) {
  throw new Error('Demo host missing');
}

const editor = new Editor({
  element: host,
  extensions: [StarterKit, FormulaXNode],
  content: '<p>FormulaX atomic nodes can be embedded in the host editor.</p>',
});

button.addEventListener('click', () => {
  editor
    .chain()
    .focus()
    .insertContent({
      type: 'formulaX',
      attrs: { latex: '\\frac{a}{b}' },
    })
    .run();
});
