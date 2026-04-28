const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.baseComponent) {
  throw new Error('Missing FormulaX legacy base component runtime');
}

export default runtime.baseComponent;
