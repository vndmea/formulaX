import { serializeLatex } from '@formulax/core';
import { FormulaEditor } from '@formulax/editor';
import { renderKatex } from '@formulax/renderer-katex';
import { createToolbarActions, renderFormulaPanel, renderToolbar } from '@formulax/ui';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root not found');
}

app.innerHTML = `
  <main style="max-width: 1100px; margin: 0 auto; padding: 32px; font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;">
    <header style="display:flex; justify-content:space-between; align-items:end; gap:24px; margin-bottom:24px;">
      <div>
        <div style="letter-spacing:0.18em; text-transform:uppercase; color:#475569; font-size:12px;">FormulaX</div>
        <h1 style="margin:8px 0 0; font-size:44px;">Modern Formula Workspace</h1>
        <p style="max-width:640px; color:#334155;">面向 Kity 交互体验的现代公式编辑器骨架，演示 core / editor / KaTeX / UI 协同。</p>
      </div>
      <div style="background:linear-gradient(135deg,#dbeafe,#fef3c7); padding:18px 20px; border-radius:20px; min-width:240px;">
        <strong>快捷键</strong>
        <div>/ 分数</div>
        <div>^ 上标</div>
        <div>_ 下标</div>
        <div>Ctrl + R 根号</div>
      </div>
    </header>
    <section style="display:grid; grid-template-columns: 2fr 1fr; gap:24px;">
      <div style="background:white; border-radius:28px; padding:24px; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);">
        <div id="toolbar">${renderToolbar()}</div>
        <div id="editor" data-testid="playground-editor"></div>
      </div>
      <aside style="display:flex; flex-direction:column; gap:24px;">
        <section style="background:white; border-radius:24px; padding:20px; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);">
          <h2 style="margin-top:0;">LaTeX</h2>
          <pre data-testid="latex-output" style="white-space:pre-wrap;"></pre>
        </section>
        <section style="background:white; border-radius:24px; padding:20px; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);">
          <h2 style="margin-top:0;">KaTeX HTML</h2>
          <div id="preview"></div>
        </section>
        <section style="background:white; border-radius:24px; padding:20px; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);">
          ${renderFormulaPanel()}
        </section>
      </aside>
    </section>
  </main>
`;

const editorHost = document.querySelector<HTMLElement>('#editor');
const latexOutput = document.querySelector<HTMLElement>('[data-testid="latex-output"]');
const preview = document.querySelector<HTMLElement>('#preview');
const toolbar = document.querySelector<HTMLElement>('#toolbar');

if (!editorHost || !latexOutput || !preview || !toolbar) {
  throw new Error('Playground elements missing');
}

const editor = new FormulaEditor({
  root: editorHost,
  onChange: (state) => {
    const latex = serializeLatex(state.doc);
    latexOutput.textContent = latex;
    preview.innerHTML = renderKatex(state.doc);
  },
});

const actions = createToolbarActions();
toolbar.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const command = target.dataset.command;
  const action = actions.find((item) => item.id === command);
  if (action) {
    editor.dispatch(action.command);
  }
});

const initialState = editor.getState();
latexOutput.textContent = serializeLatex(initialState.doc);
preview.innerHTML = renderKatex(initialState.doc);
