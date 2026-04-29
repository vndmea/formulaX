const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.sysconf) {
  throw new Error('Missing FormulaX legacy sysconf runtime');
}

export default runtime.sysconf;
