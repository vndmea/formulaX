const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.uiUtils) {
  throw new Error('Missing FormulaX legacy ui utils runtime');
}

export default runtime.uiUtils;
