import {
  createToolbarConfig,
  normalizeFormulaXLocale,
  type FormulaXLocale,
} from '@formulaxjs/kity-runtime';
import type { RuntimeEditorHandle } from '@formulaxjs/runtime';

type RuntimeToolbarItem = {
  id: string;
  label: string;
  latex: string;
  preview: string;
};

type RuntimeToolbarGroup = {
  id: string;
  title: string;
  items: RuntimeToolbarItem[];
};

type RuntimeToolbarPanel = {
  id: string;
  label: string;
  groups: RuntimeToolbarGroup[];
};

type RuntimeToolbarMountOptions = {
  locale?: FormulaXLocale;
};

type RawToolbarContentItem = {
  label?: string;
  key?: string;
  unicode?: string;
  item?: {
    val?: string;
  };
};

type RawToolbarConfig = Array<{
  type?: string;
  options?: {
    button?: {
      label?: string;
    };
    box?: {
      group?: Array<{
        title?: string;
        items?: Array<{
          title?: string;
          content?: Array<{
            label?: string;
            key?: string;
            unicode?: string;
            item?: {
              val?: string;
            };
          }>;
        }>;
      }>;
    };
  };
}>;

const TOOLBAR_SYMBOL_LABELS: Record<FormulaXLocale, string> = {
  en_US: 'Symbols',
  zh_CN: '符号',
};

export function mountRuntimeV2Toolbar(
  host: HTMLElement,
  runtimeHandle: RuntimeEditorHandle,
  options: RuntimeToolbarMountOptions = {},
): { destroy(): void } {
  const locale = normalizeFormulaXLocale(options.locale);
  const panels = createRuntimeToolbarPanels(locale);
  const doc = host.ownerDocument ?? document;
  const shell = doc.createElement('div');
  shell.className = 'fx-runtime-toolbar';

  const buttonRow = doc.createElement('div');
  buttonRow.className = 'fx-runtime-toolbar__row';

  const panelRoot = doc.createElement('div');
  panelRoot.className = 'fx-runtime-toolbar__panel is-hidden';

  const undoButton = createActionButton(doc, 'undo', locale === 'zh_CN' ? '撤销' : 'Undo');
  const redoButton = createActionButton(doc, 'redo', locale === 'zh_CN' ? '重做' : 'Redo');

  undoButton.addEventListener('click', () => {
    runtimeHandle.editor.undo();
    runtimeHandle.focus();
    updateHistoryButtons();
  });
  redoButton.addEventListener('click', () => {
    runtimeHandle.editor.redo();
    runtimeHandle.focus();
    updateHistoryButtons();
  });

  buttonRow.append(undoButton, redoButton);

  let activePanelId: string | null = null;
  const panelButtons = new Map<string, HTMLButtonElement>();

  for (const panel of panels) {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'fx-runtime-toolbar__button';
    button.dataset.formulaxToolbarButton = panel.id;
    button.innerHTML = panel.label;
    button.addEventListener('click', () => {
      activePanelId = activePanelId === panel.id ? null : panel.id;
      renderActivePanel();
    });
    panelButtons.set(panel.id, button);
    buttonRow.appendChild(button);
  }

  shell.append(buttonRow, panelRoot);
  host.innerHTML = '';
  host.appendChild(shell);

  function updateHistoryButtons(): void {
    undoButton.disabled = !runtimeHandle.editor.canUndo();
    redoButton.disabled = !runtimeHandle.editor.canRedo();
  }

  function renderActivePanel(): void {
    for (const [id, button] of panelButtons) {
      button.dataset.active = id === activePanelId ? 'true' : 'false';
    }

    if (!activePanelId) {
      panelRoot.classList.add('is-hidden');
      panelRoot.innerHTML = '';
      updateHistoryButtons();
      return;
    }

    const panel = panels.find((item) => item.id === activePanelId);
    if (!panel) {
      activePanelId = null;
      renderActivePanel();
      return;
    }

    panelRoot.classList.remove('is-hidden');
    panelRoot.innerHTML = '';

    for (const group of panel.groups) {
      const section = doc.createElement('section');
      section.className = 'fx-runtime-toolbar__section';

      const title = doc.createElement('h3');
      title.className = 'fx-runtime-toolbar__section-title';
      title.innerHTML = group.title;

      const grid = doc.createElement('div');
      grid.className = 'fx-runtime-toolbar__grid';

      for (const item of group.items) {
        const itemButton = doc.createElement('button');
        itemButton.type = 'button';
        itemButton.className = 'fx-runtime-toolbar__item';
        itemButton.dataset.formulaxToolbarItem = item.id;
        itemButton.dataset.formulaxToolbarLatex = item.latex;
        itemButton.title = item.label;

        const preview = doc.createElement('span');
        preview.className = 'fx-runtime-toolbar__item-preview';
        preview.textContent = item.preview;

        const label = doc.createElement('span');
        label.className = 'fx-runtime-toolbar__item-label';
        label.textContent = item.label;

        itemButton.append(preview, label);
        itemButton.addEventListener('click', () => {
          applyToolbarItem(runtimeHandle, item.latex);
          runtimeHandle.focus();
          updateHistoryButtons();
        });
        grid.appendChild(itemButton);
      }

      section.append(title, grid);
      panelRoot.appendChild(section);
    }

    updateHistoryButtons();
  }

  renderActivePanel();
  updateHistoryButtons();

  return {
    destroy() {
      host.innerHTML = '';
    },
  };
}

