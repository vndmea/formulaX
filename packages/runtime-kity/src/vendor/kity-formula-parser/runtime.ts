// @ts-nocheck

export type ParserRuntimeWindow = Window & typeof globalThis & {
  kf?: Record<string, unknown>;
};

export type LegacyParserModuleRegistry = {
  [key: string]: any;
  r: (index: number | string) => any;
};

export type LegacyParserModuleContext = {
  _p: LegacyParserModuleRegistry;
  window: ParserRuntimeWindow;
};

export function createLegacyParserModuleRegistry(): LegacyParserModuleRegistry {
  const modules: any = [];

  modules.r = function resolve(index: number | string) {
    if (modules[index].inited) {
      return modules[index].value;
    }

    if (typeof modules[index].value === 'function') {
      const module = {
        exports: {},
      };
      const returnValue = modules[index].value(null, module.exports, module);
      modules[index].inited = true;
      modules[index].value = returnValue;

      if (returnValue !== undefined) {
        return returnValue;
      }

      for (const key in module.exports) {
        if (Object.prototype.hasOwnProperty.call(module.exports, key)) {
          modules[index].inited = true;
          modules[index].value = module.exports;
          return module.exports;
        }
      }
    } else {
      modules[index].inited = true;
      return modules[index].value;
    }
  };

  return modules;
}