import { serializeLatex } from '@formulax/core';
import { FormulaEditor } from '@formulax/editor';
import { createSymbolCommand, createToolbarActions, renderToolbar } from '@formulax/ui';

const app = document.querySelector<HTMLDivElement>('#app');
const locale = 'en' as const;

if (!app) {
  throw new Error('App root not found');
}

app.innerHTML = `
  <style>
    :root {
      --fx-bg: #f3f5f8;
      --fx-panel: #ffffff;
      --fx-border: #d9dde5;
      --fx-border-strong: #c3c9d4;
      --fx-text: #18212f;
      --fx-muted: #657083;
      --fx-accent: #14979b;
      --fx-accent-soft: #e8f6f6;
      --fx-shadow: 0 16px 50px rgba(15, 23, 42, 0.08);
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      min-width: 0;
      min-height: 100%;
      overflow: hidden;
      background:
        radial-gradient(circle at top left, rgba(20, 151, 155, 0.12), transparent 28%),
        linear-gradient(180deg, #f9fafb 0%, var(--fx-bg) 100%);
      color: var(--fx-text);
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    }

    button,
    input,
    textarea,
    select {
      font: inherit;
    }

    code {
      padding: 1px 6px;
      border-radius: 999px;
      background: rgba(15, 140, 144, 0.08);
      font-size: 12px;
      color: #0f6f73;
    }

    .fx-shell {
      width: min(1360px, 100%);
      margin: 0 auto;
      min-height: 100vh;
      padding: 14px 16px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .fx-page-header {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: end;
    }

    .fx-page-header-copy {
      min-width: 0;
      flex: 1 1 auto;
    }

    .fx-page-kicker {
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #0e7f84;
      font-size: 11px;
      font-weight: 700;
    }

    .fx-page-header h1 {
      margin: 4px 0 0;
      font-size: clamp(24px, 3.2vw, 30px);
      line-height: 1.05;
    }

    .fx-page-header p {
      margin: 6px 0 0;
      max-width: 720px;
      color: var(--fx-muted);
      font-size: 13px;
      line-height: 1.45;
    }

    .fx-ribbon {
      border: 1px solid var(--fx-border-strong);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.96);
      box-shadow: var(--fx-shadow);
      overflow: hidden;
      flex: 0 0 auto;
    }

    .fx-ribbon-topbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border-bottom: 1px solid #e6e9ef;
      background: linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%);
    }

    .fx-ribbon-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      min-width: 0;
    }

    .fx-ribbon-tab {
      min-height: 32px;
      padding: 0 14px;
      border: 1px solid transparent;
      border-radius: 999px;
      background: transparent;
      color: #536073;
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
    }

    .fx-ribbon-tab.is-active {
      border-color: #cde9e8;
      background: var(--fx-accent-soft);
      color: #0b7377;
      font-weight: 700;
    }

    .fx-ribbon-note {
      margin-left: auto;
      font-size: 12px;
      color: #7b8595;
      text-align: right;
      max-width: 360px;
    }

    .fx-toolbar.fx-ribbon-groups {
      display: flex;
      gap: 0;
      overflow-x: auto;
      overflow-y: hidden;
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
    }

    .fx-toolbar.fx-ribbon-groups[hidden] {
      display: none;
    }

    .fx-ribbon-group {
      flex: 0 0 212px;
      min-width: 212px;
      padding: 8px 10px 6px;
      border-right: 1px solid #e8ebf0;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 249, 252, 0.98));
    }

    .fx-ribbon-group:last-child {
      border-right: none;
    }

    .fx-ribbon-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
      min-height: 94px;
    }

    .fx-ribbon-tile {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      aspect-ratio: 1.24;
      min-height: 44px;
      min-width: 0;
      border: 1px solid #dde3eb;
      border-radius: 8px;
      background: white;
      padding: 6px;
      cursor: pointer;
      transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
    }

    .fx-ribbon-tile:hover,
    .fx-ribbon-tile:focus-visible {
      transform: translateY(-1px);
      border-color: #9dd6d5;
      box-shadow: 0 10px 18px rgba(20, 151, 155, 0.1);
    }

    .fx-ribbon-tile:focus-visible {
      outline: 2px solid rgba(20, 151, 155, 0.34);
      outline-offset: 2px;
    }

    .fx-ribbon-tile[data-disabled='true'] {
      cursor: default;
      opacity: 0.72;
      background: linear-gradient(180deg, #fffef7, #f8f8f6);
    }

    .fx-ribbon-preview {
      font-family: Cambria, 'Times New Roman', serif;
      font-size: 25px;
      line-height: 1;
      color: #10223b;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fx-ribbon-label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .fx-ribbon-group-title {
      margin-top: 6px;
      text-align: center;
      font-size: 10px;
      letter-spacing: 0.08em;
      color: #708094;
    }

    .fx-ribbon-group--teal .fx-ribbon-group-title { color: #0d7479; }
    .fx-ribbon-group--gold .fx-ribbon-group-title { color: #996a18; }
    .fx-ribbon-group--green .fx-ribbon-group-title { color: #377054; }
    .fx-ribbon-group--red .fx-ribbon-group-title { color: #9a4450; }
    .fx-ribbon-group--blue .fx-ribbon-group-title { color: #3a5d99; }

    .fx-workbench {
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      gap: 12px;
      min-height: 0;
      flex: 1 1 auto;
    }

    .fx-stage,
    .fx-panel {
      background: var(--fx-panel);
      border: 1px solid var(--fx-border);
      border-radius: 24px;
      box-shadow: var(--fx-shadow);
      min-width: 0;
    }

    .fx-stage {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .fx-stage-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 14px;
      border-bottom: 1px solid #e7eaf0;
      background: linear-gradient(180deg, #fcfdfd, #f5f7fa);
    }

    .fx-stage-title {
      font-size: 14px;
      font-weight: 700;
    }

    .fx-stage-subtitle {
      font-size: 11px;
      color: var(--fx-muted);
      margin-top: 3px;
      max-width: 760px;
    }

    .fx-stage-pills {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .fx-stage-pill {
      padding: 5px 9px;
      border-radius: 999px;
      border: 1px solid #dbe0e8;
      background: #f7f9fc;
      font-size: 11px;
      color: #526072;
      white-space: nowrap;
    }

    .fx-stage-editor {
      padding: 14px;
      min-height: 0;
      overflow: auto;
      flex: 1 1 auto;
      background:
        linear-gradient(180deg, rgba(244, 248, 250, 0.9), rgba(255, 255, 255, 0.98)),
        repeating-linear-gradient(180deg, transparent 0 31px, rgba(203, 213, 225, 0.2) 31px 32px);
    }

    #editor {
      min-width: 0;
      max-width: 100%;
    }

    .fx-panel {
      padding: 12px 14px;
    }

    .fx-metric-panel {
      display: grid;
      gap: 8px;
      margin-top: 0;
    }

    .fx-output-box {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      background: #f6f8fb;
      border: 1px solid #e2e8f0;
      padding: 12px;
      border-radius: 12px;
      font-size: 13px;
      min-height: 64px;
      max-height: 104px;
      min-width: 0;
      overflow: auto;
    }

    @media (max-width: 1080px) {
      .fx-page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .fx-stage-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .fx-stage-pills {
        justify-content: flex-start;
      }
    }

    @media (max-width: 760px) {
      .fx-shell {
        min-height: auto;
        padding: 10px;
        gap: 10px;
      }

      .fx-ribbon-topbar {
        flex-direction: column;
        align-items: flex-start;
      }

      .fx-ribbon-note {
        margin-left: 0;
        max-width: none;
        text-align: left;
      }

      .fx-ribbon-group {
        flex-basis: 190px;
        min-width: 190px;
      }

      html,
      body {
        overflow: auto;
      }
    }
  </style>
  <main class="fx-shell">
    <header class="fx-page-header">
      <div class="fx-page-header-copy">
        <div class="fx-page-kicker">FormulaX</div>
        <h1>WPS-Inspired Formula Workspace</h1>
        <p>
          A compact SDK demo with a ribbon-style formula surface, one editing workspace, and direct LaTeX output.
        </p>
      </div>
    </header>
    <section id="toolbar">${renderToolbar(locale)}</section>
    <section class="fx-workbench">
      <div class="fx-stage">
        <div class="fx-stage-header">
          <div>
            <div class="fx-stage-title">Editor Workspace</div>
            <div class="fx-stage-subtitle">
              Playground stays minimal here: ribbon interactions feed the editor, and the result is mirrored as LaTeX below.
            </div>
          </div>
          <div class="fx-stage-pills">
            <div class="fx-stage-pill">SDK-first</div>
            <div class="fx-stage-pill">Ribbon shell</div>
            <div class="fx-stage-pill">Package-ready</div>
          </div>
        </div>
        <div class="fx-stage-editor">
          <div id="editor" data-testid="playground-editor"></div>
        </div>
      </div>
      <section class="fx-panel fx-metric-panel">
        <h2 style="margin:0; font-size:16px;">LaTeX</h2>
        <pre data-testid="latex-output" class="fx-output-box"></pre>
      </section>
    </section>
  </main>
`;

