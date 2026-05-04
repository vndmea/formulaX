import { legacyKfEvent } from './legacy-kfevent';

const eventListenerStore: Record<number, Record<string, Array<((event: Event) => boolean | void) | undefined>>> = {};
let eventId = 0;
let beforeResult = true;

type LegacyEventTarget = EventTarget & {
  __kfeEventId?: number;
  __kfe_eid?: number;
};

function getLegacyEventId(target: LegacyEventTarget) {
  return target.__kfeEventId ?? target.__kfe_eid;
}

function setLegacyEventId(target: LegacyEventTarget, resolvedEventId: number) {
  target.__kfeEventId = resolvedEventId;

  if (Object.prototype.hasOwnProperty.call(target, '__kfe_eid')) {
    target.__kfe_eid = resolvedEventId;
    return;
  }

  Object.defineProperty(target, '__kfe_eid', {
    configurable: true,
    enumerable: true,
    get() {
      return target.__kfeEventId;
    },
    set(value: number) {
      target.__kfeEventId = value;
    },
  });
}

const eventHandler = function eventHandler(this: LegacyEventTarget, event: Event) {
  const type = event.type;
  const target = event.target as EventTarget;
  const eid = getLegacyEventId(this) as number;
  const hasAutoTrigger = /^(?:before|after)/.test(type);
  const handlerList = eventListenerStore[eid]?.[type] ?? [];

  if (!hasAutoTrigger) {
    legacyEventListener.trigger(target, `before${type}`);

    if (beforeResult === false) {
      beforeResult = true;
      return false;
    }
  }

  for (const handler of handlerList) {
    if (!handler) {
      continue;
    }

    if (handler.call(target, event) === false) {
      beforeResult = false;
      break;
    }
  }

  if (!hasAutoTrigger) {
    legacyEventListener.trigger(target, `after${type}`);
  }

  return true;
};

export const legacyEventListener = {
  addEvent(target: LegacyEventTarget, type: string, handler: (event: Event) => boolean | void) {
    let hasHandler = true;

    if (!getLegacyEventId(target)) {
      hasHandler = false;
      setLegacyEventId(target, ++eventId);
      eventListenerStore[getLegacyEventId(target) as number] = {};
    }

    const eventCache = eventListenerStore[getLegacyEventId(target) as number];

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
