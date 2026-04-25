import { FormulaEditor } from '@formulax/editor';
import { RIBBON_GROUPS, createSymbolCommand, createToolbarActions } from '@formulax/ui';

type ToolbarInsert = {
  label: string;
  icon: string;
  command?: string;
  latex?: string;
};

type ToolbarMenu = {
  title: string;
  primary: ToolbarInsert;
  items: ToolbarInsert[];
};

const app = document.querySelector<HTMLDivElement>('#app');
const locale = 'en' as const;

if (!app) {
  throw new Error('App root not found');
}

const groups = RIBBON_GROUPS(locale);
const greekGroup = groups.find((group) => group.title === 'Greek')!;
const operatorsGroup = groups.find((group) => group.title === 'Operators')!;
const relationsGroup = groups.find((group) => group.title === 'Relations')!;
const arrowsGroup = groups.find((group) => group.title === 'Arrows')!;
const miscGroup = groups.find((group) => group.title === 'Misc')!;
const functionsGroup = groups.find((group) => group.title === 'Functions')!;
const templatesGroup = groups.find((group) => group.title === 'Templates')!;

const symbolGroups = [greekGroup, operatorsGroup, relationsGroup, arrowsGroup, miscGroup];

const structureMenus: ToolbarMenu[] = [
  {
    title: 'Fraction',
    primary: { label: 'Fraction', icon: 'x/y', command: 'fraction' },
    items: [
      { label: 'Fraction', icon: 'x/y', command: 'fraction' },
      { label: 'Slash', icon: 'a/b', command: 'fraction' },
    ],
  },
  {
    title: 'Script',
    primary: { label: 'Superscript', icon: 'x²', command: 'sup' },
    items: [
      { label: 'Superscript', icon: 'x²', command: 'sup' },
      { label: 'Subscript', icon: 'xᵢ', command: 'sub' },
    ],
  },
  {
    title: 'Radical',
    primary: { label: 'Radical', icon: '√x', command: 'sqrt' },
    items: [
      { label: 'Square Root', icon: '√x', command: 'sqrt' },
      { label: 'Nth Root', icon: 'ⁿ√x', command: 'sqrt' },
    ],
  },
  {
    title: 'Integral',
    primary: { label: 'Integral', icon: '∫', latex: '\\int' },
    items: [
      { label: 'Integral', icon: '∫', latex: '\\int' },
      { label: 'Contour', icon: '∮', latex: '\\int' },
    ],
  },
  {
    title: 'Large Operator',
    primary: { label: 'Summation', icon: '∑', latex: '\\sum' },
    items: [
      { label: 'Summation', icon: '∑', latex: '\\sum' },
      { label: 'Product', icon: '∏', latex: '\\sum' },
    ],
  },
  {
    title: 'Bracket',
    primary: { label: 'Bracket', icon: '{()}', command: 'fence' },
    items: [
      { label: 'Parentheses', icon: '( )', command: 'fence' },
      { label: 'Braces', icon: '{ }', command: 'fence' },
      { label: 'Brackets', icon: '[ ]', command: 'fence' },
    ],
  },
  {
    title: 'Function',
    primary: { label: 'Sine', icon: 'sin', latex: '\\sin' },
    items: functionsGroup.items.slice(0, 9).map((item) => ({
      label: item.label,
      icon: item.icon ?? item.preview,
      latex: item.latex,
    })),
  },
  {
    title: 'Accent',
    primary: { label: 'Hat', icon: 'x̂', latex: '\\hat' },
    items: [
      { label: 'Hat', icon: 'x̂', latex: '\\hat' },
      { label: 'Bar', icon: 'x̄', latex: '\\bar' },
      { label: 'Dot', icon: 'ẋ', latex: '\\dot' },
    ],
  },
  {
    title: 'Limit and Log',
    primary: { label: 'Limit', icon: 'lim', latex: '\\lim' },
    items: functionsGroup.items.slice(12, 21).map((item) => ({
      label: item.label,
      icon: item.icon ?? item.preview,
      latex: item.latex,
    })),
  },
  {
    title: 'Operator',
    primary: { label: 'Operator', icon: '∑', latex: '\\sum' },
    items: templatesGroup.items.map((item) => ({
      label: item.label,
      icon: item.icon ?? item.preview,
      latex: item.latex,
    })),
  },
  {
    title: 'Matrix',
    primary: { label: 'Matrix', icon: '▣', latex: '\\matrix' },
    items: [
      { label: 'Matrix', icon: '▣', latex: '\\matrix' },
      { label: 'Determinant', icon: '|A|', latex: '\\det' },
      { label: 'Cases', icon: '{:}', command: 'fence' },
    ],
  },
];