const editorHost = document.querySelector<HTMLElement>('#editor');
const latexOutput = document.querySelector<HTMLElement>('[data-testid="latex-output"]');
const toolbar = document.querySelector<HTMLElement>('#toolbar');

if (!editorHost || !latexOutput || !toolbar) {
  throw new Error('Playground elements missing');
}

const editor = new FormulaEditor({
  root: editorHost,
  locale,
  onChange: (state) => {
    const latex = serializeLatex(state.doc);
    latexOutput.textContent = latex;
  },
});

const actions = createToolbarActions(locale);
const ribbon = toolbar.querySelector<HTMLElement>('[data-role="formula-ribbon"]');
const ribbonTabs = Array.from(toolbar.querySelectorAll<HTMLElement>('.fx-ribbon-tab[data-panel-target]'));
const ribbonPanels = Array.from(toolbar.querySelectorAll<HTMLElement>('.fx-ribbon-groups[data-panel-id]'));

const setActivePanel = (panelId: string) => {
  ribbonTabs.forEach((tab) => {
    const isActive = tab.dataset.panelTarget === panelId;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  ribbonPanels.forEach((panel) => {
    const isActive = panel.dataset.panelId === panelId;
    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;
  });
};

if (ribbonTabs.length > 0 && ribbonPanels.length > 0) {
  setActivePanel(ribbonTabs[0].dataset.panelTarget ?? ribbonPanels[0].dataset.panelId ?? 'structures');
}

toolbar.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const tab = target.closest<HTMLElement>('.fx-ribbon-tab[data-panel-target]');
  if (tab && ribbon?.contains(tab)) {
    const panelId = tab.dataset.panelTarget;
    if (panelId) {
      setActivePanel(panelId);
    }
    return;
  }

  const tile = target.closest<HTMLElement>('[data-command], [data-latex]');
  if (!tile) return;

  const command = tile.dataset.command;
  const action = actions.find((item) => item.id === command);
  if (action) {
    editor.dispatch(action.command);
    return;
  }

  const symbolLatex = tile.dataset.latex;
  if (symbolLatex) {
    editor.dispatch(createSymbolCommand(symbolLatex));
  }
});

const initialState = editor.getState();
latexOutput.textContent = serializeLatex(initialState.doc);
