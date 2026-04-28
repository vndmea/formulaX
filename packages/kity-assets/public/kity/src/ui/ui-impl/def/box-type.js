const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.boxType) {
  throw new Error('Missing FormulaX legacy box type runtime');
}

export default runtime.boxType;
