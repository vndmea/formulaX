import type { TinyMceEditorLike, TinyMceLike } from './types';
import { findFormulaElement } from './markup';

export interface TinyMceCompat {
  major: number;
  insertContent: (html: string) => void;
  dispatchEvent: (name: string, detail?: Record<string, unknown>) => void;
  getSelectedFormulaElement: () => HTMLElement | null;
  getEditorDocument: () => Document;
  getEditorWindow: () => Window;
  getEditorBody: () => HTMLElement | null;
  focus: () => void;
}

export function getTinyMceMajorVersion(tinymce?: TinyMceLike): number {
  const raw = tinymce?.majorVersion;
  const major = typeof raw === 'string' ? Number.parseInt(raw, 10) : Number(raw);
  return Number.isFinite(major) ? major : 0;
}

export function createTinyMceCompat(
  editor: TinyMceEditorLike,
  tinymce?: TinyMceLike,
): TinyMceCompat {
  const major = getTinyMceMajorVersion(tinymce);

  return {
    major,

    insertContent(html: string): void {
      editor.insertContent(html);
    },

    dispatchEvent(name: string, detail?: Record<string, unknown>): void {
      if (typeof editor.dispatch === 'function') {
        editor.dispatch(name, detail);
        return;
      }

      if (typeof editor.fire === 'function') {
        editor.fire(name, detail);
      }
    },

    getSelectedFormulaElement(): HTMLElement | null {
      const node = editor.selection?.getNode?.();
      return findFormulaElement(node ?? null);
    },

    getEditorDocument(): Document {
      return editor.getDoc?.() ?? document;
    },

    getEditorWindow(): Window {
      return editor.getWin?.() ?? window;
    },

    getEditorBody(): HTMLElement | null {
      return editor.getBody?.() ?? null;
    },

    focus(): void {
      editor.focus?.();
    },
  };
}

export function warnUnsupportedTinyMceVersion(tinymce?: TinyMceLike): void {
  const major = getTinyMceMajorVersion(tinymce);
  if (major > 0 && (major < 5 || major >= 9)) {
    console.warn(`[FormulaX] TinyMCE ${major} is not officially supported. Expected >=5 <9.`);
  }
}
