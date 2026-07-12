import InputComponent from './input';
import LocationComponent from './location';
import SelectionComponent from './selection';
import { getKityGraphicsRuntime } from '../../kity-compat/runtime-context';
import type { KityRuntimeEditorInstance } from './editor';

type ListenerComponentInstance = {
  parentComponent: unknown;
  kfEditor: KityRuntimeEditorInstance;
  components: {
    location?: unknown;
    selection?: unknown;
    input?: unknown;
  };
  initComponents: () => void;
};

const kity = getKityGraphicsRuntime();

const ListenerComponent = kity.createClass('MoveComponent', {
  constructor(this: ListenerComponentInstance, parentComponent: unknown, kfEditor: KityRuntimeEditorInstance) {
    this.parentComponent = parentComponent;
    this.kfEditor = kfEditor;
    this.components = {};
    this.initComponents();
  },

  initComponents(this: ListenerComponentInstance) {
    this.components.location = new LocationComponent(this, this.kfEditor);
    this.components.selection = new SelectionComponent(this, this.kfEditor);
    this.components.input = new InputComponent(this, this.kfEditor);
  },
});

export default ListenerComponent as new (parentComponent: unknown, kfEditor: KityRuntimeEditorInstance) => ListenerComponentInstance;
