function normalizeEvent(event) {
  const wrappedEvent = Object.create(event);
  let button = typeof event.which === 'number' && event.which > 0 ? event.which : 0;
  let wheelDelta = typeof event.wheelDelta === 'number' ? event.wheelDelta : 0;

  if (!button) {
    switch (event.button) {
      case 0:
        button = 1;
        break;
      case 1:
        button = 2;
        break;
      case 2:
        button = 3;
        break;
    }
  }

  if (!wheelDelta && typeof event.deltaY === 'number') {
    wheelDelta = -event.deltaY * 40;
  }

  Object.defineProperties(wrappedEvent, {
    originalEvent: {
      value: event,
      enumerable: false,
      configurable: true,
    },
    which: {
      value: button,
      enumerable: false,
      configurable: true,
    },
    wheelDelta: {
      value: wheelDelta,
      enumerable: false,
      configurable: true,
    },
    preventDefault: {
      value: event.preventDefault.bind(event),
      enumerable: false,
      configurable: true,
    },
    stopPropagation: {
      value: event.stopPropagation.bind(event),
      enumerable: false,
      configurable: true,
    },
    stopImmediatePropagation: {
      value: event.stopImmediatePropagation.bind(event),
      enumerable: false,
      configurable: true,
    },
  });

  return wrappedEvent;
}

function ele(doc, name, options) {
  let node = null;

  if (name === 'text') {
    return doc.createTextNode(options);
  }

  node = doc.createElement(name);
  options.className && (node.className = options.className);

  if (options.content) {
    node.innerHTML = options.content;
  }

  return node;
}

function getRectBox(node) {
  return node.getBoundingClientRect();
}

function on(target, type, fn) {
  target &&
    target.addEventListener(type, function (event) {
      fn.call(target, normalizeEvent(event));
    });
  return uiUtils;
}

function delegate(target, selector, type, fn) {
  target &&
    target.addEventListener(type, function (event) {
      let current = event.target;

      while (current && current !== target) {
        if (current.matches && current.matches(selector)) {
          fn.call(current, normalizeEvent(event));
          return;
        }
        current = current.parentElement;
      }
    });
  return uiUtils;
}

const TOPIC_POOL = {};

function publish(topic) {
  const callbackList = TOPIC_POOL[topic];

  if (!callbackList) {
    return;
  }

  const args = [].slice.call(arguments, 1);
  callbackList.forEach(function (callback) {
    callback.apply(null, args);
  });
}

function subscribe(topic, callback) {
  if (!TOPIC_POOL[topic]) {
    TOPIC_POOL[topic] = [];
  }

  TOPIC_POOL[topic].push(callback);
}

function getClassList(node) {
  return node.classList || new ClassList(node);
}

function ClassList(node) {
  this.node = node;
  this.classes = node.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
}

ClassList.prototype = {
  constructor: ClassList,
  contains(className) {
    return this.classes.indexOf(className) !== -1;
  },
  add(className) {
    if (this.classes.indexOf(className) === -1) {
      this.classes.push(className);
    }

    this._update();
    return this;
  },
  remove(className) {
    const index = this.classes.indexOf(className);

    if (index !== -1) {
      this.classes.splice(index, 1);
      this._update();
    }

    return this;
  },
  toggle(className) {
    const method = this.contains(className) ? 'remove' : 'add';
    return this[method](className);
  },
  _update() {
    this.node.className = this.classes.join(' ');
  },
};

const uiUtils = {
  ele,
  getRectBox,
  on,
  delegate,
  publish,
  subscribe,
  getClassList,
};

export default uiUtils;
