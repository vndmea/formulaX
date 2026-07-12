import {
  DEFAULT_FORMULAX_LOCALE,
  normalizeFormulaXLocale,
  type FormulaXLocale,
} from '@formulaxjs/core';

export type FormulaXRuntimeMessageKey = 'editor.placeholder.root';

const FORMULAX_RUNTIME_MESSAGES: Record<FormulaXLocale, Record<FormulaXRuntimeMessageKey, string>> = {
  en_US: {
    'editor.placeholder.root': 'Type formula here',
  },
  zh_CN: {
    'editor.placeholder.root': '请输入公式',
  },
};

export function getFormulaXRuntimeMessage(
  key: FormulaXRuntimeMessageKey,
  locale?: string,
): string {
  const normalizedLocale = normalizeFormulaXLocale(locale);
  return FORMULAX_RUNTIME_MESSAGES[normalizedLocale][key]
    ?? FORMULAX_RUNTIME_MESSAGES[DEFAULT_FORMULAX_LOCALE][key];
}
