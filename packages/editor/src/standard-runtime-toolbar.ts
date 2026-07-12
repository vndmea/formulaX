import { renderLatexToSvgMarkup } from '@formulaxjs/renderer/standard';
import {
  normalizeFormulaXLocale,
  type FormulaXLocale,
} from '@formulaxjs/core';
import {
  createRuntimeToolbarPanels,
  resolveRuntimeToolbarPanels,
  type RuntimeEditorAssets,
  type RuntimeEditorHandle,
  type RuntimeExtension,
  type RuntimeToolbarGroup,
  type RuntimeToolbarItem,
  type RuntimeToolbarPanel,
} from '@formulaxjs/runtime';
import { FORMULAX_DEFAULT_ICON_SVG } from './icons';

type RuntimeToolbarMountOptions = {
  locale?: FormulaXLocale;
  runtimeAssets?: Partial<RuntimeEditorAssets>;
  extensions?: RuntimeExtension[];
};

type ToolbarPreviewRenderer = {
  render(host: HTMLElement, latex: string, fontSize?: number, priority?: boolean): void;
  preload(latex: string, fontSize?: number): void;
  destroy(): void;
};

const TOOLBAR_SYMBOL_PREVIOUS_LABELS: Record<FormulaXLocale, string> = {
  en_US: 'Previous symbols',
  zh_CN: '上一页符号',
};

const TOOLBAR_SYMBOL_NEXT_LABELS: Record<FormulaXLocale, string> = {
  en_US: 'Next symbols',
  zh_CN: '下一页符号',
};

const UNDO_LABELS: Record<FormulaXLocale, string> = {
  en_US: 'Undo',
  zh_CN: '撤销',
};

const REDO_LABELS: Record<FormulaXLocale, string> = {
  en_US: 'Redo',
  zh_CN: '重做',
};

const TOOLBAR_BUTTON_ICON_PREVIEWS: Partial<Record<string, { latex: string; fontSize?: number }>> = {
  fraction: { latex: '\\frac {a}{b}', fontSize: 18 },
  scripts: { latex: '{}^n_1Y', fontSize: 18 },
  radicals: { latex: '\\sqrt [3] x', fontSize: 18 },
  integrals: { latex: '\\int_a^b', fontSize: 18 },
  'large-ops': { latex: '\\sum_1^n', fontSize: 18 },
  brackets: { latex: '\\left(x\\right)', fontSize: 19 },
  functions: { latex: '\\sin x', fontSize: 18 },
};

const TOOLBAR_SYMBOL_PREVIEW_FONT_SIZE = 20;
const TOOLBAR_TEMPLATE_PREVIEW_FONT_SIZE = 28;
const TOOLBAR_PRESETS_PREVIEW_FONT_SIZE = 24;

