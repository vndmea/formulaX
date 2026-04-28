const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.inputFilter) {
  throw new Error('Missing FormulaX legacy input filter runtime');
}

export default runtime.inputFilter;
