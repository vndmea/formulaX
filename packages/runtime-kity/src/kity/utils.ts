import {
  assign,
  cloneDeep,
  forEach,
  isArray,
  isBoolean,
  isFunction,
  isNumber,
  isObject,
  isRegExp,
  isString,
  flattenDeep,
  get,
  defaultTo,
  merge,
} from 'lodash-es';

export type KityUtils = {
  each: typeof forEach;
  extend: typeof assign;
  deepExtend: typeof merge;
  clone: typeof cloneDeep;
  copy: typeof cloneDeep;
  queryPath: typeof get;
  getValue: typeof defaultTo;
  flatten: typeof flattenDeep;
  parallel: (v1: unknown, v2: unknown, op: (a: unknown, b: unknown) => unknown) => unknown;
  paralle: (v1: unknown, v2: unknown, op: (a: unknown, b: unknown) => unknown) => unknown;
  parallelize: (op: (a: unknown, b: unknown) => unknown) => (v1: unknown, v2: unknown) => unknown;
  isString: typeof isString;
  isFunction: typeof isFunction;
  isArray: typeof isArray;
  isNumber: typeof isNumber;
  isRegExp: typeof isRegExp;
  isObject: typeof isObject;
  isBoolean: typeof isBoolean;
};

const utils: KityUtils = {
  each: forEach,
  extend: assign,
  deepExtend: merge,
  clone: cloneDeep,
  copy: cloneDeep,
  queryPath: get,
  getValue: defaultTo,
  flatten: flattenDeep,

  parallel: function parallel(v1: unknown, v2: unknown, op: (a: unknown, b: unknown) => unknown): unknown {
    if (isArray(v1) && isArray(v2)) {
      return (v1 as unknown[]).map((item, i) => parallel(item, (v2 as unknown[])[i], op));
    }

    if (isObject(v1) && isObject(v1) && isObject(v2)) {
      const Class = (v1 as { getClass?: () => { parse?: (val: unknown) => unknown } }).getClass?.();
      if (Class?.parse) {
        const v1Val = (v1 as { valueOf: () => unknown[] }).valueOf();
        const v2Val = (v2 as { valueOf: () => unknown[] }).valueOf();
        const result = parallel(v1Val, v2Val, op);
        return Class.parse(result);
      }
      const result: Record<string, unknown> = {};
      for (const name in v1 as object) {
        if (
          Object.prototype.hasOwnProperty.call(v1, name) &&
          Object.prototype.hasOwnProperty.call(v2, name)
        ) {
          result[name] = parallel(
            (v1 as Record<string, unknown>)[name],
            (v2 as Record<string, unknown>)[name],
            op,
          );
        }
      }
      return result;
    }

    if (!isNaN(Number(v1))) {
      return op(v1, v2);
    }

    return undefined;
  },

  paralle: null as unknown as KityUtils['paralle'],

  parallelize(op: (a: unknown, b: unknown) => unknown) {
    return (v1: unknown, v2: unknown) => utils.parallel(v1, v2, op);
  },

  isString,
  isFunction,
  isArray,
  isNumber,
  isRegExp,
  isObject,
  isBoolean,
};

utils.paralle = utils.parallel;

export default utils;
