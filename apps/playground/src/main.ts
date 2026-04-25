import { FormulaEditor } from '@formulax/editor';
import { RIBBON_PANELS, createSymbolCommand, createToolbarActions } from '@formulax/ui';

const app = document.querySelector<HTMLDivElement>('#app');
const locale = 'en' as const;

if (!app) {
  throw new Error('App root not found');
}

const panels = RIBBON_PANELS(locale);

app.innerHTML = `
  <style>
    :root {
      --fx-ink: #2f2c28;
      --fx-border: #d8d4c7;
      --fx-toolbar-bg: #f6f5ee;
      --fx-green-soft: #e6fae7;
      --fx-shadow: 0 16px 40px rgba(49, 43, 31, 0.1);
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      min-height: 100%;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.52), rgba(241, 239, 230, 0.92)),
        radial-gradient(circle at top, rgba(201, 224, 188, 0.55), transparent 36%);
      color: var(--fx-ink);
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    }

    button,
    input,
    textarea,
    select {
      font: inherit;
    }

    .fx-page {
      min-height: 100vh;
      padding: 20px 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .fx-kf-editor-frame {
      width: min(1120px, 100%);
      border: 1px solid var(--fx-border);
      background: var(--fx-toolbar-bg);
      box-shadow: var(--fx-shadow);
      overflow: hidden;
    }

    .fx-kf-toolbar {
      border-bottom: 1px solid #cdc8ba;
      background: var(--fx-toolbar-bg);
    }

    .fx-kf-toolbar-nav {
      display: flex;
      gap: 2px;
      padding: 8px 10px 0;
      border-bottom: 1px solid #ddd8c8;
      overflow-x: auto;
    }

    .fx-kf-toolbar-tab {
      padding: 9px 14px 10px;
      border: 1px solid transparent;
      border-bottom: 0;
      border-radius: 4px 4px 0 0;
      background: transparent;
      color: #5c564d;
      cursor: pointer;
      white-space: nowrap;
    }

    .fx-kf-toolbar-tab.is-active {
      background: #fffefb;
      border-color: #d6d0c1;
      color: #2e2b27;
    }

    .fx-kf-toolbar-panels {
      padding: 10px;
    }

    .fx-kf-toolbar-panel[hidden] {
      display: none;
    }

    .fx-kf-toolbar-strip {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .fx-kf-toolbar-group {
      flex: 0 0 auto;
      min-width: 208px;
      background: #fff;
      border: 1px solid #ddd8c8;
      border-radius: 4px;
      padding: 8px 8px 6px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
    }

    .fx-kf-toolbar-group--wide {
      min-width: 372px;
    }

    .fx-kf-toolbar-group-title {
      margin: 8px 2px 0;
      text-align: center;
      color: #7b756b;
      font-size: 11px;
      letter-spacing: 0.08em;
    }

    .fx-kf-toolbar-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(54px, 1fr));
      gap: 6px;
    }

    .fx-kf-toolbar-group--wide .fx-kf-toolbar-grid {
      grid-template-columns: repeat(5, minmax(54px, 1fr));
    }

    .fx-kf-tool {
      min-width: 0;
      min-height: 76px;
      border: 1px solid transparent;
      border-radius: 3px;
      background: transparent;
      display: grid;
      align-content: start;
      justify-items: center;
      gap: 6px;
      padding: 8px 4px 6px;
      cursor: pointer;
      color: var(--fx-ink);
      transition: background 0.14s ease, border-color 0.14s ease, transform 0.14s ease;
    }

    .fx-kf-tool:hover,
    .fx-kf-tool:focus-visible {
      border-color: #99c99b;
      background: var(--fx-green-soft);
      transform: translateY(-1px);
      outline: none;
    }

    .fx-kf-tool[data-disabled='true'] {
      cursor: default;
      opacity: 0.45;
    }

    .fx-kf-tool[data-disabled='true']:hover,
    .fx-kf-tool[data-disabled='true']:focus-visible {
      transform: none;
      border-color: transparent;
      background: transparent;
    }

    .fx-kf-tool-icon {
      min-height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: Cambria, 'Times New Roman', serif;
      font-size: 26px;
      line-height: 1;
      color: #2f2c28;
    }

    .fx-kf-tool-label {
      text-align: center;
      font-size: 12px;
      line-height: 1.2;
    }

    .fx-kf-canvas {
      min-height: 520px;
      padding: 16px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(245, 242, 233, 0.92)),
        repeating-linear-gradient(180deg, transparent, transparent 31px, rgba(194, 188, 172, 0.22) 31px, rgba(194, 188, 172, 0.22) 32px);
    }

    #editor {
      min-width: 0;
      width: 100%;
    }

    @media (max-width: 640px) {
      .fx-page {
        padding: 8px;
      }

      .fx-kf-toolbar-group {
        min-width: 184px;
      }

      .fx-kf-toolbar-group--wide {
        min-width: 312px;
      }

      .fx-kf-toolbar-grid {
        grid-template-columns: repeat(2, minmax(54px, 1fr));
      }

      .fx-kf-toolbar-group--wide .fx-kf-toolbar-grid {
        grid-template-columns: repeat(4, minmax(54px, 1fr));
      }
    }
  </style>
  <main class="fx-page">
    <section class="fx-kf-editor-frame">
      <div class="fx-kf-toolbar">
        <div class="fx-kf-toolbar-nav">
          ${panels
            .map(
              (panel, index) => `
                <button
                  type="button"
                  class="fx-kf-toolbar-tab${index === 0 ? ' is-active' : ''}"
                  data-panel-target="${panel.id}"
                >
                  ${panel.label}
                </button>
              `,
            )
            .join('')}
        </div>

        <div class="fx-kf-toolbar-panels">
          ${panels
            .map(
              (panel, index) => `
                <div class="fx-kf-toolbar-panel" data-panel-id="${panel.id}" ${index === 0 ? '' : 'hidden'}>
                  <div class="fx-kf-toolbar-strip">
                    ${panel.groups
                      .map((group) => {
                        const groupClass = group.items.length > 9 ? ' fx-kf-toolbar-group--wide' : '';
                        return `
                          <section class="fx-kf-toolbar-group${groupClass}">
                            <div class="fx-kf-toolbar-grid">
                              ${group.items
                                .map((item) => {
                                  const attributes = item.command
                                    ? `data-command="${item.command}"`
                                    : item.latex
                                      ? `data-latex="${item.latex}"`
                                      : 'data-disabled="true"';

                                  return `
                                    <button type="button" class="fx-kf-tool" ${attributes} title="${item.label}" aria-label="${item.label}">
                                      <span class="fx-kf-tool-icon" aria-hidden="true">${item.icon ?? item.preview}</span>
                                      <span class="fx-kf-tool-label">${item.label}</span>
                                    </button>
                                  `;
                                })
                                .join('')}
                            </div>
                            <div class="fx-kf-toolbar-group-title">${group.title}</div>
                          </section>
                        `;
                      })
                      .join('')}
                  </div>
                </div>
              `,
            )
            .join('')}
        </div>
      </div>

      <div class="fx-kf-canvas">
        <div id="editor" data-testid="playground-editor"></div>
      </div>
    </section>
  </main>
`;

const editorHost = document.querySelector<HTMLElement>('#editor');

if (!editorHost) {
  throw new Error('Playground elements missing');
}

const editor = new FormulaEditor({
  root: editorHost,
  locale,
});

const actions = createToolbarActions(locale);
const panelTabs = Array.from(document.querySelectorAll<HTMLElement>('.fx-kf-toolbar-tab[data-panel-target]'));
const toolbarPanels = Array.from(document.querySelectorAll<HTMLElement>('.fx-kf-toolbar-panel[data-panel-id]'));

const setActivePanel = (panelId: string) => {
  panelTabs.forEach((tab) => {
    const isActive = tab.dataset.panelTarget === panelId;
    tab.classList.toggle('is-active', isActive);
  });

  toolbarPanels.forEach((panel) => {
    panel.hidden = panel.dataset.panelId !== panelId;
  });
};

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;

  const panelTab = target.closest<HTMLElement>('.fx-kf-toolbar-tab[data-panel-target]');
  if (panelTab?.dataset.panelTarget) {
    setActivePanel(panelTab.dataset.panelTarget);
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

setActivePanel(panels[0]?.id ?? 'structures');
