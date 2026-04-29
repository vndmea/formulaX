import InputComponent from './input';
import LocationComponent from './location';
import SelectionComponent from './selection';
import { getLegacyKity } from '../vendor/runtime-interop';
import type { LegacyEditorInstance } from './editor';

type ListenerComponentInstance = {
  parentComponent: unknown;
  kfEditor: LegacyEditorInstance;
  components: {
    location?: unknown;
    selection?: unknown;
    input?: unknown;
  };
  initComponents: () => void;
};

const kity = getLegacyKity();

const ListenerComponent = kity.createClass('MoveComponent', {
  constructor(this: ListenerComponentInstance, parentComponent: unknown, kfEditor: LegacyEditorInstance) {
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

export default ListenerComponent as new (parentComponent: unknown, kfEditor: LegacyEditorInstance) => ListenerComponentInstance;
