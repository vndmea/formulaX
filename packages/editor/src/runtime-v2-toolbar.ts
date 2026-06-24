import {
  createToolbarConfig,
  normalizeFormulaXLocale,
  type FormulaXLocale,
} from '@formulaxjs/kity-runtime';
import { renderLatexToSvgMarkup } from '@formulaxjs/renderer-next';
import type { RuntimeEditorAssets, RuntimeEditorHandle } from '@formulaxjs/runtime';

type RuntimeToolbarItemKind = 'symbol' | 'template';

type RuntimeToolbarItem = {
  id: string;
  kind: RuntimeToolbarItemKind;
  title: string;
  label?: string;
  latex: string;
  previewLatex: string;
};

type RuntimeToolbarGroup = {
  id: string;
  title: string;
  items: RuntimeToolbarItem[];
};

type RuntimeToolbarPanel = {
  id: string;
  kind: 'dropdown' | 'area';
  label: string;
  width: number;
  groups: RuntimeToolbarGroup[];
};

type RuntimeToolbarMountOptions = {
  locale?: FormulaXLocale;
  runtimeAssets?: Partial<RuntimeEditorAssets>;
};

type ToolbarPreviewRenderer = {
  render(host: HTMLElement, latex: string, fontSize?: number, priority?: boolean): void;
  destroy(): void;
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
  type?: number;
  options?: {
    button?: {
      label?: string;
    };
    box?: {
      width?: number;
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

function createToolbarPreviewRenderer(
  runtimeAssets?: Partial<RuntimeEditorAssets>,
): ToolbarPreviewRenderer {
  const queue: Array<{ host: HTMLElement; latex: string; fontSize: number }> = [];
  let activeCount = 0;
  let destroyed = false;

  const pump = (): void => {
    while (!destroyed && activeCount < 4 && queue.length > 0) {
      const task = queue.shift();
      if (!task) {
        return;
      }
      if (!task.host.isConnected) {
        continue;
      }

      activeCount += 1;
      const fontsReady = task.host.ownerDocument.fonts?.ready ?? Promise.resolve();
      void fontsReady
        .then(() => renderLatexToSvgMarkup(task.latex, {
          fontSize: task.fontSize,
          cache: !runtimeAssets?.fontFamily,
          runtime: {
            assets: runtimeAssets,
          },
        }))
        .then((result) => {
          if (destroyed || !task.host.isConnected) {
            return;
          }
          task.host.innerHTML = result.html;
          task.host.removeAttribute('aria-busy');
        })
        .catch(() => {
          if (!destroyed && task.host.isConnected) {
            task.host.dataset.formulaxToolbarPreviewError = 'true';
            task.host.removeAttribute('aria-busy');
          }
        })
        .finally(() => {
          activeCount -= 1;
          pump();
        });
    }
  };

  return {
    render(host, latex, fontSize = 28, priority = false) {
      host.setAttribute('aria-busy', 'true');
      const task = { host, latex, fontSize };
      if (priority) {
        queue.unshift(task);
      } else {
        queue.push(task);
      }
      queueMicrotask(pump);
    },
    destroy() {
      destroyed = true;
      queue.length = 0;
    },
  };
}

export function mountRuntimeV2Toolbar(
  host: HTMLElement,
  runtimeHandle: RuntimeEditorHandle,
  options: RuntimeToolbarMountOptions = {},
): { destroy(): void } {
  const locale = normalizeFormulaXLocale(options.locale);
  const panels = createRuntimeToolbarPanels(locale);
  const doc = host.ownerDocument ?? document;
  const previewRenderer = createToolbarPreviewRenderer(options.runtimeAssets);

  const shell = doc.createElement('div');
  shell.className = 'fx-runtime-toolbar kf-editor-toolbar';

  const buttonRow = doc.createElement('div');
  buttonRow.className = 'fx-runtime-toolbar__row kf-editor-inner-toolbar';

  const popover = doc.createElement('div');
  popover.className = 'fx-runtime-toolbar__popover kf-editor-ui-box is-hidden';
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-modal', 'false');

  const popoverBody = doc.createElement('div');
  popoverBody.className = 'fx-runtime-toolbar__popover-body fx-runtime-toolbar__popover-card';
  popover.appendChild(popoverBody);

  const undoButton = createActionButton(doc, 'undo', UNDO_LABELS[locale], '↶');
  const redoButton = createActionButton(doc, 'redo', REDO_LABELS[locale], '↷');
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
  const panelButtons = new Map<string, HTMLButtonElement>();
  let activePanelId: string | null = null;

  for (const panel of panels) {
    if (panel.kind === 'area') {
      const area = createSymbolArea(doc, panel, previewRenderer, {
        insert(item) {
          applyToolbarItem(runtimeHandle, item.latex);
          runtimeHandle.focus();
          updateHistoryButtons();
        },
        open(button) {
          activePanelId = activePanelId === panel.id ? null : panel.id;
          renderPopover(button);
        },
      });
      panelButtons.set(panel.id, area.button);
      buttonRow.appendChild(area.root);
      buttonRow.appendChild(createDelimiter(doc));
      continue;
    }

    const button = createPanelButton(doc, panel, previewRenderer);
    button.dataset.formulaxToolbarButton = panel.id;
    button.addEventListener('click', () => {
      activePanelId = activePanelId === panel.id ? null : panel.id;
      renderPopover(button);
    });
    panelButtons.set(panel.id, button);
    buttonRow.appendChild(button);
    if (panel.id === 'presets') {
      buttonRow.appendChild(createDelimiter(doc));
    }
  }

  const historyGroup = doc.createElement('span');
  historyGroup.className = 'fx-runtime-toolbar__history';
  historyGroup.append(undoButton, redoButton);
  buttonRow.appendChild(historyGroup);

  shell.append(buttonRow, popover);
  host.innerHTML = '';
  host.appendChild(shell);
  buttonRow.addEventListener('pointerdown', (event) => {
    event.preventDefault();
  });

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
      const isActive = id === activePanelId;
      button.dataset.active = isActive ? 'true' : 'false';
      button.classList.toggle('is-open', isActive);
    }

    updateHistoryButtons();

    if (!activePanelId) {
      popover.classList.add('is-hidden');
      popoverBody.innerHTML = '';
      return;
    }

    const panel = panels.find((item) => item.id === activePanelId);
    if (!panel) {
      activePanelId = null;
      renderPopover();
      return;
    }

    popover.classList.remove('is-hidden');
    popoverBody.innerHTML = '';

    for (const group of panel.groups) {
      const section = doc.createElement('section');
      section.className = 'fx-runtime-toolbar__section kf-editor-ui-box-group';

      const sectionTitle = doc.createElement('div');
      sectionTitle.className = 'fx-runtime-toolbar__section-title kf-editor-ui-box-group-title';
      sectionTitle.textContent = stripHtml(group.title);

      const grid = doc.createElement('div');
      grid.className = 'fx-runtime-toolbar__grid kf-editor-ui-box-container';

      for (const item of group.items) {
        const itemButton = doc.createElement('button');
        itemButton.type = 'button';
        itemButton.className = 'fx-runtime-toolbar__item kf-editor-ui-box-item';
        itemButton.dataset.formulaxToolbarItem = item.id;
        itemButton.dataset.formulaxToolbarLatex = item.latex;
        itemButton.title = item.title || item.latex;

        const content = doc.createElement('span');
        content.className = 'fx-runtime-toolbar__item-content kf-editor-ui-box-item-content';

        if (item.label) {
          const label = doc.createElement('span');
          label.className = 'fx-runtime-toolbar__item-label kf-editor-ui-box-item-label';
          label.textContent = item.label;
          content.appendChild(label);
        }

        content.appendChild(createPreviewElement(doc, item, previewRenderer, true));
        itemButton.appendChild(content);
        itemButton.addEventListener('click', () => {
          applyToolbarItem(runtimeHandle, item.latex);
          runtimeHandle.focus();
          updateHistoryButtons();
          activePanelId = null;
          renderPopover();
        });

        grid.appendChild(itemButton);
      }

      section.append(sectionTitle, grid);
      popoverBody.appendChild(section);
    }

    if (anchor) {
      positionPopover(anchor);
    }
  }

  function positionPopover(anchor: HTMLButtonElement): void {
    const requestedWidth = panels.find((panel) => panel.id === activePanelId)?.width ?? 332;
    const shellWidth = Math.max(shell.clientWidth, requestedWidth + 8);
    const width = Math.min(requestedWidth, Math.max(220, shellWidth - 8));
    const shellRect = shell.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const measuredLeft = anchorRect.left - shellRect.left;
    const measuredTop = anchorRect.bottom - shellRect.top;
    const preferredLeft = (anchorRect.width > 0 ? measuredLeft : anchor.offsetLeft) - 1;
    const left = Math.max(0, Math.min(preferredLeft, shellWidth - width - 1));

    popover.style.width = `${width}px`;
    popover.style.maxWidth = `${width}px`;
    popover.style.left = `${left}px`;
    popover.style.top = `${anchorRect.height > 0 ? measuredTop - 1 : anchor.offsetTop + anchor.offsetHeight - 1}px`;
  }

  renderPopover();

  return {
    destroy() {
      doc.removeEventListener('pointerdown', closeOnPointerDown, true);
      doc.removeEventListener('keydown', closeOnEscape, true);
      doc.defaultView?.removeEventListener('resize', reposition);
      previewRenderer.destroy();
      host.innerHTML = '';
    },
  };
}

function createActionButton(
  doc: Document,
  action: 'undo' | 'redo',
  label: string,
  icon: string,
): HTMLButtonElement {
  const button = createToolbarButton(doc, action, label, icon, false);
  button.dataset.formulaxToolbarAction = action;
  return button;
}

function createPanelButton(
  doc: Document,
  panel: RuntimeToolbarPanel,
  previewRenderer: ToolbarPreviewRenderer,
): HTMLButtonElement {
  const button = createToolbarButton(doc, panel.id, panel.label, '', true);
  const iconHost = button.querySelector<HTMLElement>('.fx-runtime-toolbar__button-icon');
  const previewItem = panel.groups[0]?.items[0];
  if (iconHost && previewItem) {
    iconHost.dataset.formulaxToolbarPreview = previewItem.previewLatex;
    previewRenderer.render(iconHost, previewItem.previewLatex, 22, true);
  }
  return button;
}

function createToolbarButton(
  doc: Document,
  id: string,
  label: string,
  fallbackIcon: string,
  showSign: boolean,
): HTMLButtonElement {
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'fx-runtime-toolbar__button kf-editor-ui-button kf-editor-ui-enabled';
  button.dataset.formulaxToolbarControl = id;

  const buttonInner = doc.createElement('span');
  buttonInner.className = 'fx-runtime-toolbar__button-in kf-editor-ui-button-in';

  const iconElement = doc.createElement('span');
  iconElement.className = 'fx-runtime-toolbar__button-icon kf-editor-ui-button-icon';
  iconElement.textContent = fallbackIcon;

  const labelElement = doc.createElement('span');
  labelElement.className = 'fx-runtime-toolbar__button-label kf-editor-ui-button-label';
  labelElement.innerHTML = label;

  buttonInner.append(iconElement, labelElement);
  if (showSign) {
    const sign = doc.createElement('span');
    sign.className = 'fx-runtime-toolbar__button-sign kf-editor-ui-button-sign';
    buttonInner.appendChild(sign);
  }

  button.appendChild(buttonInner);
  return button;
}

function createPreviewElement(
  doc: Document,
  item: RuntimeToolbarItem,
  previewRenderer: ToolbarPreviewRenderer,
  priority = false,
): HTMLElement {
  const preview = doc.createElement('span');

  if (item.kind === 'symbol') {
    preview.className = 'fx-runtime-toolbar__item-preview fx-runtime-toolbar__item-preview--symbol kf-editor-ui-box-item-text';
  } else {
    preview.className = 'fx-runtime-toolbar__item-preview fx-runtime-toolbar__item-preview--template kf-editor-ui-box-item-val';
  }

  preview.dataset.formulaxToolbarPreview = item.previewLatex;
  previewRenderer.render(preview, item.previewLatex, 28, priority);
  return preview;
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
    const id = createPanelId(label ?? TOOLBAR_SYMBOL_LABELS[locale]);

    panels.push({
      id,
      kind: entry.type === 2 ? 'area' : 'dropdown',
      label: label ?? TOOLBAR_SYMBOL_LABELS[locale],
      width: entry.options?.box?.width ?? 332,
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
    const label = stripHtml(item.label ?? '');
    return {
      id: createPanelId(`${item.label ?? latex}-${latex}`),
      kind: 'template',
      title: label || latex,
      label: label || undefined,
      latex,
      previewLatex: createPreviewLatex(latex),
    };
  }

  if (typeof item.key === 'string' && item.key.trim()) {
    const title = stripHtml(item.unicode ?? item.key);
    return {
      id: createPanelId(item.key),
      kind: 'symbol',
      title,
      latex: item.key,
      previewLatex: item.key,
    };
  }

  return null;
}

function createPreviewLatex(latex: string): string {
  return latex
    .replace(/\s+/g, ' ')
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

function createDelimiter(doc: Document): HTMLElement {
  const delimiter = doc.createElement('span');
  delimiter.className = 'fx-runtime-toolbar__delimiter kf-editor-ui-delimiter';
  const line = doc.createElement('span');
  line.className = 'fx-runtime-toolbar__delimiter-line kf-editor-ui-delimiter-line';
  delimiter.appendChild(line);
  return delimiter;
}

function createSymbolArea(
  doc: Document,
  panel: RuntimeToolbarPanel,
  previewRenderer: ToolbarPreviewRenderer,
  handlers: {
    insert(item: RuntimeToolbarItem): void;
    open(button: HTMLButtonElement): void;
  },
): { root: HTMLElement; button: HTMLButtonElement } {
  const root = doc.createElement('div');
  root.className = 'fx-runtime-toolbar__area kf-editor-ui-area kf-editor-ui-enabled';

  const viewport = doc.createElement('div');
  viewport.className = 'fx-runtime-toolbar__area-container kf-editor-ui-area-container';

  const symbols = panel.groups.flatMap((group) => group.items).slice(0, 18);
  for (const item of symbols) {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'fx-runtime-toolbar__area-item kf-editor-ui-area-item';
    button.dataset.formulaxToolbarLatex = item.latex;
    button.title = item.title;
    button.appendChild(createPreviewElement(doc, item, previewRenderer));
    button.addEventListener('click', () => handlers.insert(item));
    viewport.appendChild(button);
  }

  const openButton = doc.createElement('button');
  openButton.type = 'button';
  openButton.className = 'fx-runtime-toolbar__area-open kf-editor-ui-area-button';
  openButton.dataset.formulaxToolbarButton = panel.id;
  openButton.setAttribute('aria-label', panel.label);
  openButton.title = panel.label;
  openButton.addEventListener('click', () => handlers.open(openButton));

  root.append(viewport, openButton);
  return { root, button: openButton };
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
