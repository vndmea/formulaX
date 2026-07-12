import type {
  FormulaXTinyMceOptions,
  RequiredFormulaXTinyMceOptions,
  TinyMceEditorLike,
  TinyMceLike,
} from './types';
import { DEFAULT_FORMULAX_LOCALE } from '@formulaxjs/core';
import {
  getFormulaXEditorMessage,
  resolveFormulaXIcon,
  resolveFormulaXIconName,
  scheduleFormulaXEditorPreload,
} from '@formulaxjs/editor';
import { createStandardFormulaRenderer } from '@formulaxjs/renderer/standard';
import { createTinyMceCompat, warnUnsupportedTinyMceVersion } from './compat';
import {
  createFormulaSourceHtml,
  findFormulaElement,
  FORMULA_FLAG_ATTRIBUTE,
  getFormulaOutputFromElement,
  serializeFormulaHtml,
} from './markup';
import { openFormulaXOverlayModal } from './modal';
import { ensureTinyMceStyles } from './styles';

const FORMULAX_SVG_VALID_ELEMENTS = [
  'svg[class|style|id|xmlns|xmlns:xlink|version|width|height|viewbox|font-size|focusable|role|tabindex|contenteditable|data-formulax|data-formulax-latex|data-latex|aria-hidden|preserveaspectratio]',
  'defs[id|class|style]',
  'style[type|media]',
  'g[id|class|style|transform|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|opacity|font-family|font-size|font-style|font-weight|data-type|data-flag|data-root]',
  'path[id|class|style|d|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|opacity|transform|data-type|data-mce-style]',
  'use[id|class|style|x|y|width|height|href|xlink:href|transform|fill|stroke|opacity]',
  'text[id|class|style|x|y|dx|dy|fill|stroke|transform|font-family|font-size|font-style|font-weight|text-anchor|text-rendering|xml:space]',
  'tspan[id|class|style|x|y|dx|dy|fill|stroke|transform|font-family|font-size|font-style|font-weight|text-anchor]',
  'line[id|class|style|x1|y1|x2|y2|fill|stroke|stroke-width|stroke-linecap|opacity|transform]',
  'rect[id|class|style|x|y|width|height|rx|ry|fill|stroke|stroke-width|opacity|transform]',
  'circle[id|class|style|cx|cy|r|fill|stroke|stroke-width|opacity|transform]',
  'ellipse[id|class|style|cx|cy|rx|ry|fill|stroke|stroke-width|opacity|transform]',
  'polygon[id|class|style|points|fill|stroke|stroke-width|opacity|transform]',
  'polyline[id|class|style|points|fill|stroke|stroke-width|opacity|transform]',
].join(',');

const FORMULAX_IMAGE_VALID_ELEMENTS = [
  'img[class|style|src|alt|width|height|data-formulax-image|data-mce-src]',
].join(',');

const FORMULAX_WRAPPER_VALID_ELEMENTS = [
  'span[class|style|contenteditable|role|tabindex|data-formulax|data-formulax-latex|data-latex|data-formulax-output|data-formulax-image-url|data-formulax-image-width|data-formulax-image-height|data-formulax-image-style|data-mce-contenteditable]',
].join(',');

const FORMULAX_TINYMCE_CONTEXT_NAME = 'formulax';

