import { getLegacyKity } from '../vendor/runtime-interop';
import type { LegacyEditorInstance } from './editor';

type CanvasLike = {
  width: number;
  height: number;
  node: {
    setAttribute: (name: string, value: string | number) => void;
  };
  container: {
    getRenderBox: () => {
      width: number;
      height: number;
    };
  };
};

type PaperLike = {
  toPNG: (callback: (dataUrl: string) => void) => void;
};

type PrinterComponentInstance = {
  kfEditor: LegacyEditorInstance;
  initServices: () => void;
  initCommands: () => void;
  printImage: (type?: string) => void;
  getImageData: (cb: (payload: { width: number; height: number; img: string }) => void) => void;
  _formatCanvas: () => void;
  _restoreCanvas: () => void;
};

const kity = getLegacyKity();

const Printer = kity.createClass('Printer', {
  constructor(this: PrinterComponentInstance, kfEditor: LegacyEditorInstance) {
    this.kfEditor = kfEditor;
    this.initServices();
    this.initCommands();
  },

  initServices(this: PrinterComponentInstance) {
    this.kfEditor.registerService('print.image', this, {
      printImage: this.printImage,
    });
  },

  initCommands(this: PrinterComponentInstance) {
    this.kfEditor.registerCommand('get.image.data', this, this.getImageData);
  },

  printImage(this: PrinterComponentInstance) {
    const formula = this.kfEditor.requestService('render.get.paper') as PaperLike;

    this._formatCanvas();

    formula.toPNG((dataUrl) => {
      document.body.innerHTML = `<img style="background: red;" src="${dataUrl}">`;
    });

    this._restoreCanvas();
  },

  getImageData(this: PrinterComponentInstance, cb: (payload: { width: number; height: number; img: string }) => void) {
    const canvas = this.kfEditor.requestService('render.get.canvas') as CanvasLike;
    const formula = this.kfEditor.requestService('render.get.paper') as PaperLike;

    this._formatCanvas();

    formula.toPNG((dataUrl) => {
      cb({
        width: canvas.width,
        height: canvas.height,
        img: dataUrl,
      });
    });

    this._restoreCanvas();
  },

  _formatCanvas(this: PrinterComponentInstance) {
    const canvas = this.kfEditor.requestService('render.get.canvas') as CanvasLike;
    const rect = canvas.container.getRenderBox();

    canvas.node.setAttribute('width', rect.width);
    canvas.node.setAttribute('height', rect.height);

    this.kfEditor.requestService('render.clear.canvas.transform');
    this.kfEditor.requestService('control.cursor.hide');
    this.kfEditor.requestService('render.clear.select');
  },

  _restoreCanvas(this: PrinterComponentInstance) {
    const canvas = this.kfEditor.requestService('render.get.canvas') as CanvasLike;

    canvas.node.setAttribute('width', '100%');
    canvas.node.setAttribute('height', '100%');

    this.kfEditor.requestService('render.revert.canvas.transform');
    this.kfEditor.requestService('control.cursor.relocation');
    this.kfEditor.requestService('render.reselect');
  },
});

export default Printer as new (kfEditor: LegacyEditorInstance) => PrinterComponentInstance;
