export type TopicCallback = (...args: unknown[]) => void;

export type ElementOptions =
  | string
  | {
      className?: string;
      content?: string;
    };

export type NormalizedMouseEvent = MouseEvent & {
  originalEvent: MouseEvent | WheelEvent;
  wheelDelta: number;
  which: number;
};

const topicPool = new Map<string, TopicCallback[]>();

function getMouseButtonCode(event: MouseEvent | WheelEvent) {
  if (typeof event.which === 'number' && event.which > 0) {
    return event.which;
  }

  switch (event.button) {
    case 0:
      return 1;
    case 1:
      return 2;
    case 2:
      return 3;
    default:
      return 0;
  }
}

function getWheelDelta(event: MouseEvent | WheelEvent) {
  if ('wheelDelta' in event && typeof event.wheelDelta === 'number') {
    return event.wheelDelta;
  }

  if ('deltaY' in event && typeof event.deltaY === 'number') {
    return -event.deltaY * 40;
  }

  return 0;
}

export function normalizeMouseEvent(event: MouseEvent | WheelEvent): NormalizedMouseEvent {
  return Object.assign(Object.create(event), event, {
    originalEvent: event,
    wheelDelta: getWheelDelta(event),
    which: getMouseButtonCode(event),
  });
}

export function createElement(doc: Document, name: 'text', options: string): Text;
export function createElement(doc: Document, name: string, options?: Exclude<ElementOptions, string>): HTMLElement;
export function createElement(doc: Document, name: string, options?: ElementOptions) {
  if (name === 'text') {
    return doc.createTextNode(typeof options === 'string' ? options : '');
  }

  const node = doc.createElement(name);

  if (options && typeof options !== 'string') {
    if (options.className) {
      node.className = options.className;
    }

    if (options.content) {
      node.innerHTML = options.content;
    }
  }

  return node;
}

export function addEvent(target: EventTarget | null, type: string, listener: (event: NormalizedMouseEvent) => void) {
  if (!target) {
    return;
  }

  target.addEventListener(type, (event) => {
    listener(normalizeMouseEvent(event as MouseEvent | WheelEvent));
  });
}

export function delegateEvent(
  target: EventTarget | null,
  selector: string,
  type: string,
  listener: (this: Element, event: NormalizedMouseEvent) => void,
) {
  if (!target) {
    return;
  }

  target.addEventListener(type, (event) => {
    const normalizedEvent = normalizeMouseEvent(event as MouseEvent | WheelEvent);
    let current = event.target instanceof Element ? event.target : null;

    while (current && current !== target) {
      if (current.matches(selector)) {
        listener.call(current, normalizedEvent);
        return;
      }
      current = current.parentElement;
    }
  });
}

export function publish(topic: string, ...args: unknown[]) {
  const callbackList = topicPool.get(topic);

  if (!callbackList) {
    return;
  }

  callbackList.forEach((callback) => callback(...args));
}

export function subscribe(topic: string, callback: TopicCallback) {
  const callbackList = topicPool.get(topic) ?? [];
  callbackList.push(callback);
  topicPool.set(topic, callbackList);
}

export function getRectBox(node: Element) {
  return node.getBoundingClientRect();
}

export function getClassList(node: Element) {
  return node.classList;
}
