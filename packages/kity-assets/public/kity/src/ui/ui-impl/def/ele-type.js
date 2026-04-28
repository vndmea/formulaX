const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.eleType) {
  throw new Error('Missing FormulaX legacy element type runtime');
}

export default runtime.eleType;
