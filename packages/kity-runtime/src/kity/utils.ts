const utils: Record<string, any> = {};

utils.each = function each(
  obj: any,
  iterator: (value: any, key: any, obj: any) => boolean | void,
  context?: any,
) {
  if (obj === null || obj === undefined) {
    return;
  }
  if (obj.length === +obj.length) {
    for (let i = 0, l = obj.length; i < l; i++) {
      if (iterator.call(context, obj[i], i, obj) === false) {
        return false;
      }
    }
  } else {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (iterator.call(context, obj[key], key, obj) === false) {
          return false;
        }
      }
    }
  }
};

utils.extend = function extend(t: any) {
  const a = arguments;
  const notCover = utils.isBoolean(a[a.length - 1]) ? a[a.length - 1] : false;
  const len = utils.isBoolean(a[a.length - 1]) ? a.length - 1 : a.length;

  for (let i = 1; i < len; i++) {
    const x = a[i];
    for (const k in x) {
      if (!notCover || !Object.prototype.hasOwnProperty.call(t, k)) {
        t[k] = x[k];
      }
    }
  }
  return t;
};

utils.deepExtend = function deepExtend(t: any, _s: any) {
  const a = arguments;
  const notCover = utils.isBoolean(a[a.length - 1]) ? a[a.length - 1] : false;
  const len = utils.isBoolean(a[a.length - 1]) ? a.length - 1 : a.length;

  for (let i = 1; i < len; i++) {
    const x = a[i];
    for (const k in x) {
      if (!notCover || !Object.prototype.hasOwnProperty.call(t, k)) {
        if (utils.isObject(t[k]) && utils.isObject(x[k])) {
          utils.deepExtend(t[k], x[k], notCover);
        } else {
          t[k] = x[k];
        }
      }
    }
  }
  return t;
};

utils.clone = function clone(obj: any) {
  const cloned: any = {};
  for (const m in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, m)) {
      cloned[m] = obj[m];
    }
  }
  return cloned;
};

utils.copy = function copy(obj: any) {
  if (typeof obj !== 'object') return obj;
  if (typeof obj === 'function') return null;
  return JSON.parse(JSON.stringify(obj));
};

utils.queryPath = function queryPath(path: string, obj: any) {
  const arr = path.split('.');
  let i = 0;
  let tmp = obj;
  const l = arr.length;
  while (i < l) {
    if (arr[i] in tmp) {
      tmp = tmp[arr[i]];
      i++;
      if (i >= l || tmp === undefined) {
        return tmp;
      }
    } else {
      return undefined;
    }
  }
};

utils.getValue = function getValue(value: any, defaultValue: any) {
  return value !== undefined ? value : defaultValue;
};

utils.flatten = function flatten(arr: any[]): any[] {
  const result: any[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] instanceof Array) {
      result.push(...utils.flatten(arr[i]));
    } else {
      result.push(arr[i]);
    }
  }
  return result;
};

const parallel = function parallel(v1: any, v2: any, op: (a: any, b: any) => any): any {
  let value: any;

  if (v1 instanceof Array) {
    value = [];
    for (let index = 0; index < v1.length; index++) {
      value.push(parallel(v1[index], v2[index], op));
    }
    return value;
  }

  if (v1 instanceof Object) {
    const Class = v1.getClass && v1.getClass();
    if (Class && Class.parse) {
      v1 = v1.valueOf();
      v2 = v2.valueOf();
      value = parallel(v1, v2, op);
      value = Class.parse(value);
    } else {
      value = {};
      for (const name in v1) {
        if (
          Object.prototype.hasOwnProperty.call(v1, name) &&
          Object.prototype.hasOwnProperty.call(v2, name)
        ) {
          value[name] = parallel(v1[name], v2[name], op);
        }
      }
    }
    return value;
  }

  if (isNaN(parseFloat(v1)) === false) {
    return op(v1, v2);
  }

  return value;
};

utils.parallel = parallel;
utils.paralle = parallel;

utils.parallelize = function parallelize(op: (a: any, b: any) => any) {
  return function (v1: any, v2: any) {
    return utils.parallel(v1, v2, op);
  };
};

utils.isString = function isString(obj: unknown) {
  return Object.prototype.toString.call(obj) === '[object String]';
};

utils.isFunction = function isFunction(obj: unknown) {
  return Object.prototype.toString.call(obj) === '[object Function]';
};

utils.isArray = function isArray(obj: unknown) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

utils.isNumber = function isNumber(obj: unknown) {
  return Object.prototype.toString.call(obj) === '[object Number]';
};

utils.isRegExp = function isRegExp(obj: unknown) {
  return Object.prototype.toString.call(obj) === '[object RegExp]';
};

utils.isObject = function isObject(obj: unknown) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

utils.isBoolean = function isBoolean(obj: unknown) {
  return Object.prototype.toString.call(obj) === '[object Boolean]';
};

export type KityUtils = typeof utils;
export default utils;
