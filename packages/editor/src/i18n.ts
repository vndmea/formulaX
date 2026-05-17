import {
  DEFAULT_FORMULAX_LOCALE,
  normalizeFormulaXLocale,
  type FormulaXLocale,
} from '@formulaxjs/kity-runtime';

export type FormulaXEditorMessageKey =
  | 'modal.title'
  | 'modal.insert'
  | 'modal.update'
  | 'modal.cancel';

const FORMULAX_EDITOR_MESSAGES: Record<FormulaXLocale, Record<FormulaXEditorMessageKey, string>> = {
  en_US: {
    'modal.title': 'FormulaX Editor',
    'modal.insert': 'Insert',
    'modal.update': 'Update',
    'modal.cancel': 'Cancel',
  },
  zh_CN: {
    'modal.title': 'FormulaX 编辑器',
    'modal.insert': '插入',
    'modal.update': '更新',
    'modal.cancel': '取消',
  },
};

export function getFormulaXEditorMessage(
  key: FormulaXEditorMessageKey,
  locale: FormulaXLocale = DEFAULT_FORMULAX_LOCALE,
): string {
  const normalizedLocale = normalizeFormulaXLocale(locale);
  return FORMULAX_EDITOR_MESSAGES[normalizedLocale][key] ?? FORMULAX_EDITOR_MESSAGES[DEFAULT_FORMULAX_LOCALE][key];
}