export function resolveOptions(options: FormulaXTinyMceOptions = {}): RequiredFormulaXTinyMceOptions {
  const locale = options.editor?.locale ?? DEFAULT_FORMULAX_LOCALE;

  return {
    pluginName: options.pluginName ?? 'formulax',
    buttonName: options.buttonName ?? 'formulax',
    menuItemName: options.menuItemName ?? 'formulax',
    toolbarText: options.toolbarText ?? 'FormulaX',
    tooltip: options.tooltip ?? 'Insert formula',
    formulaIcon: resolveFormulaXIcon(options),
    formulaIconName: resolveFormulaXIconName(options),
    cursorStyle: options.cursorStyle ?? 'pointer',
    formulaClassName: options.formulaClassName ?? 'formulax-math',
    formulaAttributeName: options.formulaAttributeName ?? 'data-formulax-latex',
    output: options.output ?? 'svg',
    image: options.image,
    initialLatex: options.initialLatex ?? '',
    renderer: options.renderer ?? createStandardFormulaRenderer({
      fontSize: options.editor?.render?.fontsize ?? 40,
      height: options.editor?.height ?? '100%',
      runtime: {
        assets: options.editor?.runtimeAssets ?? {},
      },
    }),
    preload: options.preload ?? 'idle',
    modal: {
      title: options.modal?.title ?? getFormulaXEditorMessage('modal.title', locale),
      insertText: options.modal?.insertText ?? getFormulaXEditorMessage('modal.insert', locale),
      updateText: options.modal?.updateText ?? getFormulaXEditorMessage('modal.update', locale),
      cancelText: options.modal?.cancelText ?? getFormulaXEditorMessage('modal.cancel', locale),
      width: options.modal?.width ?? '1100px',
      height: options.modal?.height ?? 'auto',
      closeOnBackdrop: options.modal?.closeOnBackdrop ?? true,
    },
    editor: {
      height: options.editor?.height ?? '100%',
      autofocus: options.editor?.autofocus ?? true,
      runtime: options.editor?.runtime ?? 'standard',
      locale,
      runtimeAssets: options.editor?.runtimeAssets ?? {},
      extensions: options.editor?.extensions ?? [],
      wrap: options.editor?.wrap ?? 'none',
      maxWidth: options.editor?.maxWidth ?? 'host',
      lineGap: options.editor?.lineGap ?? 14,
      continuationIndent: options.editor?.continuationIndent ?? 30,
      render: {
        fontsize: options.editor?.render?.fontsize ?? options.editor?.render?.fontSize ?? 40,
      },
    },
  };
}

export function registerFormulaXTinyMcePlugin(
  tinymce: TinyMceLike,
  options: FormulaXTinyMceOptions = {},
): void {
  if (!tinymce?.PluginManager?.add) {
    throw new Error('[FormulaX] Invalid TinyMCE instance: PluginManager.add is missing.');
  }

  warnUnsupportedTinyMceVersion(tinymce);
  const resolved = resolveOptions(options);

  tinymce.PluginManager.add(
    resolved.pluginName,
    function FormulaXTinyMcePlugin(editor: TinyMceEditorLike): undefined {
      const compat = createTinyMceCompat(editor, tinymce);
      let preloadCleanup: (() => void) | null = null;
      editor.schema?.addValidElements?.(
        `${FORMULAX_WRAPPER_VALID_ELEMENTS},${FORMULAX_SVG_VALID_ELEMENTS},${FORMULAX_IMAGE_VALID_ELEMENTS}`,
      );

      const open = (target?: HTMLElement | null): void => {
        const resolvedTarget = target ?? compat.getSelectedFormulaElement();

        openFormulaXOverlayModal({
          editor,
          target: resolvedTarget,
          initialLatex: resolvedTarget ? undefined : resolved.initialLatex,
          options: resolved,
        });
      };

      editor.addCommand('FormulaXOpen', () => {
        open();
      });

      editor.ui?.registry?.addContext?.(FORMULAX_TINYMCE_CONTEXT_NAME, (value: string) => {
        if (value !== 'enabled') {
          return false;
        }

        return isFormulaXActionEnabled(editor, compat);
      });

      editor.ui?.registry?.addIcon?.(resolved.formulaIconName, resolved.formulaIcon);

      editor.ui?.registry?.addButton?.(resolved.buttonName, {
        icon: resolved.formulaIconName,
        tooltip: resolved.tooltip,
        context: `${FORMULAX_TINYMCE_CONTEXT_NAME}:enabled`,
        onAction: () => editor.execCommand('FormulaXOpen'),
      });

      editor.ui?.registry?.addMenuItem?.(resolved.menuItemName, {
        icon: resolved.formulaIconName,
        text: resolved.toolbarText,
        context: `${FORMULAX_TINYMCE_CONTEXT_NAME}:enabled`,
        onAction: () => editor.execCommand('FormulaXOpen'),
      });

      editor.on('init', () => {
        ensureTinyMceStyles(document);
        const editorDoc = editor.getDoc?.();
        if (editorDoc) {
          ensureTinyMceStyles(editorDoc);
          hydrateTinyMceFormulaElements(editorDoc.body, resolved);
        }

        preloadCleanup = scheduleFormulaXEditorPreload(
          resolved.preload,
          editor.getBody?.() ?? null,
        );
      });

      editor.on('BeforeSetContent', (event: { content?: string }) => {
        if (typeof event.content !== 'string') {
          return;
        }

        event.content = prepareTinyMceFormulaHtml(event.content, resolved);
      });

      editor.on('SetContent', () => {
        const editorDoc = editor.getDoc?.();
        if (editorDoc) {
          hydrateTinyMceFormulaElements(editorDoc.body, resolved);
        }
      });

      editor.on('dblclick', (event: unknown) => {
        const formula = findFormulaElement((event as MouseEvent).target as Node);
        if (!formula) return;
        (event as Event).preventDefault?.();
        open(formula);
      });

      editor.on('keydown', (event: unknown) => {
        const e = event as KeyboardEvent;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const formula = compat.getSelectedFormulaElement();
        if (!formula) return;
        e.preventDefault?.();
        open(formula);
      });

      editor.on('GetContent', (event: { content?: string }) => {
        if (typeof event.content !== 'string') {
          return;
        }

        event.content = serializeFormulaHtml(event.content, {
          attributeName: resolved.formulaAttributeName,
          output: resolved.output,
        });
      });

      editor.on('remove', () => {
        preloadCleanup?.();
        preloadCleanup = null;
      });

      return undefined;
    },
  );
}

