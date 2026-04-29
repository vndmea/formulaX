import KFEditor from '../legacy/editor';
import Factory from '../legacy/factory';
import UIComponent from '../../../kity-assets/public/src/ui/ui.js';
import Parser from '../legacy/parser';
import Render from '../../../kity-assets/public/src/render/render.js';
import Position from '../legacy/position';
import Syntax from '../legacy/syntax';
import Controller from '../legacy/controller';
import Printer from '../legacy/printer';

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
    KFEditor.registerComponents('ui', UIComponent);
    KFEditor.registerComponents('parser', Parser);
    KFEditor.registerComponents('render', Render);
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
