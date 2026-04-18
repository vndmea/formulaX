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
    <p>最小宿主接入示例，公式节点通过扩展挂接。</p>
    <div id="editor" style="border:1px solid #cbd5e1; border-radius:16px; padding:16px; min-height:160px;"></div>
    <button id="insert-formula" type="button" style="margin-top:16px;">插入公式节点</button>
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
  content: '<p>宿主编辑器中可嵌入 FormulaX 原子节点。</p>',
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
