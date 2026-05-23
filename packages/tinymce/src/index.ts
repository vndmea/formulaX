export {
  DEFAULT_FORMULA_ATTRIBUTE,
  DEFAULT_FORMULA_CLASS,
  FORMULA_FLAG_ATTRIBUTE,
  createTinyMceFormulaMarkup,
  parseTinyMceFormulaMarkup,
  serializeTinyMceFormulaMarkup,
  getFormulaLatexFromElement,
  findFormulaElement,
  isFormulaElement,
  replaceFormulaElement,
} from './markup';

export {
  getTinyMceMajorVersion,
  createTinyMceCompat,
  warnUnsupportedTinyMceVersion,
} from './compat';

export {
  registerFormulaXTinyMcePlugin,
  resolveOptions,
} from './plugin';

export {
  openFormulaXOverlayModal,
} from './modal';

export {
  FORMULAX_DEFAULT_ICON_SVG,
  FORMULAX_DEFAULT_ICON_NAME,
  normalizeFormulaXIconSvg,
  resolveFormulaXIcon,
  resolveFormulaXIconName,
} from '@formulaxjs/editor';

export type { FormulaXIconOptions } from '@formulaxjs/editor';

export type {
  FormulaXTinyMceOptions,
  FormulaXModalOptions,
  FormulaXModalOpenOptions,
  RequiredFormulaXTinyMceOptions,
  TinyMceEditorLike,
  TinyMceLike,
} from './types';
