import { legacyBaseUtils } from '../vendor/legacy-utils';
import { legacyInputFilter } from '../vendor/legacy-input-filter';
import { getLegacyKity } from '../vendor/runtime-interop';
import type { LegacyEditorInstance } from './editor';

type ExtendedInputElement = HTMLInputElement & {
  isTrusted: boolean;
};

type LatexInfo = {
  str: string;
  startOffset: number;
  endOffset: number;
};

type RootGroupInfo = {
  id: string;
  content: unknown[];
};

type InputComponentInstance = {
  parentComponent: unknown;
  kfEditor: LegacyEditorInstance;
  inputBox: ExtendedInputElement;
  initServices: () => void;
  initCommands: () => void;
  initEvent: () => void;
  createInputBox: () => ExtendedInputElement;
  focus: () => void;
  setUntrusted: () => void;
  setTrusted: () => void;
  updateInput: () => void;
  insertStr: (str: string) => void;
  hasRootplaceholder: () => boolean;
  leftMove: () => void;
  rightMove: () => void;
  delete: () => void;
  processUserCtrl: (e: KeyboardEvent) => void;
  pretreatmentInput: (evt: KeyboardEvent) => boolean;
  getKeyCode: (e: KeyboardEvent) => string;
  processingInput: () => void;
  restruct: (latexStr: string) => void;
  update: () => void;
};

const KEY_CODE = {
  LEFT: 37,
  RIGHT: 39,
  DELETE: 8,
  INPUT: 229,
};

const kity = getLegacyKity();

