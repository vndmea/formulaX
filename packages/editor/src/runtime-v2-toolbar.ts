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
  previewFontFamily?: string;
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
  unicodeFont?: string;
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
          content?: RawToolbarContentItem[];
        }>;
      }>;
    };
  };
}>;

const TOOLBAR_SYMBOL_LABELS: Record<FormulaXLocale, string> = {
  en_US: 'Symbols',
  zh_CN: '符号',
};

const UNDO_LABELS: Record<FormulaXLocale, string> = {
  en_US: 'Undo',
  zh_CN: '撤销',
};

const REDO_LABELS: Record<FormulaXLocale, string> = {
  en_US: 'Redo',
  zh_CN: '重做',
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

  const popover = doc.createElement('div');
  popover.className = 'fx-runtime-toolbar__popover is-hidden';
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-modal', 'false');

  const popoverCard = doc.createElement('div');
  popoverCard.className = 'fx-runtime-toolbar__popover-card';
  popover.appendChild(popoverCard);

  const undoButton = createActionButton(doc, 'undo', UNDO_LABELS[locale]);
  const redoButton = createActionButton(doc, 'redo', REDO_LABELS[locale]);
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

  const panelButtons = new Map<string, HTMLButtonElement>();
  let activePanelId: string | null = null;

  for (const panel of panels) {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'fx-runtime-toolbar__button';
    button.dataset.formulaxToolbarButton = panel.id;
    button.innerHTML = panel.label;
    button.addEventListener('click', () => {
      activePanelId = activePanelId === panel.id ? null : panel.id;
      renderPopover(panelButtons.get(panel.id) ?? button);
    });
    panelButtons.set(panel.id, button);
    buttonRow.appendChild(button);
  }

  shell.append(buttonRow, popover);
  host.innerHTML = '';
  host.appendChild(shell);

  const closeOnPointerDown = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    if (host.contains(target)) {
      return;
    }
    activePanelId = null;
    renderPopover();
  };

  const closeOnEscape = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || !activePanelId) {
      return;
    }
    activePanelId = null;
    renderPopover();
  };

  const reposition = (): void => {
    if (!activePanelId) {
      return;
    }
    const button = panelButtons.get(activePanelId);
    if (button) {
      positionPopover(button);
    }
  };

  doc.addEventListener('pointerdown', closeOnPointerDown, true);
  doc.addEventListener('keydown', closeOnEscape, true);
  doc.defaultView?.addEventListener('resize', reposition);

  function updateHistoryButtons(): void {
    undoButton.disabled = !runtimeHandle.editor.canUndo();
    redoButton.disabled = !runtimeHandle.editor.canRedo();
  }

  function renderPopover(anchor?: HTMLButtonElement): void {
    for (const [id, button] of panelButtons) {
      button.dataset.active = id === activePanelId ? 'true' : 'false';
    }

    updateHistoryButtons();

    if (!activePanelId) {
      popover.classList.add('is-hidden');
      popoverCard.innerHTML = '';
      return;
    }

    const panel = panels.find((item) => item.id === activePanelId);
    if (!panel) {
      activePanelId = null;
      renderPopover();
      return;
    }

    popover.classList.remove('is-hidden');
    popoverCard.innerHTML = '';

    const header = doc.createElement('div');
    header.className = 'fx-runtime-toolbar__popover-header';

    const title = doc.createElement('div');
    title.className = 'fx-runtime-toolbar__popover-title';
    title.innerHTML = panel.label;

    const closeButton = doc.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'fx-runtime-toolbar__popover-close';
    closeButton.setAttribute('aria-label', locale === 'zh_CN' ? '关闭' : 'Close');
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => {
      activePanelId = null;
      renderPopover();
    });

    header.append(title, closeButton);
    popoverCard.appendChild(header);

    for (const group of panel.groups) {
      const section = doc.createElement('section');
      section.className = 'fx-runtime-toolbar__section';

      const sectionTitle = doc.createElement('h3');
      sectionTitle.className = 'fx-runtime-toolbar__section-title';
      sectionTitle.textContent = stripHtml(group.title);

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
        if (item.previewFontFamily) {
          preview.style.fontFamily = item.previewFontFamily;
        }

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

      section.append(sectionTitle, grid);
      popoverCard.appendChild(section);
    }

    if (anchor) {
      positionPopover(anchor);
    }
  }

  function positionPopover(anchor: HTMLButtonElement): void {
    const shellRect = shell.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const preferredLeft = anchorRect.left - shellRect.left;
    const preferredTop = anchorRect.bottom - shellRect.top + 10;
    const maxWidth = Math.max(360, Math.min(shellRect.width - 16, 760));

    popover.style.maxWidth = `${maxWidth}px`;
    popover.style.minWidth = `${Math.min(maxWidth, 420)}px`;
    popover.style.top = `${preferredTop}px`;

    const estimatedWidth = Math.min(maxWidth, 560);
    const left = Math.max(8, Math.min(preferredLeft, shellRect.width - estimatedWidth - 8));
    popover.style.left = `${left}px`;
  }

  renderPopover();

  return {
    destroy() {
      doc.removeEventListener('pointerdown', closeOnPointerDown, true);
      doc.removeEventListener('keydown', closeOnEscape, true);
      doc.defaultView?.removeEventListener('resize', reposition);
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

function extractToolbarGroups(
  groups: NonNullable<NonNullable<RawToolbarConfig[number]['options']>['box']>['group'],
): RuntimeToolbarGroup[] {
  const normalizedGroups: RuntimeToolbarGroup[] = [];

  for (const group of groups ?? []) {
    for (const item of group.items ?? []) {
      const normalizedItems = (item.content ?? [])
        .map(normalizeToolbarItem)
        .filter((value): value is RuntimeToolbarItem => value !== null);

      if (normalizedItems.length === 0) {
        continue;
      }

      normalizedGroups.push({
        id: createPanelId(item.title ?? group.title ?? 'Items'),
        title: item.title ?? group.title ?? 'Items',
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
      preview: createTemplatePreview(latex),
    };
  }

  if (typeof item.key === 'string' && item.key.trim()) {
    const preview = stripHtml(item.unicode ?? item.key);
    return {
      id: createPanelId(item.key),
      label: preview,
      latex: item.key,
      preview,
      previewFontFamily: item.unicodeFont,
    };
  }

  return null;
}

function createTemplatePreview(latex: string): string {
  const compact = latex.replace(/\s+/g, ' ').trim();

  switch (compact) {
    case '\\frac \\placeholder\\placeholder':
      return 'a / b';
    case '{\\placeholder/\\placeholder}':
      return 'a/b';
    case '\\placeholder^\\placeholder':
      return 'x²';
    case '\\placeholder_\\placeholder':
      return 'x₁';
    case '\\placeholder^\\placeholder_\\placeholder':
      return 'x₁²';
    case '{^\\placeholder_\\placeholder\\placeholder}':
      return 'ⁿCᵣ';
    case '\\sqrt \\placeholder':
      return '√x';
    case '\\sqrt [\\placeholder] \\placeholder':
      return 'ⁿ√x';
    case '\\sqrt [2] \\placeholder':
      return '²√x';
    case '\\sqrt [3] \\placeholder':
      return '³√x';
    case '\\int \\placeholder':
      return '∫x';
    case '\\iint\\placeholder':
      return '∬x';
    case '\\iiint\\placeholder':
      return '∭x';
    case '\\sum\\placeholder':
      return '∑x';
    case '\\prod\\placeholder':
      return '∏x';
  }

  return compact
    .replace(/\\placeholder/g, '□')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\,/g, ' ')
    .replace(/\\/g, '')
    .trim();
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
