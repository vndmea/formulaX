import { bind, isArray, isString } from 'lodash-es';
import utils from '../kity/utils';
import { legacyEventListener } from './legacy-event';

export type LegacyBaseUtils = {
  addEvent: typeof legacyEventListener.addEvent;
  trigger: typeof legacyEventListener.trigger;
  each: typeof utils.each;
  extend: typeof utils.extend;
  clone: typeof utils.clone;
  copy: typeof utils.copy;
  isArray: typeof isArray;
  isString: typeof isString;
  proxy: typeof bind;
  contains(parent: Node, target: Node): boolean;
  getRect(node: Element): DOMRect;
};

const legacyBaseUtils: LegacyBaseUtils = {
  addEvent: legacyEventListener.addEvent,
  trigger: legacyEventListener.trigger,
  each: utils.each,
  extend: utils.extend,
  clone: utils.clone,
  copy: utils.copy,
  isArray,
  isString,
  proxy: bind,
  contains(parent: Node, target: Node) {
    if (parent.contains) {
      return parent.contains(target);
    }
    if (parent.compareDocumentPosition) {
      return !!(parent.compareDocumentPosition(target) & 16);
    }
    return false;
  },
  getRect(node: Element) {
    return node.getBoundingClientRect();
  },
};

export { legacyBaseUtils };
