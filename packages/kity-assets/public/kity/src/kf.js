const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.kf) {
  throw new Error('Missing FormulaX legacy kf runtime');
}

export default runtime.kf;
