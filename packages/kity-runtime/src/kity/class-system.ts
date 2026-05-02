type AnyFunc = (...args: any[]) => any;

interface KityCtor<T = Record<string, any>> {
  new (...args: any[]): T;
  (this: unknown, ...args: any[]): T;
  prototype: T;
  __KityClassName?: string;
  __KityBaseClass?: AnyFunc;
  __KityMixins?: Record<string, AnyFunc>;
  __KityConstructor?: AnyFunc;
}

interface KityMethodInfo {
  cls: KityCtor;
  methodName: string;
}

function Class(this: any) {}

const ClassProto = Class.prototype as Record<string, any>;

ClassProto.base = function (this: any, name: string) {
  const stack: KityMethodInfo[] = this.__kityCallStack__;
  const info = stack[stack.length - 1];
  const method = info.cls.__KityBaseClass!.prototype[name];
  return method.apply(this, Array.prototype.slice.call(arguments, 1));
};

ClassProto.callBase = function (this: any) {
  const stack: KityMethodInfo[] = this.__kityCallStack__;
  const info = stack[stack.length - 1];
  const method = info.cls.__KityBaseClass!.prototype[info.methodName];
  return method.apply(this, arguments as unknown as unknown[]);
};

ClassProto.mixin = function (this: any, name: string) {
  const stack: KityMethodInfo[] = this.__kityCallStack__;
  const info = stack[stack.length - 1];
  const mixins = info.cls.__KityMixins;
  if (!mixins) return this;
  return mixins[name].apply(this, Array.prototype.slice.call(arguments, 1));
};

ClassProto.callMixin = function (this: any) {
  const stack: KityMethodInfo[] = this.__kityCallStack__;
  const info = stack[stack.length - 1];
  const methodName = info.methodName;
  const mixins = info.cls.__KityMixins;
  if (!mixins) return this;
  const method = mixins[methodName] as unknown as AnyFunc[];
  if (methodName === 'constructor') {
    for (let i = 0; i < method.length; i++) method[i].call(this);
    return this;
  }
  return (method as unknown as AnyFunc).apply(this, arguments as unknown as unknown[]);
};

ClassProto.pipe = function (this: any, fn: AnyFunc) {
  if (typeof fn === 'function') fn.call(this, this);
  return this;
};

ClassProto.getType = function (this: any) {
  return this.__KityClassName as string;
};

ClassProto.getClass = function (this: any) {
  return this.constructor as KityCtor;
};

function wrapMethod(cls: KityCtor, methodName: string, originalMethod: AnyFunc): AnyFunc {
  const wrapped = function (this: any) {
    this.__kityCallStack__ = this.__kityCallStack__ || [];
    this.__kityCallStack__.push({ cls, methodName });
    try {
      return originalMethod.apply(this, arguments as unknown as unknown[]);
    } finally {
      this.__kityCallStack__.pop();
    }
  };
  (wrapped as unknown as Record<string, unknown>).__KityMethodClass = cls;
  (wrapped as unknown as Record<string, unknown>).__KityMethodName = methodName;
  return wrapped;
}

function inherit(constructor: AnyFunc, BaseClass: KityCtor): KityCtor {
  const KityClass = function (this: any) {
    const meta = KityClass as unknown as Record<string, unknown>;
    (meta.__KityConstructor as AnyFunc).apply(this, arguments as unknown as unknown[]);
  };

  const meta = KityClass as unknown as Record<string, unknown>;
  meta.__KityConstructor = constructor;
  KityClass.prototype = Object.create(BaseClass.prototype);

  for (const methodName in BaseClass.prototype) {
    if (
      Object.prototype.hasOwnProperty.call(BaseClass.prototype, methodName) &&
      methodName.indexOf('__Kity') !== 0
    ) {
      KityClass.prototype[methodName] = BaseClass.prototype[methodName];
    }
  }

  KityClass.prototype.constructor = KityClass;
  return KityClass as unknown as KityCtor;
}

