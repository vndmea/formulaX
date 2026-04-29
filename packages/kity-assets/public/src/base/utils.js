const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.baseUtils) {
  throw new Error('Missing FormulaX legacy base utils runtime');
}

export default runtime.baseUtils;
