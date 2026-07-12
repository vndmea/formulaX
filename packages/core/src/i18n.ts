export const FORMULAX_LOCALES = ['en_US', 'zh_CN'] as const;

export type FormulaXLocale = (typeof FORMULAX_LOCALES)[number];

export const DEFAULT_FORMULAX_LOCALE: FormulaXLocale = 'en_US';

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