function createActionButton(doc: Document, action: string, label: string): HTMLButtonElement {
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'fx-runtime-toolbar__button fx-runtime-toolbar__button--action';
  button.dataset.formulaxToolbarAction = action;
  button.textContent = label;
  return button;
}

function createRuntimeToolbarPanels(locale: FormulaXLocale): RuntimeToolbarPanel[] {
  const config = createToolbarConfig(locale) as RawToolbarConfig;
  const panels: RuntimeToolbarPanel[] = [];

  for (const entry of config) {
    const groups = extractToolbarGroups(entry.options?.box?.group ?? []);
    if (groups.length === 0) {
      continue;
    }

    const label = entry.options?.button?.label;
    if (label) {
      panels.push({
        id: createPanelId(label),
        label,
        groups,
      });
      continue;
    }

    panels.push({
      id: 'symbols',
      label: TOOLBAR_SYMBOL_LABELS[locale],
      groups,
    });
  }

  return panels;
}

function extractToolbarGroups(groups: NonNullable<NonNullable<RawToolbarConfig[number]['options']>['box']>['group']): RuntimeToolbarGroup[] {
  const normalizedGroups: RuntimeToolbarGroup[] = [];

  for (const group of groups ?? []) {
    for (const item of group.items ?? []) {
      const normalizedItems = (item.content ?? [])
        .map(normalizeToolbarItem)
        .filter((value): value is RuntimeToolbarItem => value !== null);

      if (normalizedItems.length === 0) {
        continue;
      }

      const title = item.title ?? group.title ?? 'Items';
      normalizedGroups.push({
        id: createPanelId(title),
        title,
        items: normalizedItems,
      });
    }
  }

  return normalizedGroups;
}

function normalizeToolbarItem(item: RawToolbarContentItem): RuntimeToolbarItem | null {
  if (typeof item.item?.val === 'string' && item.item.val.trim()) {
    const latex = item.item.val.trim();
    return {
      id: createPanelId(`${item.label ?? latex}-${latex}`),
      label: stripHtml(item.label ?? latex),
      latex,
      preview: stripHtml(item.label ?? latex),
    };
  }

  if (typeof item.key === 'string' && item.key.trim()) {
    return {
      id: createPanelId(item.key),
      label: stripHtml(item.unicode ?? item.key),
      latex: item.key,
      preview: stripHtml(item.unicode ?? item.key),
    };
  }

  return null;
}

function applyToolbarItem(runtimeHandle: RuntimeEditorHandle, latex: string): void {
  const normalized = latex.replace(/\s+/g, ' ').trim();

  switch (normalized) {
    case '\\frac \\placeholder\\placeholder':
      runtimeHandle.editor.dispatch({ type: 'insertFraction', payload: undefined });
      return;
    case '\\sqrt \\placeholder':
      runtimeHandle.editor.dispatch({ type: 'insertSqrt', payload: undefined });
      return;
    case '\\placeholder^\\placeholder':
      runtimeHandle.editor.dispatch({ type: 'insertSuperscript', payload: undefined });
      return;
    case '\\placeholder_\\placeholder':
      runtimeHandle.editor.dispatch({ type: 'insertSubscript', payload: undefined });
      return;
    default:
      runtimeHandle.editor.dispatch({
        type: 'insertLatex',
        payload: { latex: normalized },
      });
  }
}

function createPanelId(value: string): string {
  return stripHtml(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'panel';
}

function stripHtml(value: string): string {
  return value.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();
}
