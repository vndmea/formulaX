const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.commonUtils) {
  throw new Error('Missing FormulaX legacy common utils runtime');
}

export default runtime.commonUtils;