const InputComponent = kity.createClass('InputComponent', {
  constructor(this: InputComponentInstance, parentComponent: unknown, kfEditor: LegacyEditorInstance) {
    this.parentComponent = parentComponent;
    this.kfEditor = kfEditor;
    this.inputBox = this.createInputBox();
    this.initServices();
    this.initCommands();
    this.initEvent();
  },

  initServices(this: InputComponentInstance) {
    this.kfEditor.registerService('control.update.input', this, {
      updateInput: this.updateInput,
    });

    this.kfEditor.registerService('control.insert.string', this, {
      insertStr: this.insertStr,
    });
  },

  initCommands(this: InputComponentInstance) {
    this.kfEditor.registerCommand('focus', this, this.focus);
  },

  createInputBox(this: InputComponentInstance) {
    const editorContainer = this.kfEditor.getContainer();
    const box = this.kfEditor.getDocument().createElement('input') as ExtendedInputElement;

    box.className = 'kf-editor-input-box';
    box.type = 'text';
    box.isTrusted = false;

    editorContainer.appendChild(box);

    return box;
  },

  focus(this: InputComponentInstance) {
    this.inputBox.focus();

    if (!this.kfEditor.requestService('syntax.has.cursor.info')) {
      const rootInfo = this.kfEditor.requestService('syntax.get.root.group.info') as RootGroupInfo;

      this.kfEditor.requestService('syntax.update.record.cursor', {
        groupId: rootInfo.id,
        startOffset: 0,
        endOffset: rootInfo.content.length,
      });

      this.kfEditor.requestService('control.update.input');
    }

    this.kfEditor.requestService('control.reselect');
  },

  setUntrusted(this: InputComponentInstance) {
    this.inputBox.isTrusted = false;
  },

  setTrusted(this: InputComponentInstance) {
    this.inputBox.isTrusted = true;
  },

  updateInput(this: InputComponentInstance) {
    const latexInfo = this.kfEditor.requestService('syntax.serialization') as LatexInfo;

    this.setUntrusted();
    this.inputBox.value = latexInfo.str;
    this.inputBox.selectionStart = latexInfo.startOffset;
    this.inputBox.selectionEnd = latexInfo.endOffset;
    this.inputBox.focus();
    this.setTrusted();
  },

  insertStr(this: InputComponentInstance, str: string) {
    const latexInfo = this.kfEditor.requestService('syntax.serialization') as LatexInfo;

    let originString = latexInfo.str;
    originString = originString.substring(0, latexInfo.startOffset) + ` ${str} ` + originString.substring(latexInfo.endOffset);

    this.restruct(originString);
    this.updateInput();
    this.kfEditor.requestService('ui.update.canvas.view');
  },

  initEvent(this: InputComponentInstance) {
    legacyBaseUtils.addEvent(this.inputBox, 'keydown', (e: KeyboardEvent) => {
      let isControl = false;

      if (e.ctrlKey) {
        this.processUserCtrl(e);
        return;
      }

      switch (e.keyCode) {
        case KEY_CODE.INPUT:
          return;
        case KEY_CODE.LEFT:
          e.preventDefault();
          this.leftMove();
          isControl = true;
          break;
        case KEY_CODE.RIGHT:
          e.preventDefault();
          this.rightMove();
          isControl = true;
          break;
        case KEY_CODE.DELETE:
          e.preventDefault();
          this.delete();
          isControl = true;
          break;
      }

      if (isControl) {
        this.kfEditor.requestService('ui.update.canvas.view');
      }

      if (!this.pretreatmentInput(e)) {
        e.preventDefault();
      }
    });

    legacyBaseUtils.addEvent(this.inputBox, 'input', () => {
      this.processingInput();
    });

    legacyBaseUtils.addEvent(this.inputBox, 'blur', () => {
      this.kfEditor.requestService('ui.toolbar.disable');
      this.kfEditor.requestService('ui.toolbar.close');
      this.kfEditor.requestService('control.cursor.hide');
      this.kfEditor.requestService('render.clear.select');
    });

    legacyBaseUtils.addEvent(this.inputBox, 'focus', () => {
      this.kfEditor.requestService('ui.toolbar.enable');

      if (this.inputBox.isTrusted) {
        this.kfEditor.requestService('control.reselect');
      }
    });

    legacyBaseUtils.addEvent(this.inputBox, 'paste', (e: ClipboardEvent) => {
      e.preventDefault();
    });
  },

  hasRootplaceholder(this: InputComponentInstance) {
    return this.kfEditor.requestService('syntax.has.root.placeholder') as boolean;
  },

  leftMove(this: InputComponentInstance) {
    if (this.hasRootplaceholder()) {
      return;
    }

    this.kfEditor.requestService('syntax.cursor.move.left');
    this.update();
  },

  rightMove(this: InputComponentInstance) {
    if (this.hasRootplaceholder()) {
      return;
    }

    this.kfEditor.requestService('syntax.cursor.move.right');
    this.update();
  },

  delete(this: InputComponentInstance) {
    if (this.hasRootplaceholder()) {
      return;
    }

    const isNeedRedraw = this.kfEditor.requestService('syntax.delete.group') as boolean;

    if (isNeedRedraw) {
      this.updateInput();
      this.processingInput();
      return;
    }

    this.updateInput();
    this.kfEditor.requestService('control.reselect');
  },

  processUserCtrl(this: InputComponentInstance, e: KeyboardEvent) {
    e.preventDefault();

    switch (e.keyCode) {
      case 65:
        this.kfEditor.requestService('control.select.all');
        break;
      case 83:
        this.kfEditor.requestService('print.image');
        break;
    }
  },

  pretreatmentInput(this: InputComponentInstance, evt: KeyboardEvent) {
    const keyCode = this.getKeyCode(evt);
    const replaceStr = legacyInputFilter.getReplaceString(keyCode);

    if (replaceStr === null) {
      return true;
    }

    this.insertStr(replaceStr);
    return false;
  },

  getKeyCode(this: InputComponentInstance, e: KeyboardEvent) {
    return `${e.shiftKey ? 's+' : ''}${e.keyCode}`;
  },

  processingInput(this: InputComponentInstance) {
    this.restruct(this.inputBox.value);
    this.kfEditor.requestService('ui.update.canvas.view');
  },

  restruct(this: InputComponentInstance, latexStr: string) {
    this.kfEditor.requestService('render.draw', latexStr);
    this.kfEditor.requestService('control.reselect');
  },

  update(this: InputComponentInstance) {
    this.updateInput();
    this.kfEditor.requestService('control.reselect');
  },
});

export default InputComponent as new (parentComponent: unknown, kfEditor: LegacyEditorInstance) => InputComponentInstance;
