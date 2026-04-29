import { legacyBaseUtils } from './legacy-utils';

type LegacyKityCreateClassDefinition = {
  base?: unknown;
  constructor?: (...args: any[]) => void;
  [key: string]: unknown;
};

export type LegacyKity = {
  Utils: typeof legacyBaseUtils & {
    extend: typeof legacyBaseUtils.extend;
    each: typeof legacyBaseUtils.each;
  };
  createClass: (name: string, definition: LegacyKityCreateClassDefinition) => any;
};

export type LegacyKf = {
  ResourceManager: {
    ready: (callback: (formula: unknown) => void, options?: { path?: string }) => void;
  };
  Assembly: new (formula: unknown) => {
    formula: unknown;
  };
  EditorFactory?: unknown;
};

type RuntimeWindow = Window &
  typeof globalThis & {
    __FORMULAX_KITY_RUNTIME__?: {
      kf?: unknown;
      kity?: unknown;
    };
  };

export function getLegacyRuntime() {
  const runtime = (window as RuntimeWindow).__FORMULAX_KITY_RUNTIME__;

  if (!runtime) {
    throw new Error('Missing FormulaX legacy runtime');
  }

  return runtime;
}

export function getLegacyKity() {
  const runtime = getLegacyRuntime();

  if (!runtime.kity) {
    throw new Error('Missing FormulaX legacy kity runtime');
  }

  return runtime.kity as LegacyKity;
}

export function getLegacyKf() {
  const runtime = getLegacyRuntime();

  if (!runtime.kf) {
    throw new Error('Missing FormulaX legacy kf runtime');
  }

  return runtime.kf as LegacyKf;
}