const renderInsertButton = (item: ToolbarInsert, className: string): string => {
  const attrs = item.command
    ? `data-command="${item.command}"`
    : item.latex
      ? `data-latex="${item.latex}"`
      : 'data-disabled="true"';

  return `
    <button type="button" class="${className}" ${attrs} title="${item.label}" aria-label="${item.label}">
      <span class="${className}__icon" aria-hidden="true">${item.icon}</span>
      <span class="${className}__label">${item.label}</span>
    </button>
  `;
};

const renderSymbolPanels = (): string =>
  symbolGroups
    .map((group, index) => {
      const visibleItems = group.items.slice(0, 8);
      const moreItems = group.items.slice(8);

      return `
        <div class="fx-word-symbol-panel" data-symbol-panel="${index}" ${index === 0 ? '' : 'hidden'}>
          <div class="fx-word-symbol-grid">
            ${visibleItems
              .map((item) => {
                const attrs = item.latex ? `data-latex="${item.latex}"` : 'data-disabled="true"';
                return `
                  <button type="button" class="fx-word-symbol-item" ${attrs} title="${item.label}" aria-label="${item.label}">
                    <span class="fx-word-symbol-icon" aria-hidden="true">${item.icon ?? item.preview}</span>
                  </button>
                `;
              })
              .join('')}
            ${
              moreItems.length > 0
                ? `
                  <button type="button" class="fx-word-symbol-more" data-symbol-more="${index}" aria-label="${group.title} more">
                    <span class="fx-word-symbol-more__icon" aria-hidden="true">▼</span>
                  </button>
                `
                : ''
            }
          </div>
        </div>
      `;
    })
    .join('');

const renderStructureMenus = (): string =>
  structureMenus
    .map(
      (menu, index) => `
        <div class="fx-word-structure-group">
          ${renderInsertButton(menu.primary, 'fx-word-structure-item')}
          <button type="button" class="fx-word-structure-toggle" data-structure-toggle="${index}" aria-label="${menu.title} menu">▼</button>
          <div class="fx-word-structure-label">${menu.title}</div>
        </div>
      `,
    )
    .join('');

const renderStructurePopups = (): string =>
  structureMenus
    .map(
      (menu, index) => `
        <div class="fx-word-structure-popup" data-structure-popup="${index}" hidden>
          <div class="fx-word-structure-popup-grid">
            ${menu.items.map((item) => renderInsertButton(item, 'fx-word-popup-item')).join('')}
          </div>
        </div>
      `,
    )
    .join('');

const renderSymbolPopups = (): string =>
  symbolGroups
    .map((group, index) => {
      const moreItems = group.items.slice(8);
      return `
        <div class="fx-word-symbol-popup" data-symbol-popup="${index}" hidden>
          <div class="fx-word-symbol-popup-grid">
            ${moreItems
              .map((item) => {
                const attrs = item.latex ? `data-latex="${item.latex}"` : 'data-disabled="true"';
                return `
                  <button type="button" class="fx-word-popup-item" ${attrs} title="${item.label}" aria-label="${item.label}">
                    <span class="fx-word-popup-item__icon" aria-hidden="true">${item.icon ?? item.preview}</span>
                    <span class="fx-word-popup-item__label">${item.label}</span>
                  </button>
                `;
              })
              .join('')}
          </div>
        </div>
      `;
    })
    .join('');

