const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.charPosition) {
  throw new Error('Missing FormulaX legacy char position runtime');
}

export default runtime.charPosition;
