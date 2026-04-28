const maxCopyDepth = 10;

function copy(isDeep: boolean, target: any, source: any, count = 0): any {
  if (count > maxCopyDepth) {
    return source;
  }

  const nextCount = count + 1;

  legacyCommonUtils.each(source, (value, index) => {
    if (isDeep) {
      if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
        target[index] = value;
      } else {
        target[index] = target[index] || (legacyCommonUtils.isArray(value) ? [] : {});
        target[index] = copy(isDeep, target[index], value, nextCount);
      }
    } else {
      target[index] = value;
    }
  });

  return target;
}

export const legacyCommonUtils = {
  extend(...args: any[]) {
    let isDeep = false;
    let target = args[0];
    const source = args[1];
    let sources: any[] = [];

    if (typeof target === 'boolean') {
      isDeep = target;
      target = source;
      sources = args.slice(2);
    } else {
      sources = args.slice(1);
    }

    if (!target) {
      throw new Error('Utils: extend, target can not be empty');
    }

    legacyCommonUtils.each(sources, (src) => {
      if ((src && typeof src === 'object') || typeof src === 'function') {
        copy(isDeep, target, src);
      }
    });

    return target;
  },

  contains(parent: Node & { contains?: (node: Node | null) => boolean }, target: Node) {
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

  isArray(obj: unknown) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  },

  isString(obj: unknown) {
    return typeof obj === 'string';
  },

  proxy<T extends (...args: any[]) => any>(fn: T, context: unknown) {
    return function proxy(this: unknown, ...args: Parameters<T>) {
      return fn.apply(context, args);
    };
  },

  each(obj: any, fn: (value: any, key: any, origin: any) => boolean | void) {
    if (!obj) {
      return;
    }

    if ('length' in obj && typeof obj.length === 'number') {
      for (let index = 0, length = obj.length; index < length; index += 1) {
        if (fn.call(null, obj[index], index, obj) === false) {
          break;
        }
      }
      return;
    }

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (fn.call(null, obj[key], key, obj) === false) {
          break;
        }
      }
    }
  },
};
