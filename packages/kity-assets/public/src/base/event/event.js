const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.eventListener) {
  throw new Error('Missing FormulaX legacy event listener runtime');
}

export default runtime.eventListener;
