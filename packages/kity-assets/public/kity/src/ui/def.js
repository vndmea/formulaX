const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.uiDef) {
  throw new Error('Missing FormulaX legacy ui def runtime');
}

export default runtime.uiDef;