function prepareTinyMceFormulaHtml(
  html: string,
  options: RequiredFormulaXTinyMceOptions,
): string {
  if (typeof document === 'undefined') {
    return html;
  }

  const container = document.createElement('div');
  container.innerHTML = html;
  prepareTinyMceFormulaElements(container, options);
  return container.innerHTML;
}

function isFormulaXActionEnabled(
  editor: TinyMceEditorLike,
  compat: ReturnType<typeof createTinyMceCompat>,
): boolean {
  const mode = (editor as TinyMceEditorLike & {
    mode?: { get?: () => string };
  }).mode?.get?.();

  if (typeof mode === 'string' && mode !== 'design') {
    return false;
  }

  if (editor.selection?.isEditable?.()) {
    return true;
  }

  return Boolean(compat.getSelectedFormulaElement());
}

function hydrateTinyMceFormulaElements(
  root: HTMLElement | null | undefined,
  options: RequiredFormulaXTinyMceOptions,
): void {
  prepareTinyMceFormulaElements(root, options).forEach((element) => {
    void renderTinyMceFormulaElement(element, options);
  });
}

function prepareTinyMceFormulaElements(
  root: HTMLElement | null | undefined,
  options: RequiredFormulaXTinyMceOptions,
): HTMLElement[] {
  if (!root) {
    return [];
  }

  const elements: HTMLElement[] = [];

  root.querySelectorAll<HTMLElement>(`[${options.formulaAttributeName}]`).forEach((element) => {
    if (element.getAttribute(FORMULA_FLAG_ATTRIBUTE) !== 'true') {
      return;
    }

    if (getFormulaOutputFromElement(element) !== 'latex') {
      return;
    }

    const latex = element.getAttribute(options.formulaAttributeName)
      ?? element.getAttribute('data-latex')
      ?? '';
    if (!element.innerHTML.trim()) {
      element.innerHTML = createFormulaSourceHtml(latex, options.formulaClassName);
    }
    elements.push(element);
  });

  return elements;
}

async function renderTinyMceFormulaElement(
  element: HTMLElement,
  options: RequiredFormulaXTinyMceOptions,
): Promise<void> {
  const latex = element.getAttribute(options.formulaAttributeName)
    ?? element.getAttribute('data-latex')
    ?? '';

  if (!latex.trim()) {
    return;
  }

  try {
    const rendered = await options.renderer.renderLatex(latex, {
      fontSize: options.editor.render?.fontsize ?? 40,
      className: options.formulaClassName,
    });

    if (
      element.isConnected
      && element.getAttribute(FORMULA_FLAG_ATTRIBUTE) === 'true'
      && getFormulaOutputFromElement(element) === 'latex'
      && (element.getAttribute(options.formulaAttributeName) ?? element.getAttribute('data-latex') ?? '') === latex
    ) {
      element.innerHTML = rendered.html;
    }
  } catch {
    element.innerHTML = createFormulaSourceHtml(latex, options.formulaClassName);
  }
}