function createToolbarPreviewRenderer(
  doc: Document,
  runtimeAssets?: Partial<RuntimeEditorAssets>,
): ToolbarPreviewRenderer {
  const queue: Array<{ host: HTMLElement; latex: string; fontSize: number }> = [];
  const markupCache = new Map<string, string>();
  const pendingCache = new Map<string, Promise<string>>();
  let activeCount = 0;
  let destroyed = false;

  const cacheKey = (latex: string, fontSize: number): string => `${fontSize}\u0000${latex}`;

  const resolveSvgTextCenterX = (svg: SVGSVGElement): number | null => {
    const viewBox = svg.getAttribute('viewBox');
    if (viewBox) {
      const [minX, , width] = viewBox
        .trim()
        .split(/\s+/u)
        .slice(0, 3)
        .map((part) => Number.parseFloat(part));
      if (Number.isFinite(minX) && Number.isFinite(width)) {
        return minX + width / 2;
      }
    }

    const width = Number.parseFloat(svg.getAttribute('width') ?? '');
    return Number.isFinite(width) ? width / 2 : null;
  };

  const normalizeRenderedPreview = (host: HTMLElement): void => {
    if (host.dataset.formulaxToolbarPreviewKind !== 'symbol') {
      return;
    }

    host.querySelectorAll<SVGSVGElement>('svg').forEach((svg) => {
      const centerX = resolveSvgTextCenterX(svg);
      svg.querySelectorAll<SVGTextElement>('text').forEach((node) => {
        node.setAttribute('font-size', String(TOOLBAR_SYMBOL_PREVIEW_FONT_SIZE));
        if (centerX !== null) {
          node.setAttribute('x', String(centerX));
          node.setAttribute('text-anchor', 'middle');
        }
      });
    });
  };

  const renderCached = (latex: string, fontSize: number): Promise<string> => {
    const key = cacheKey(latex, fontSize);
    const cached = markupCache.get(key);
    if (cached !== undefined) {
      return Promise.resolve(cached);
    }

    const pending = pendingCache.get(key);
    if (pending) {
      return pending;
    }

    const promise = renderLatexToSvgMarkup(latex, {
      fontSize,
      cache: !runtimeAssets?.fontFamily,
      runtime: {
        assets: runtimeAssets,
      },
    })
      .then((result) => {
        markupCache.set(key, result.html);
        pendingCache.delete(key);
        return result.html;
      })
      .catch((error) => {
        pendingCache.delete(key);
        throw error;
      });
    pendingCache.set(key, promise);
    return promise;
  };

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
        .then(() => renderCached(task.latex, task.fontSize))
        .then((html) => {
          if (destroyed || !task.host.isConnected) {
            return;
          }
          task.host.innerHTML = html;
          normalizeRenderedPreview(task.host);
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
      const cached = markupCache.get(cacheKey(latex, fontSize));
      if (cached !== undefined) {
        host.innerHTML = cached;
        normalizeRenderedPreview(host);
        host.removeAttribute('aria-busy');
        return;
      }

      host.setAttribute('aria-busy', 'true');
      const task = { host, latex, fontSize };
      if (priority) {
        queue.unshift(task);
      } else {
        queue.push(task);
      }
      queueMicrotask(pump);
    },
    preload(latex, fontSize = 28) {
      const fontsReady = doc.fonts?.ready ?? Promise.resolve();
      void fontsReady.then(() => renderCached(latex, fontSize)).catch(() => undefined);
    },
    destroy() {
      destroyed = true;
      queue.length = 0;
      pendingCache.clear();
    },
  };
}

