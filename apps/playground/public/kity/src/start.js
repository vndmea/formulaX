import KFEditor from './editor/editor.js';
import Factory from './editor/factory.js';
import UIComponent from './ui/ui.js';
import Parser from './parse/parser.js';
import Render from './render/render.js';
import Position from './position/position.js';
import Syntax from './syntax/syntax.js';
import Controller from './control/controller.js';
import Printer from './print/printer.js';

KFEditor.registerComponents('ui', UIComponent);
KFEditor.registerComponents('parser', Parser);
KFEditor.registerComponents('render', Render);
KFEditor.registerComponents('position', Position);
KFEditor.registerComponents('syntax', Syntax);
KFEditor.registerComponents('control', Controller);
KFEditor.registerComponents('print', Printer);

window.kf = window.kf || {};
window.kf.EditorFactory = Factory;

export { KFEditor, Factory };
export default Factory;
