import { kityEvent } from './kf-event';

type KfEventHandler<T extends Event = Event> = (event: T) => boolean | void;
const eventListenerStore: Record<number, Record<string, any[]>> = {};
let eventId = 0;
let beforeResult = true;

type KityEventTarget = EventTarget & {
  __kfeEventId?: number;
  __kfe_eid?: number;
};

function getKityEventId(target: KityEventTarget) {
  return target.__kfeEventId ?? target.__kfe_eid;
}

function setKityEventId(target: KityEventTarget, resolvedEventId: number) {
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

const eventHandler = function eventHandler(this: KityEventTarget, event: Event) {
  const type = event.type;
  const target = event.target as EventTarget;
  const eid = getKityEventId(this) as number;
  const hasAutoTrigger = /^(?:before|after)/.test(type);
  const handlerList: KfEventHandler[] = eventListenerStore[eid]?.[type] ?? [];

  if (!hasAutoTrigger) {
    kityEventListener.trigger(target, `before${type}`);

    if (beforeResult === false) {
      beforeResult = true;
      return false;
    }
  }

  for (const handler of handlerList) {
    if (handler.call(target, event) === false) {
      beforeResult = false;
      break;
    }
  }

  if (!hasAutoTrigger) {
    kityEventListener.trigger(target, `after${type}`);
  }

  return true;
};

export const kityEventListener = {
  addEvent<T extends Event = Event>(target: KityEventTarget, type: string, handler: (event: T) => boolean | void) {
    let hasHandler = true;

    if (!getKityEventId(target)) {
      hasHandler = false;
      setKityEventId(target, ++eventId);
      eventListenerStore[getKityEventId(target) as number] = {};
    }

    const eventCache = eventListenerStore[getKityEventId(target) as number];

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
    const resolvedEvent = event || kityEvent.createEvent(type);
    target.dispatchEvent(resolvedEvent);
  },
};
