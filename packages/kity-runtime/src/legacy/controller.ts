import ListenerComponent from '../../../kity-assets/public/src/control/listener.js';
import { getLegacyKity } from '../vendor/runtime-interop';
import type { LegacyEditorInstance } from './editor';

type ControllerInstance = {
  kfEditor: LegacyEditorInstance;
  components: Record<string, unknown>;
  initComponents: () => void;
};

const kity = getLegacyKity();

const ControllerComponent = kity.createClass('ControllerComponent', {
  constructor(this: ControllerInstance, kfEditor: LegacyEditorInstance) {
    this.kfEditor = kfEditor;
    this.components = {};
    this.initComponents();
  },

  initComponents(this: ControllerInstance) {
    this.components.listener = new ListenerComponent(this, this.kfEditor);
  },
});

export default ControllerComponent;
