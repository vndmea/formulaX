import KFEditor, { type LegacyEditorInstance } from './editor';
import { getLegacyKity } from '../vendor/runtime-interop';

type EditorReadyCallback = (this: LegacyEditorInstance, editor: LegacyEditorInstance) => void;
export type EditorWrapperHandle = {
  ready: (callback: EditorReadyCallback) => void;
};

export type LegacyEditorFactory = {
  create: (container: HTMLElement, options?: Record<string, unknown>) => EditorWrapperHandle;
};

class EditorWrapper {
  private readonly callbacks: EditorReadyCallback[] = [];
  readonly editor: LegacyEditorInstance;

  constructor(container: HTMLElement, options?: Record<string, unknown>) {
    this.editor = new KFEditor(container, options);
    this.editor.ready(() => {
      this.trigger();
    });
  }

  private trigger() {
    const editor = this.editor;

    getLegacyKity().Utils.each(this.callbacks, (callback: EditorReadyCallback) => {
      callback.call(editor, editor);
    });
  }

  ready(callback: EditorReadyCallback) {
    if (this.editor.isReady()) {
      callback.call(this.editor, this.editor);
      return;
    }

    this.callbacks.push(callback);
  }
}

const factory: LegacyEditorFactory = {
  create(container: HTMLElement, options?: Record<string, unknown>) {
    return new EditorWrapper(container, options);
  },
};

export default factory;
