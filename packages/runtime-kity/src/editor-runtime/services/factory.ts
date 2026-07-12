import KFEditor, { type KityRuntimeEditorInstance } from './editor';
import { getKityGraphicsRuntime } from '../../kity-compat/runtime-context';

type EditorReadyCallback = (this: KityRuntimeEditorInstance, editor: KityRuntimeEditorInstance) => void;
export type EditorWrapperHandle = {
  ready: (callback: EditorReadyCallback) => void;
};

export type KityEditorFactory = {
  create: (container: HTMLElement, options?: Record<string, unknown>) => EditorWrapperHandle;
};

class EditorWrapper {
  private readonly callbacks: EditorReadyCallback[] = [];
  readonly editor: KityRuntimeEditorInstance;

  constructor(container: HTMLElement, options?: Record<string, unknown>) {
    this.editor = new KFEditor(container, options);
    this.editor.ready(() => {
      this.trigger();
    });
  }

  private trigger() {
    const editor = this.editor;

    getKityGraphicsRuntime().Utils.each(this.callbacks, (callback: EditorReadyCallback) => {
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

const factory: KityEditorFactory = {
  create(container: HTMLElement, options?: Record<string, unknown>) {
    return new EditorWrapper(container, options);
  },
};

export default factory;
