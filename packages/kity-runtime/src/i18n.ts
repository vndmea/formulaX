export const FORMULAX_LOCALES = ['en_US', 'zh_CN'] as const;

export type FormulaXLocale = (typeof FORMULAX_LOCALES)[number];

export const DEFAULT_FORMULAX_LOCALE: FormulaXLocale = 'en_US';

export function normalizeFormulaXLocale(locale?: string): FormulaXLocale {
  if (locale === 'zh_CN') {
    return 'zh_CN';
  }

  return DEFAULT_FORMULAX_LOCALE;
}
