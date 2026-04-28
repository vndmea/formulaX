import KFEditor from '../../../../apps/playground/public/kity/src/editor/editor.js';
import Factory from '../../../../apps/playground/public/kity/src/editor/factory.js';
import UIComponent from '../../../../apps/playground/public/kity/src/ui/ui.js';
import Parser from '../../../../apps/playground/public/kity/src/parse/parser.js';
import Render from '../../../../apps/playground/public/kity/src/render/render.js';
import Position from '../../../../apps/playground/public/kity/src/position/position.js';
import Syntax from '../../../../apps/playground/public/kity/src/syntax/syntax.js';
import Controller from '../../../../apps/playground/public/kity/src/control/controller.js';
import Printer from '../../../../apps/playground/public/kity/src/print/printer.js';

type RuntimeWindow = Window &
  typeof globalThis & {
    kf?: Record<string, unknown> & {
      EditorFactory?: typeof Factory;
    };
  };

let installed = false;

export function installKityEditorStart(target: RuntimeWindow = window as RuntimeWindow) {
  if (!installed) {
    KFEditor.registerComponents('ui', UIComponent);
    KFEditor.registerComponents('parser', Parser);
    KFEditor.registerComponents('render', Render);
    KFEditor.registerComponents('position', Position);
    KFEditor.registerComponents('syntax', Syntax);
    KFEditor.registerComponents('control', Controller);
    KFEditor.registerComponents('print', Printer);
    installed = true;
  }

  target.kf = target.kf ?? {};
  target.kf.EditorFactory = Factory;

  return {
    KFEditor,
    Factory,
  };
}

export { KFEditor, Factory };

export default installKityEditorStart;
