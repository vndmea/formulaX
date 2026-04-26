import { createPopup } from './popup';
import {
  SYMBOL_CATEGORIES,
  STRUCTURE_CATEGORIES,
  VISIBLE_SYMBOL_COUNT,
  type SymbolItem,
  type SymbolCategory,
  type StructureItem,
  type StructureCategory,
} from './schema';
import type { ToolbarOptions } from './types';

import './styles.css';

export { SYMBOL_CATEGORIES, STRUCTURE_CATEGORIES, VISIBLE_SYMBOL_COUNT };
export type {
  SymbolItem,
  SymbolCategory,
  StructureItem,
  StructureCategory,
  ToolbarOptions,
};

function renderToolbar(options: ToolbarOptions): void {
  const { container, onSymbolInsert, onStructureInsert } = options;

  const toolbar = document.createElement('div');
  toolbar.className = 'kity-toolbar';

  const equationSection = document.createElement('div');
  equationSection.className = 'kity-toolbar-section';
  const equationBtn = document.createElement('button');
  equationBtn.className = 'kity-toolbar-equation-btn';
  equationBtn.textContent = 'Equation';
  equationBtn.addEventListener('click', () => {
    if (onStructureInsert) {
      onStructureInsert('\\frac{}{}');
    }
  });
  equationSection.appendChild(equationBtn);

  const symbolsSection = document.createElement('div');
  symbolsSection.className = 'kity-toolbar-section';

  const symbolsLabel = document.createElement('div');
  symbolsLabel.className = 'kity-toolbar-section-label';
  symbolsLabel.textContent = 'Symbols';
  symbolsSection.appendChild(symbolsLabel);

  const symbolsRow = document.createElement('div');
  symbolsRow.className = 'kity-toolbar-row';

  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'kity-toolbar-symbol-tabs';

  const visibleContainer = document.createElement('div');
  visibleContainer.className = 'kity-toolbar-row';

  let activeCategory = SYMBOL_CATEGORIES[0];

  function renderSymbols(category: typeof activeCategory, showAll = false): void {
    visibleContainer.innerHTML = '';

    const symbols = category.symbols;
    const visible = showAll ? symbols : symbols.slice(0, VISIBLE_SYMBOL_COUNT);

    visible.forEach((symbol: SymbolItem) => {
      const btn = document.createElement('button');
      btn.className = 'kity-toolbar-btn';
      btn.textContent = symbol.label;
      btn.addEventListener('click', () => {
        if (onSymbolInsert) {
          onSymbolInsert(symbol.latex);
        }
      });
      visibleContainer.appendChild(btn);
    });

    if (!showAll && symbols.length > VISIBLE_SYMBOL_COUNT) {
      const moreBtn = document.createElement('button');
      moreBtn.className = 'kity-toolbar-btn';
      moreBtn.textContent = '...';
      moreBtn.addEventListener('click', (e) => {
        const content = document.createElement('div');
        content.className = 'kity-toolbar-popup-grid';

        symbols.forEach((symbol: SymbolItem) => {
          const item = document.createElement('button');
          item.className = 'kity-toolbar-popup-item';
          item.textContent = symbol.label;
          item.addEventListener('click', () => {
            if (onSymbolInsert) {
              onSymbolInsert(symbol.latex);
            }
          });
          content.appendChild(item);
        });

        createPopup({
          content,
          anchor: moreBtn,
        });
      });
      visibleContainer.appendChild(moreBtn);
    }
  }

  SYMBOL_CATEGORIES.forEach((category, index) => {
    const tab = document.createElement('button');
    tab.className = 'kity-toolbar-symbol-tab' + (index === 0 ? ' active' : '');
    tab.textContent = category.label;
    tab.addEventListener('click', () => {
      tabsContainer.querySelectorAll('.kity-toolbar-symbol-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = category;
      renderSymbols(category);
    });
    tabsContainer.appendChild(tab);
  });

  symbolsRow.appendChild(tabsContainer);
  symbolsRow.appendChild(visibleContainer);
  symbolsSection.appendChild(symbolsRow);

  const structuresSection = document.createElement('div');
  structuresSection.className = 'kity-toolbar-section';

  const structuresLabel = document.createElement('div');
  structuresLabel.className = 'kity-toolbar-section-label';
  structuresLabel.textContent = 'Structures';
  structuresSection.appendChild(structuresLabel);

  const structuresRow = document.createElement('div');
  structuresRow.className = 'kity-toolbar-row';

  STRUCTURE_CATEGORIES.forEach((category) => {
    const primary = category.structures[0];
    const btn = document.createElement('button');
    btn.className = 'kity-toolbar-btn';
    btn.textContent = primary.label;
    btn.title = primary.label;
    btn.addEventListener('click', () => {
      if (onStructureInsert) {
        onStructureInsert(primary.latex);
      }
    });

    if (category.structures.length > 1) {
      btn.classList.add('has-dropdown');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const content = document.createElement('div');
        content.className = 'kity-toolbar-popup-grid';

        category.structures.forEach((structure: StructureItem) => {
          const item = document.createElement('button');
          item.className = 'kity-toolbar-popup-item';
          item.textContent = structure.label;
          item.addEventListener('click', () => {
            if (onStructureInsert) {
              onStructureInsert(structure.latex);
            }
          });
          content.appendChild(item);
        });

        createPopup({
          content,
          anchor: btn,
        });
      });
    }

    structuresRow.appendChild(btn);
  });

  structuresSection.appendChild(structuresRow);

  toolbar.appendChild(equationSection);
  toolbar.appendChild(symbolsSection);
  toolbar.appendChild(structuresSection);
  container.appendChild(toolbar);

  renderSymbols(activeCategory);
}

export { renderToolbar };
