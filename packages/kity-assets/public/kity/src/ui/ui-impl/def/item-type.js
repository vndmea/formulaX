const runtime = window.__FORMULAX_KITY_RUNTIME__;

if (!runtime?.itemType) {
  throw new Error('Missing FormulaX legacy item type runtime');
}

export default runtime.itemType;
