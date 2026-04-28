const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.kfExtDef) {
  throw new Error('Missing FormulaX legacy kf ext def runtime');
}

export default runtime.kfExtDef;
