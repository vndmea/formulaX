import ListenerComponent from './listener';
import { getKityGraphicsRuntime } from '../../kity-compat/runtime-context';
import type { KityRuntimeEditorInstance } from './editor';

type ControllerInstance = {
  kfEditor: KityRuntimeEditorInstance;
  components: Record<string, unknown>;
  initComponents: () => void;
};

const kity = getKityGraphicsRuntime();

const ControllerComponent = kity.createClass('ControllerComponent', {
  constructor(this: ControllerInstance, kfEditor: KityRuntimeEditorInstance) {
    this.kfEditor = kfEditor;
    this.components = {};
    this.initComponents();
  },

  initComponents(this: ControllerInstance) {
    this.components.listener = new ListenerComponent(this, this.kfEditor);
  },
});

export default ControllerComponent;