export function mountStandardRuntimeToolbar(
  host: HTMLElement,
  runtimeHandle: RuntimeEditorHandle,
  options: RuntimeToolbarMountOptions = {},
): { destroy(): void } {
  const locale = normalizeFormulaXLocale(options.locale);
  const panels = resolveRuntimeToolbarPanels(
    createRuntimeToolbarPanels(locale),
    options.extensions,
  );
  const doc = host.ownerDocument ?? document;
  const previewRenderer = createToolbarPreviewRenderer(doc, options.runtimeAssets);

  const shell = doc.createElement('div');
  shell.className = 'fx-runtime-toolbar';

  const buttonRow = doc.createElement('div');
  buttonRow.className = 'fx-runtime-toolbar__row';

  const popover = doc.createElement('div');
  popover.className = 'fx-runtime-toolbar__popover is-hidden';
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

  // TODO: Restore toolbar-level undo/redo after the standard history UX is redesigned
  // to match the Kity interaction model.
  // const historyGroup = doc.createElement('span');
  // historyGroup.className = 'fx-runtime-toolbar__history';
  // historyGroup.append(undoButton, redoButton);

  for (const panel of panels) {
    if (panel.kind === 'area') {
      const area = createSymbolArea(doc, panel, previewRenderer, locale, {
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
      // TODO: Re-enable once standard history controls are redesigned.
      // buttonRow.appendChild(historyGroup);
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
    if (panel.layout === 'presets') {
      buttonRow.appendChild(createDelimiter(doc));
    }
  }
  // TODO: Re-enable once standard history controls are redesigned.
  // buttonRow.appendChild(historyGroup);
  preloadToolbarPreviews(panels, previewRenderer);

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
      popover.removeAttribute('data-formulax-toolbar-layout');
      popoverBody.innerHTML = '';
      resetPopoverOverflow();
      return;
    }

    const panel = panels.find((item) => item.id === activePanelId);
    if (!panel) {
      activePanelId = null;
      renderPopover();
      return;
    }

    popover.classList.remove('is-hidden');
    popover.dataset.formulaxToolbarLayout = panel.layout;
    popoverBody.innerHTML = '';

    appendToolbarSections(popoverBody, panel.groups, panel.layout, (item) => {
        applyToolbarItem(runtimeHandle, item.latex);
        runtimeHandle.focus();
        updateHistoryButtons();
        activePanelId = null;
        renderPopover();
    });

    if (anchor) {
      positionPopover(anchor);
    }
  }

  function appendToolbarSections(
    sectionHost: HTMLElement,
    groups: RuntimeToolbarGroup[],
    layout: RuntimeToolbarPanel['layout'],
    onSelect: (item: RuntimeToolbarItem) => void,
  ): void {
    for (const group of groups) {
      const section = doc.createElement('section');
      section.className = 'fx-runtime-toolbar__section';

      const sectionTitle = doc.createElement('div');
      sectionTitle.className = 'fx-runtime-toolbar__section-title';
      sectionTitle.textContent = stripHtml(group.title);

      const grid = doc.createElement('div');
      grid.className = `fx-runtime-toolbar__grid fx-runtime-toolbar__grid--${layout}`;

      for (const item of group.items) {
        const itemButton = doc.createElement('button');
        itemButton.type = 'button';
        itemButton.className = `fx-runtime-toolbar__item fx-runtime-toolbar__item--${layout}`;
        itemButton.dataset.formulaxToolbarItem = item.id;
        itemButton.dataset.formulaxToolbarLatex = item.latex;
        itemButton.title = item.title || item.latex;
        applyToolbarItemSize(itemButton, item, layout);

        const content = doc.createElement('span');
        content.className = `fx-runtime-toolbar__item-content fx-runtime-toolbar__item-content--${layout}`;
        applyToolbarItemSize(content, item, layout);

        if (item.label) {
          const label = doc.createElement('span');
          label.className = 'fx-runtime-toolbar__item-label';
          label.textContent = item.label;
          content.appendChild(label);
        }

        const preview = createPreviewElement(doc, item, previewRenderer, layout, true);
        applyToolbarPreviewSize(preview, item, layout);
        content.appendChild(preview);
        itemButton.appendChild(content);
        itemButton.addEventListener('click', () => onSelect(item));

        grid.appendChild(itemButton);
      }

      section.append(sectionTitle, grid);
      sectionHost.appendChild(section);
    }
  }

  function positionPopover(anchor: HTMLButtonElement): void {
    const panel = panels.find((item) => item.id === activePanelId);
    const requestedWidth = panel?.width ?? 332;
    const shellWidth = Math.max(shell.clientWidth, requestedWidth + 8);
    const width = Math.min(requestedWidth, Math.max(220, shellWidth - 8));
    const shellRect = shell.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const areaContainer = anchor.classList.contains('fx-runtime-toolbar__area-open')
      ? anchor.closest('.fx-runtime-toolbar__area')?.querySelector<HTMLElement>('.fx-runtime-toolbar__area-container')
      : null;
    const leftAnchor = areaContainer ?? anchor;
    const leftAnchorRect = leftAnchor.getBoundingClientRect();
    const measuredLeft = leftAnchorRect.left - shellRect.left;
    const measuredTop = anchorRect.bottom - shellRect.top;
    const preferredLeft = (leftAnchorRect.width > 0 ? measuredLeft : leftAnchor.offsetLeft) - 1;
    const left = Math.max(0, Math.min(preferredLeft, shellWidth - width - 1));

    resetPopoverOverflow();
    popover.style.width = `${width}px`;
    popover.style.maxWidth = `${width}px`;
    popover.style.left = `${left}px`;
    popover.style.top = `${anchorRect.height > 0 ? measuredTop - 1 : anchor.offsetTop + anchor.offsetHeight - 1}px`;

    if (panel?.layout !== 'symbols') {
      return;
    }

    const viewportHeight = doc.defaultView?.innerHeight;
    if (!viewportHeight) {
      return;
    }

    const popoverRect = popover.getBoundingClientRect();
    if (popoverRect.bottom <= viewportHeight) {
      return;
    }

    const availableHeight = Math.max(120, Math.floor(viewportHeight - popoverRect.top - 30));
    popoverBody.style.maxHeight = `${availableHeight}px`;
    popoverBody.style.overflowY = 'auto';
  }

  function resetPopoverOverflow(): void {
    popoverBody.style.maxHeight = '';
    popoverBody.style.overflowY = '';
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
  button.classList.add(`fx-runtime-toolbar__button--${panel.layout}`);
  const iconHost = button.querySelector<HTMLElement>('.fx-runtime-toolbar__button-icon');
  const previewItem = panel.groups[0]?.items[0];
  if (iconHost && panel.layout === 'presets') {
    iconHost.classList.add('fx-runtime-toolbar__button-icon--presets');
    iconHost.innerHTML = FORMULAX_DEFAULT_ICON_SVG;
  } else if (iconHost && previewItem) {
    iconHost.classList.add(`fx-runtime-toolbar__button-icon--${previewItem.kind}`);
    iconHost.dataset.formulaxToolbarIcon = panel.id;
    const iconPreview = resolveToolbarButtonIconPreview(panel.id, previewItem.previewLatex);
    const iconLatex = iconPreview.latex;
    iconHost.dataset.formulaxToolbarPreview = iconLatex;
    previewRenderer.render(iconHost, iconLatex, iconPreview.fontSize ?? 22, true);
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
  const normalizedLabel = normalizeToolbarButtonLabel(label);
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'fx-runtime-toolbar__button';
  button.dataset.formulaxToolbarControl = id;
  button.title = stripHtml(normalizedLabel);

  const buttonInner = doc.createElement('span');
  buttonInner.className = 'fx-runtime-toolbar__button-in';

  const iconElement = doc.createElement('span');
  iconElement.className = 'fx-runtime-toolbar__button-icon';
  iconElement.textContent = fallbackIcon;

  const labelElement = doc.createElement('span');
  labelElement.className = 'fx-runtime-toolbar__button-label';
  labelElement.innerHTML = normalizedLabel;

  buttonInner.append(iconElement, labelElement);
  if (showSign) {
    const sign = doc.createElement('span');
    sign.className = 'fx-runtime-toolbar__button-sign';
    labelElement.appendChild(sign);
  }

  button.appendChild(buttonInner);
  return button;
}

function createPreviewElement(
  doc: Document,
  item: RuntimeToolbarItem,
  previewRenderer: ToolbarPreviewRenderer,
  layout: RuntimeToolbarPanel['layout'],
  priority = false,
): HTMLElement {
  const preview = doc.createElement('span');

  if (item.kind === 'symbol') {
    preview.className = 'fx-runtime-toolbar__item-preview fx-runtime-toolbar__item-preview--symbol';
    preview.dataset.formulaxToolbarPreviewKind = 'symbol';
  } else {
    preview.className = 'fx-runtime-toolbar__item-preview fx-runtime-toolbar__item-preview--template';
  }

  preview.dataset.formulaxToolbarPreview = item.previewLatex;
  previewRenderer.render(
    preview,
    item.previewLatex,
    resolveToolbarPreviewFontSize(item, layout),
    priority,
  );
  return preview;
}

function resolveToolbarPreviewFontSize(
  item: RuntimeToolbarItem,
  layout: RuntimeToolbarPanel['layout'],
): number {
  if (item.kind === 'symbol') {
    return TOOLBAR_SYMBOL_PREVIEW_FONT_SIZE;
  }
  return layout === 'presets'
    ? TOOLBAR_PRESETS_PREVIEW_FONT_SIZE
    : TOOLBAR_TEMPLATE_PREVIEW_FONT_SIZE;
}

function preloadToolbarPreviews(
  panels: RuntimeToolbarPanel[],
  previewRenderer: ToolbarPreviewRenderer,
): void {
  for (const panel of panels) {
    for (const group of panel.groups) {
      for (const item of group.items) {
        previewRenderer.preload(item.previewLatex, resolveToolbarPreviewFontSize(item, panel.layout));
      }
    }
  }
}

function applyToolbarItemSize(
  element: HTMLElement,
  item: RuntimeToolbarItem,
  layout: RuntimeToolbarPanel['layout'],
): void {
  if (!item.previewSize || layout === 'symbols') {
    return;
  }

  element.style.setProperty('--fx-runtime-toolbar-preview-width', `${item.previewSize.width}px`);
  element.style.setProperty('--fx-runtime-toolbar-preview-height', `${item.previewSize.height}px`);

  if (layout !== 'presets') {
    const width = `${item.previewSize.width + 12}px`;
    const height = `${item.previewSize.height + 12}px`;
    element.style.setProperty('--fx-runtime-toolbar-item-width', width);
    element.style.setProperty('--fx-runtime-toolbar-item-height', height);
    element.style.width = width;
    element.style.height = height;
  }
}

function applyToolbarPreviewSize(
  element: HTMLElement,
  item: RuntimeToolbarItem,
  layout: RuntimeToolbarPanel['layout'],
): void {
  if (!item.previewSize || layout === 'symbols') {
    return;
  }

  const width = `${item.previewSize.width}px`;
  const height = `${item.previewSize.height}px`;
  element.style.setProperty('--fx-runtime-toolbar-preview-width', width);
  element.style.setProperty('--fx-runtime-toolbar-preview-height', height);
  element.style.height = height;
  if (layout !== 'presets') {
    element.style.width = width;
  }
}

function createToolbarButtonIconLatex(latex: string): string {
  return latex
    .replace(/\\placeholder/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveToolbarButtonIconPreview(
  panelId: string,
  fallbackLatex: string,
): { latex: string; fontSize?: number } {
  const mapped = TOOLBAR_BUTTON_ICON_PREVIEWS[panelId];
  if (mapped) {
    return mapped;
  }

  return {
    latex: createToolbarButtonIconLatex(fallbackLatex),
    fontSize: 22,
  };
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
  delimiter.className = 'fx-runtime-toolbar__delimiter';
  const line = doc.createElement('span');
  line.className = 'fx-runtime-toolbar__delimiter-line';
  delimiter.appendChild(line);
  return delimiter;
}

function createSymbolArea(
  doc: Document,
  panel: RuntimeToolbarPanel,
  previewRenderer: ToolbarPreviewRenderer,
  locale: FormulaXLocale,
  handlers: {
    insert(item: RuntimeToolbarItem): void;
    open(button: HTMLButtonElement): void;
  },
): { root: HTMLElement; button: HTMLButtonElement } {
  const pageSize = 18;
  const symbols = panel.groups.flatMap((group) => group.items);
  const pageCount = Math.max(1, Math.ceil(symbols.length / pageSize));
  let pageIndex = 0;

  const root = doc.createElement('div');
  root.className = 'fx-runtime-toolbar__area';

  const viewport = doc.createElement('div');
  viewport.className = 'fx-runtime-toolbar__area-container';

  const buttonContainer = doc.createElement('div');
  buttonContainer.className = 'fx-runtime-toolbar__area-button-container';

  const moveUpButton = doc.createElement('button');
  moveUpButton.type = 'button';
  moveUpButton.className = 'fx-runtime-toolbar__area-page fx-runtime-toolbar__area-page--up';
  moveUpButton.dataset.formulaxToolbarAreaAction = 'prev';
  moveUpButton.setAttribute('aria-label', TOOLBAR_SYMBOL_PREVIOUS_LABELS[locale]);
  moveUpButton.title = TOOLBAR_SYMBOL_PREVIOUS_LABELS[locale];

  const moveDownButton = doc.createElement('button');
  moveDownButton.type = 'button';
  moveDownButton.className = 'fx-runtime-toolbar__area-page fx-runtime-toolbar__area-page--down';
  moveDownButton.dataset.formulaxToolbarAreaAction = 'next';
  moveDownButton.setAttribute('aria-label', TOOLBAR_SYMBOL_NEXT_LABELS[locale]);
  moveDownButton.title = TOOLBAR_SYMBOL_NEXT_LABELS[locale];

  const openButton = doc.createElement('button');
  openButton.type = 'button';
  openButton.className = 'fx-runtime-toolbar__area-open';
  openButton.dataset.formulaxToolbarButton = panel.id;
  openButton.setAttribute('aria-label', panel.label);
  openButton.title = panel.label;

  const renderPage = (): void => {
    viewport.innerHTML = '';
    const visibleItems = symbols.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
    for (const item of visibleItems) {
      const button = doc.createElement('button');
      button.type = 'button';
      button.className = 'fx-runtime-toolbar__area-item';
      button.dataset.formulaxToolbarLatex = item.latex;
      button.title = item.title;
      const inner = doc.createElement('span');
      inner.className = 'fx-runtime-toolbar__area-item-inner';
      inner.appendChild(createPreviewElement(doc, item, previewRenderer, 'symbols'));
      button.appendChild(inner);
      button.addEventListener('click', () => handlers.insert(item));
      viewport.appendChild(button);
    }

    moveUpButton.disabled = pageIndex === 0;
    moveDownButton.disabled = pageIndex + 1 >= pageCount;
  };

  moveUpButton.addEventListener('click', () => {
    if (pageIndex === 0) {
      return;
    }
    pageIndex -= 1;
    renderPage();
  });

  moveDownButton.addEventListener('click', () => {
    if (pageIndex + 1 >= pageCount) {
      return;
    }
    pageIndex += 1;
    renderPage();
  });

  openButton.addEventListener('click', () => handlers.open(openButton));

  renderPage();
  buttonContainer.append(moveUpButton, moveDownButton, openButton);
  root.append(viewport, buttonContainer);
  return { root, button: openButton };
}

function stripHtml(value: string): string {
  return value.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeToolbarButtonLabel(value: string): string {
  return value.trim();
}
