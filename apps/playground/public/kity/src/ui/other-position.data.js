const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.otherPosition) {
  throw new Error('Missing FormulaX legacy other position runtime');
}

export default runtime.otherPosition;
