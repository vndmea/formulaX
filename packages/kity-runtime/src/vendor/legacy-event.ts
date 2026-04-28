import { legacyCommonUtils } from './legacy-common';
import { legacyKfEvent } from './legacy-kfevent';

const eventListenerStore: Record<number, Record<string, Array<((event: Event) => boolean | void) | undefined>>> = {};
let eventId = 0;
let beforeResult = true;

const eventHandler = function eventHandler(this: EventTarget & { __kfe_eid?: number }, event: Event) {
  const type = event.type;
  const target = event.target as EventTarget;
  const eid = this.__kfe_eid as number;
  const hasAutoTrigger = /^(?:before|after)/.test(type);
  const handlerList = eventListenerStore[eid]?.[type] ?? [];

  if (!hasAutoTrigger) {
    legacyEventListener.trigger(target, `before${type}`);

    if (beforeResult === false) {
      beforeResult = true;
      return false;
    }
  }

  legacyCommonUtils.each(handlerList, (handler) => {
    if (!handler) {
      return;
    }

    if (handler.call(target, event) === false) {
      beforeResult = false;
      return beforeResult;
    }
  });

  if (!hasAutoTrigger) {
    legacyEventListener.trigger(target, `after${type}`);
  }

  return true;
};

export const legacyEventListener = {
  addEvent(target: EventTarget & { __kfe_eid?: number }, type: string, handler: (event: Event) => boolean | void) {
    let hasHandler = true;

    if (!target.__kfe_eid) {
      hasHandler = false;
      target.__kfe_eid = ++eventId;
      eventListenerStore[target.__kfe_eid] = {};
    }

    const eventCache = eventListenerStore[target.__kfe_eid];

    if (!eventCache[type]) {
      hasHandler = false;
      eventCache[type] = [];
    }

    eventCache[type].push(handler);

    if (hasHandler) {
      return;
    }

    target.addEventListener(type, eventHandler as EventListener, false);
  },

  trigger(target: EventTarget, type: string, event?: Event) {
    const resolvedEvent = event || legacyKfEvent.createEvent(type);
    target.dispatchEvent(resolvedEvent);
  },
};
