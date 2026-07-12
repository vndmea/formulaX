import KFEditor, { type KityRuntimeEditorInstance } from '../editor-runtime/services/editor';
import Factory from '../editor-runtime/services/factory';
import UIComponent from '../editor-runtime/components/ui';
import Parser from '../editor-runtime/services/parser';
import Render from '../editor-runtime/services/render';
import Position from '../editor-runtime/services/position';
import Syntax from '../editor-runtime/services/syntax';
import Controller from '../editor-runtime/services/controller';
import Printer from '../editor-runtime/services/printer';

type RuntimeWindow = Window &
  typeof globalThis & {
    kf?: Record<string, unknown> & {
      EditorFactory?: typeof Factory;
    };
  };

let installed = false;

export function installKityEditorStart(target: Window & typeof globalThis = window) {
  const runtimeTarget = target as RuntimeWindow;

  if (!installed) {
    KFEditor.registerComponents('ui', UIComponent as unknown as new (editor: KityRuntimeEditorInstance, options?: unknown) => unknown);
    KFEditor.registerComponents('parser', Parser);
    KFEditor.registerComponents('render', Render as unknown as new (editor: KityRuntimeEditorInstance, options?: unknown) => unknown);
    KFEditor.registerComponents('position', Position);
    KFEditor.registerComponents('syntax', Syntax);
    KFEditor.registerComponents('control', Controller);
    KFEditor.registerComponents('print', Printer);
    installed = true;
  }

  runtimeTarget.kf = runtimeTarget.kf ?? {};
  runtimeTarget.kf.EditorFactory = Factory;

  return {
    KFEditor,
    Factory,
  };
}

export { KFEditor, Factory };

export default installKityEditorStart;