app.innerHTML = `
  <style>
    :root {
      --fx-ribbon-bg: #f3f1ec;
      --fx-ribbon-top: #faf9f6;
      --fx-ribbon-border: #d8d4ca;
      --fx-ribbon-border-strong: #c9c3b5;
      --fx-ribbon-text: #3a372f;
      --fx-ribbon-muted: #70695d;
      --fx-ribbon-hover: #eef7e6;
      --fx-shadow: 0 10px 30px rgba(45, 39, 28, 0.08);
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      min-height: 100%;
      background: #f3f1ec;
      color: var(--fx-ribbon-text);
      font-family: 'Segoe UI', Arial, sans-serif;
    }

    button,
    input,
    textarea,
    select {
      font: inherit;
    }

    .fx-page {
      min-height: 100vh;
      padding: 10px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .fx-word-shell {
      width: min(1600px, 100%);
      border: 1px solid var(--fx-ribbon-border);
      background: white;
      box-shadow: var(--fx-shadow);
      overflow: visible;
    }

    .fx-word-toolbar {
      display: grid;
      grid-template-columns: 110px minmax(0, 1fr) 720px;
      min-height: 130px;
      background: linear-gradient(180deg, var(--fx-ribbon-top), var(--fx-ribbon-bg));
      border-bottom: 1px solid var(--fx-ribbon-border);
      overflow: visible;
    }

    .fx-word-block {
      position: relative;
      min-width: 0;
      padding: 8px 10px 18px;
      border-right: 1px solid var(--fx-ribbon-border);
      overflow: visible;
    }

    .fx-word-block:last-child {
      border-right: 0;
    }

    .fx-word-block-title {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 3px;
      text-align: center;
      font-size: 11px;
      color: var(--fx-ribbon-muted);
    }

    .fx-word-tool-large {
      width: 100%;
      min-height: 84px;
      border: 1px solid transparent;
      background: transparent;
      border-radius: 3px;
      cursor: default;
      display: grid;
      justify-items: center;
      align-content: start;
      gap: 8px;
      padding: 6px 4px;
    }

    .fx-word-tool-large:hover,
    .fx-word-symbol-item:hover,
    .fx-word-symbol-tab:hover,
    .fx-word-structure-item:hover,
    .fx-word-structure-toggle:hover,
    .fx-word-symbol-more:hover,
    .fx-word-popup-item:hover {
      background: var(--fx-ribbon-hover);
      border-color: #bfd8b5;
    }

    .fx-word-tool-large-icon {
      font-size: 44px;
      line-height: 1;
      font-family: Cambria, 'Times New Roman', serif;
    }

    .fx-word-tool-large-label,
    .fx-word-structure-item__label,
    .fx-word-popup-item__label {
      font-size: 11px;
      line-height: 1.15;
      text-align: center;
    }

    .fx-word-symbols {
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr);
      gap: 8px;
      align-items: start;
    }

    .fx-word-symbol-tabs {
      display: grid;
      gap: 4px;
    }

    .fx-word-symbol-tab {
      min-height: 19px;
      border: 1px solid var(--fx-ribbon-border);
      background: #fdfcf9;
      border-radius: 2px;
      color: var(--fx-ribbon-muted);
      cursor: pointer;
      font-size: 10px;
      padding: 0;
    }

    .fx-word-symbol-tab.is-active {
      background: white;
      color: var(--fx-ribbon-text);
      border-color: var(--fx-ribbon-border-strong);
    }

    .fx-word-symbol-panel[hidden] {
      display: none;
    }

    .fx-word-symbol-grid {
      display: grid;
      grid-template-columns: repeat(9, minmax(0, 1fr));
      grid-template-rows: repeat(1, minmax(0, 1fr));
      gap: 4px;
      max-height: 30px;
      overflow: hidden;
    }

    .fx-word-symbol-item,
    .fx-word-symbol-more {
      aspect-ratio: 1 / 1;
      border: 1px solid var(--fx-ribbon-border-strong);
      background: #fff;
      border-radius: 2px;
      padding: 0;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .fx-word-symbol-icon,
    .fx-word-symbol-more__icon {
      font-family: Cambria, 'Times New Roman', serif;
      font-size: 21px;
      line-height: 1;
    }

    .fx-word-structures {
      display: flex;
      gap: 0;
      align-items: flex-start;
      overflow-x: auto;
      overflow-y: visible;
      padding-bottom: 0;
    }

    .fx-word-structure-group {
      position: relative;
      flex: 0 0 auto;
      width: 64px;
      display: grid;
      justify-items: stretch;
      gap: 2px;
      padding: 0 4px;
    }

    .fx-word-structure-item {
      width: 100%;
      min-height: 62px;
      border: 1px solid transparent;
      background: transparent;
      border-radius: 3px;
      display: grid;
      align-content: start;
      justify-items: center;
      gap: 3px;
      padding: 2px 2px 4px;
      cursor: pointer;
    }

    .fx-word-structure-item__icon,
    .fx-word-popup-item__icon {
      min-height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: Cambria, 'Times New Roman', serif;
      font-size: 27px;
      line-height: 1;
      white-space: nowrap;
    }

    .fx-word-structure-toggle {
      min-height: 14px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--fx-ribbon-muted);
      border-radius: 2px;
      cursor: pointer;
      font-size: 10px;
      padding: 0;
    }

    .fx-word-structure-label {
      text-align: center;
      font-size: 11px;
      line-height: 1.1;
      color: var(--fx-ribbon-text);
    }

    .fx-word-flyout-layer {
      position: relative;
      z-index: 40;
    }

    .fx-word-structure-popup,
    .fx-word-symbol-popup {
      position: fixed;
      z-index: 1000;
      border: 1px solid var(--fx-ribbon-border-strong);
      background: white;
      border-radius: 4px;
      box-shadow: 0 14px 28px rgba(45, 39, 28, 0.16);
      padding: 8px;
      min-width: 208px;
    }

    .fx-word-structure-popup-grid,
    .fx-word-symbol-popup-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
    }

    .fx-word-popup-item {
      width: 100%;
      min-height: 64px;
      border: 1px solid var(--fx-ribbon-border);
      background: #fff;
      border-radius: 3px;
      display: grid;
      align-content: start;
      justify-items: center;
      gap: 4px;
      padding: 4px 2px;
      cursor: pointer;
    }

    .fx-word-canvas {
      padding: 16px;
      min-height: 520px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.75), rgba(246, 243, 235, 0.95)),
        repeating-linear-gradient(180deg, transparent, transparent 31px, rgba(194, 188, 172, 0.2) 31px, rgba(194, 188, 172, 0.2) 32px);
    }

    #editor {
      min-width: 0;
      width: 100%;
    }

    @media (max-width: 1500px) {
      .fx-word-toolbar {
        grid-template-columns: 110px minmax(0, 1fr);
      }

      .fx-word-structures-block {
        grid-column: 1 / -1;
        border-right: 0;
        border-top: 1px solid var(--fx-ribbon-border);
      }
    }

    @media (max-width: 980px) {
      .fx-word-toolbar {
        grid-template-columns: 1fr;
      }

      .fx-word-block {
        border-right: 0;
        border-bottom: 1px solid var(--fx-ribbon-border);
      }

      .fx-word-block:last-child {
        border-bottom: 0;
      }

      .fx-word-symbol-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }
  </style>
  <main class="fx-page">
    <section class="fx-word-shell">
      <div class="fx-word-toolbar">
        <section class="fx-word-block">
          <button type="button" class="fx-word-tool-large" data-disabled="true">
            <span class="fx-word-tool-large-icon">π</span>
            <span class="fx-word-tool-large-label">Equation</span>
          </button>
          <div class="fx-word-block-title">Tools</div>
        </section>

        <section class="fx-word-block">
          <div class="fx-word-symbols">
            <div class="fx-word-symbol-tabs">
              ${symbolGroups
                .map(
                  (group, index) => `
                    <button type="button" class="fx-word-symbol-tab${index === 0 ? ' is-active' : ''}" data-symbol-tab="${index}">
                      ${group.title.slice(0, 3)}
                    </button>
                  `,
                )
                .join('')}
            </div>
            <div class="fx-word-symbol-stage">
              ${renderSymbolPanels()}
            </div>
          </div>
          <div class="fx-word-block-title">Symbols</div>
        </section>

        <section class="fx-word-block fx-word-structures-block">
          <div class="fx-word-structures">
            ${renderStructureMenus()}
          </div>
          <div class="fx-word-block-title">Structures</div>
        </section>
      </div>

      <div class="fx-word-flyout-layer">
        ${renderStructurePopups()}
        ${renderSymbolPopups()}
      </div>

      <div class="fx-word-canvas">
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
const symbolTabs = Array.from(document.querySelectorAll<HTMLElement>('.fx-word-symbol-tab[data-symbol-tab]'));
const symbolPanels = Array.from(document.querySelectorAll<HTMLElement>('.fx-word-symbol-panel[data-symbol-panel]'));
const structurePopups = Array.from(document.querySelectorAll<HTMLElement>('.fx-word-structure-popup[data-structure-popup]'));
const symbolPopups = Array.from(document.querySelectorAll<HTMLElement>('.fx-word-symbol-popup[data-symbol-popup]'));

const closeAllPopups = () => {
  structurePopups.forEach((popup) => {
    popup.hidden = true;
  });
  symbolPopups.forEach((popup) => {
    popup.hidden = true;
  });
};

const setPopupPosition = (popup: HTMLElement, anchor: HTMLElement) => {
  const rect = anchor.getBoundingClientRect();
  popup.style.left = `${rect.left}px`;
  popup.style.top = `${rect.bottom + 4}px`;
};

const setActiveSymbolTab = (index: number) => {
  symbolTabs.forEach((tab) => {
    tab.classList.toggle('is-active', Number(tab.dataset.symbolTab) === index);
  });

  symbolPanels.forEach((panel) => {
    panel.hidden = Number(panel.dataset.symbolPanel) !== index;
  });
};

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;

  const structureToggle = target.closest<HTMLElement>('.fx-word-structure-toggle[data-structure-toggle]');
  if (structureToggle?.dataset.structureToggle) {
    const popupId = Number(structureToggle.dataset.structureToggle);
    structurePopups.forEach((popup) => {
      const isTarget = Number(popup.dataset.structurePopup) === popupId;
      if (isTarget) {
        setPopupPosition(popup, structureToggle);
        popup.hidden = !popup.hidden;
      } else {
        popup.hidden = true;
      }
    });
    symbolPopups.forEach((popup) => {
      popup.hidden = true;
    });
    return;
  }

  const symbolMore = target.closest<HTMLElement>('.fx-word-symbol-more[data-symbol-more]');
  if (symbolMore?.dataset.symbolMore) {
    const popupId = Number(symbolMore.dataset.symbolMore);
    symbolPopups.forEach((popup) => {
      const isTarget = Number(popup.dataset.symbolPopup) === popupId;
      if (isTarget) {
        setPopupPosition(popup, symbolMore);
        popup.hidden = !popup.hidden;
      } else {
        popup.hidden = true;
      }
    });
    structurePopups.forEach((popup) => {
      popup.hidden = true;
    });
    return;
  }

  const symbolTab = target.closest<HTMLElement>('.fx-word-symbol-tab[data-symbol-tab]');
  if (symbolTab?.dataset.symbolTab) {
    closeAllPopups();
    setActiveSymbolTab(Number(symbolTab.dataset.symbolTab));
    return;
  }

  const tile = target.closest<HTMLElement>('[data-command], [data-latex]');
  if (tile && tile.dataset.disabled !== 'true') {
    closeAllPopups();
    const command = tile.dataset.command;
    const action = actions.find((item) => item.id === command);
    if (action) {
      editor.dispatch(action.command);
      return;
    }

    const symbolLatex = tile.dataset.latex;
    if (symbolLatex) {
      editor.dispatch(createSymbolCommand(symbolLatex));
      return;
    }
  }

  if (
    !target.closest('.fx-word-structure-popup') &&
    !target.closest('.fx-word-symbol-popup') &&
    !target.closest('.fx-word-structure-group') &&
    !target.closest('.fx-word-symbol-more')
  ) {
    closeAllPopups();
  }
});

window.addEventListener('resize', () => {
  closeAllPopups();
});

window.addEventListener(
  'scroll',
  () => {
    closeAllPopups();
  },
  true,
);

setActiveSymbolTab(0);
