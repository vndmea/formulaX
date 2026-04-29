const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.kfEvent) {
  throw new Error('Missing FormulaX legacy kf event runtime');
}

export default runtime.kfEvent;
