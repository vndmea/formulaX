import { getLegacyKf, getLegacyKity } from '../vendor/runtime-interop';
import PlaceholderOperator from './kf-ext-placeholder-operator';

type PlaceholderExpressionInstance = {
  label: string | null;
  box: {
    setAttr: (name: string | Record<string, unknown>, value?: unknown) => void;
  };
  setFlag: (flag: string) => void;
  setOperator: (operator: unknown) => void;
  getOperator: () => {
    select: () => void;
    selectAll: () => void;
    unselect: () => void;
  };
  setLabel: (label: string) => void;
  getLabel: () => string | null;
  setAttr: (key: string | Record<string, any>, val?: unknown) => void;
  select: () => void;
  selectAll: () => void;
  unselect: () => void;
};

const kity = getLegacyKity() as any;
const kf = getLegacyKf() as any;
const BaseCompoundExpression = kf.CompoundExpression;

const PlaceholderExpression = kity.createClass('PlaceholderExpression', {
  base: kf.CompoundExpression,

  constructor(this: PlaceholderExpressionInstance) {
    if (false) {
      (this as any).callBase();
    }
    BaseCompoundExpression.call(this);
    this.setFlag('Placeholder');
    this.label = null;
    this.box.setAttr('data-type', null);
    this.setOperator(new PlaceholderOperator());
  },

  setLabel(this: PlaceholderExpressionInstance, label: string) {
    this.label = label;
  },

  getLabel(this: PlaceholderExpressionInstance) {
    return this.label;
  },

  setAttr(this: PlaceholderExpressionInstance, key: string | Record<string, any>, val?: unknown) {
    if (key === 'label') {
      this.setLabel(val as string);
      return;
    }

    if (typeof key === 'object' && key.label) {
      this.setLabel(key.label);
      delete key.label;
    }

    BaseCompoundExpression.prototype.setAttr.call(this, key, val);
  },

  select(this: PlaceholderExpressionInstance) {
    this.getOperator().select();
  },

  selectAll(this: PlaceholderExpressionInstance) {
    this.getOperator().selectAll();
  },

  unselect(this: PlaceholderExpressionInstance) {
    this.getOperator().unselect();
  },
});

export default PlaceholderExpression;
