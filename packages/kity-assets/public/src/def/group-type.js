const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.groupType) {
  throw new Error('Missing FormulaX legacy group type runtime');
}

export default runtime.groupType;
