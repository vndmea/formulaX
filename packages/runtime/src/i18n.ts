export const FORMULAX_LOCALES = ['en_US', 'zh_CN'] as const;

export type FormulaXLocale = (typeof FORMULAX_LOCALES)[number];
export type FormulaXRuntimeMessageKey = 'editor.placeholder.root';

export const DEFAULT_FORMULAX_LOCALE: FormulaXLocale = 'en_US';

const FORMULAX_RUNTIME_MESSAGES: Record<FormulaXLocale, Record<FormulaXRuntimeMessageKey, string>> = {
  en_US: {
    'editor.placeholder.root': 'Type formula here',
  },
  zh_CN: {
    'editor.placeholder.root': '请输入公式',
  },
};

export function normalizeFormulaXLocale(locale?: string): FormulaXLocale {
  if (!locale) {
    return DEFAULT_FORMULAX_LOCALE;
  }

  const normalized = locale.replace(/-/g, '_').toLowerCase();
  if (normalized === 'zh' || normalized.startsWith('zh_')) {
    return 'zh_CN';
  }

  return DEFAULT_FORMULAX_LOCALE;
}

export function getFormulaXRuntimeMessage(
  key: FormulaXRuntimeMessageKey,
  locale?: string,
): string {
  const normalizedLocale = normalizeFormulaXLocale(locale);
  return FORMULAX_RUNTIME_MESSAGES[normalizedLocale][key]
    ?? FORMULAX_RUNTIME_MESSAGES[DEFAULT_FORMULAX_LOCALE][key];
}
