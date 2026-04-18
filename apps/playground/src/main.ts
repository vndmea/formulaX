import { serializeLatex } from '@formulax/core';
import { FormulaEditor } from '@formulax/editor';
import { renderKatex } from '@formulax/renderer-katex';
import { createSymbolCommand, createToolbarActions, renderFormulaPanel, renderToolbar } from '@formulax/ui';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root not found');
}

app.innerHTML = `
  <style>
    .fx-panel { background: white; border-radius: 24px; padding: 20px; box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12); }
    .fx-panel h3 { margin: 0 0 12px; font-size: 14px; color: #1e293b; }
    .fx-symbol-btn { display: inline-flex; align-items: center; justify-content: center; min-width: 36px; height: 36px; padding: 0 10px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; font-size: 18px; font-family: 'Times New Roman', serif; transition: all 0.15s; }
    .fx-symbol-btn:hover { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
    .fx-toolbar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    .fx-toolbar button { padding: 10px 18px; border: 1px solid #e2e8f0; border-radius: 12px; background: white; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.15s; }
    .fx-toolbar button:hover { background: #3b82f6; color: white; border-color: #3b82f6; }
  </style>
  <main style="max-width: 1100px; margin: 0 auto; padding: 32px; font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;">
    <header style="display:flex; justify-content:space-between; align-items:end; gap:24px; margin-bottom:24px;">
      <div>
        <div style="letter-spacing:0.18em; text-transform:uppercase; color:#3b82f6; font-size:12px; font-weight:600;">FormulaX</div>
        <h1 style="margin:8px 0 0; font-size:36px; font-weight:700; color:#1e293b;">Modern Formula Editor</h1>
        <p style="max-width:640px; color:#64748b; font-size:15px;">Phase 1 includes LaTeX import/export, KaTeX rendering, Kity-style interaction, and Tiptap / TinyMCE integration demos</p>
      </div>
      <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe); padding:16px 20px; border-radius:16px; min-width:200px; border:1px solid #bfdbfe;">
        <strong style="color:#1e40af; font-size:13px;">Keyboard Shortcuts</strong>
        <div style="font-size:12px; color:#3b82f6; margin-top:4px;">/ Fraction  ^ Superscript  _ Subscript</div>
        <div style="font-size:12px; color:#3b82f6;">Ctrl+R Square Root  ( Parentheses</div>
      </div>
    </header>
    <section style="display:grid; grid-template-columns: 2fr 1fr; gap:24px;">
      <div style="background:white; border-radius:28px; padding:24px; box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12);">
        <div id="toolbar">${renderToolbar()}</div>
        <div id="editor" data-testid="playground-editor" style="margin-top:16px;"></div>
      </div>
      <aside style="display:flex; flex-direction:column; gap:24px;">
        <section style="background:white; border-radius:24px; padding:20px; box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12);">
          <h2 style="margin-top:0; font-size:16px; color:#1e293b;">LaTeX</h2>
          <pre data-testid="latex-output" style="white-space:pre-wrap; background:#f8fafc; padding:12px; border-radius:8px; font-size:14px;"></pre>
        </section>
        <section style="background:white; border-radius:24px; padding:20px; box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12);">
          <h2 style="margin-top:0; font-size:16px; color:#1e293b;">KaTeX Preview</h2>
          <div id="preview" style="padding:16px; background:#f8fafc; border-radius:8px;"></div>
        </section>
        <section style="background:white; border-radius:24px; padding:20px; box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12);">
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
    return;
  }
  const symbolLatex = target.dataset.latex;
  if (symbolLatex) {
    editor.dispatch(createSymbolCommand(symbolLatex));
  }
});

const panel = document.querySelector('.fx-panel');
panel?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const symbolLatex = target.dataset.latex;
  if (symbolLatex) {
    editor.dispatch(createSymbolCommand(symbolLatex));
  }
});

const initialState = editor.getState();
latexOutput.textContent = serializeLatex(initialState.doc);
preview.innerHTML = renderKatex(initialState.doc);