function legacyMixin(NewClass: KityCtor, mixins: KityCtor[]): KityCtor {
  if (!(mixins instanceof Array)) return NewClass;
  const meta = NewClass as unknown as Record<string, unknown>;
  meta.__KityMixins = { constructor: [] };
  for (let i = 0; i < mixins.length; i++) {
    const proto = mixins[i].prototype;
    for (const method in proto) {
      if (!Object.prototype.hasOwnProperty.call(proto, method)) continue;
      if (method === 'constructor') {
        (meta.__KityMixins as Record<string, AnyFunc[]>)['constructor'].push(proto[method]);
      } else {
        NewClass.prototype[method] = (meta.__KityMixins as Record<string, AnyFunc>)[method] =
          proto[method];
      }
    }
  }
  return NewClass;
}

function extend(BaseClass: KityCtor, extension: Record<string, unknown>): KityCtor {
  for (const methodName in extension) {
    if (
      Object.prototype.hasOwnProperty.call(extension, methodName) &&
      methodName !== 'constructor' &&
      methodName.indexOf('__Kity') !== 0
    ) {
      BaseClass.prototype[methodName] = wrapMethod(
        BaseClass,
        methodName,
        extension[methodName] as AnyFunc,
      );
    }
  }
  return BaseClass;
}

function checkBaseConstructorCall(targetClass: AnyFunc, classname: string) {
  if (!/this\.callBase/.test(targetClass.toString())) {
    throw new Error(
      `${classname}: the constructor must call the base constructor for compatibility with the legacy kity class system.`,
    );
  }
}

export { Class };
export type { KityCtor };

export function createClass<T = Record<string, any>>(
  classname: string,
  defines?: Record<string, any> & ThisType<T>,
): KityCtor<T> {
  let constructor: AnyFunc;
  let NewClass: KityCtor;
  let BaseClass: KityCtor;

  if (arguments.length === 1) {
    defines = arguments[0];
    classname = 'AnonymousClass';
  }

  defines = defines || {};
  BaseClass = defines.base || (Class as unknown as KityCtor);

  if (Object.prototype.hasOwnProperty.call(defines, 'constructor')) {
    constructor = defines.constructor as AnyFunc;
    if (BaseClass !== (Class as unknown as KityCtor)) {
      checkBaseConstructorCall(constructor, classname);
    }
  } else {
    constructor = function (this: any) {
      this.callBase.apply(this, arguments);
      this.callMixin.apply(this, arguments);
    };
  }

  const originalConstructor = constructor;
  constructor = function (this: any) {
    this.__kityCallStack__ = this.__kityCallStack__ || [];
    this.__kityCallStack__.push({
      cls: NewClass,
      methodName: 'constructor',
    });
    try {
      return originalConstructor.apply(this, arguments as unknown as unknown[]);
    } finally {
      this.__kityCallStack__.pop();
    }
  };

  NewClass = inherit(constructor, BaseClass);
  NewClass = legacyMixin(NewClass, defines.mixins || []);

  const meta = NewClass as unknown as Record<string, unknown>;
  meta.__KityClassName = (constructor as unknown as Record<string, unknown>).__KityClassName =
    classname;
  meta.__KityBaseClass = (constructor as unknown as Record<string, unknown>).__KityBaseClass =
    BaseClass;
  (constructor as unknown as Record<string, unknown>).__KityMethodName = 'constructor';
  (constructor as unknown as Record<string, unknown>).__KityMethodClass = NewClass;

  delete (defines as any).mixins;
  delete (defines as any).constructor;
  delete (defines as any).base;

  NewClass = extend(NewClass, defines as Record<string, unknown>);

  return NewClass as KityCtor<T>;
}

export function extendClass(clazz: KityCtor, extension: Record<string, any>): KityCtor {
  return extend(clazz, extension);
}
