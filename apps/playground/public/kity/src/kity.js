const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.kity) {
  throw new Error('Missing FormulaX legacy kity runtime');
}

export default runtime.kity;
