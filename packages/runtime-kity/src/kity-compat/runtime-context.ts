import type { KityBaseUtils } from './base-utils';

type KityCreateClassDefinition = {
  base?: unknown;
  constructor?: (...args: any[]) => void;
  [key: string]: unknown;
};

export type KityGraphicsRuntime = {
  Utils: KityBaseUtils;
  createClass: (name: string, definition: KityCreateClassDefinition) => any;
};

export type KityFormulaRuntime = {
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

export function getKityRuntimeContext() {
  const runtime = (window as RuntimeWindow).__FORMULAX_KITY_RUNTIME__;

  if (!runtime) {
    throw new Error('Missing FormulaX Kity runtime');
  }

  return runtime;
}

export function getKityGraphicsRuntime(): KityGraphicsRuntime {
  const runtime = getKityRuntimeContext();

  if (!runtime.kity) {
    throw new Error('Missing FormulaX Kity graphics runtime');
  }

  return runtime.kity as KityGraphicsRuntime;
}

export function getKityFormulaRuntime(): KityFormulaRuntime {
  const runtime = getKityRuntimeContext();

  if (!runtime.kf) {
    throw new Error('Missing FormulaX Kity formula runtime');
  }

  return runtime.kf as KityFormulaRuntime;
}
