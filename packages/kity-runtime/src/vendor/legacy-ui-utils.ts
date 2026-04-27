import { addEvent, createElement, delegateEvent, getClassList, getRectBox, publish, subscribe } from '../dom-utils';

export function createLegacyUiUtils() {
  return {
    ele: createElement,
    getRectBox,
    on(target: EventTarget | null, type: string, fn: (event: Event) => void) {
      addEvent(target, type, fn);
      return this;
    },
    delegate(target: EventTarget | null, selector: string, type: string, fn: (event: Event) => void) {
      delegateEvent(target, selector, type, fn);
      return this;
    },
    publish(topic: string, ...args: unknown[]) {
      publish(topic, ...args);
    },
    subscribe,
    getClassList,
  };
}
