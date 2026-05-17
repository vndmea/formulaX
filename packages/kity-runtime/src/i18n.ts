export const FORMULAX_LOCALES = ['en_US', 'zh_CN'] as const;

export type FormulaXLocale = (typeof FORMULAX_LOCALES)[number];
export type FormulaXI18nNamespace = 'toolbar';
export type FormulaXRuntimeMessageKey = 'editor.placeholder.root';

export const DEFAULT_FORMULAX_LOCALE: FormulaXLocale = 'en_US';

const FORMULAX_TRANSLATIONS: Partial<Record<FormulaXLocale, Record<FormulaXI18nNamespace, Record<string, string>>>> = {
  en_US: {
    toolbar: {
      预设: 'Presets',
      预设公式: 'Presets',
      二次公式: 'Quadratic',
      二项式定理: 'Binomial',
      勾股定理: 'Pythagorean',
      基础数学: 'Basic math',
      希腊字母: 'Greek',
      求反关系运算符: 'Negated operators',
      字母类符号: 'Letter symbols',
      箭头: 'Arrows',
      手写体: 'Script',
      分数: 'Fraction',
      常用分数: 'Common fractions',
      上下标: 'Scripts',
      上标和下标: 'Super/subscripts',
      常用的上标和下标: 'Common super/subscripts',
      根式: 'Radicals',
      常用根式: 'Common radicals',
      积分: 'Integrals',
      大型运算符: 'Large<br/>ops',
      求和: 'Summations',
      括号: 'Brackets',
      方括号: 'Brackets',
      函数: 'Functions',
      三角函数: 'Trig functions',
      常用函数: 'Common functions',
      小写: 'Lowercase',
      大写: 'Uppercase',
      变体: 'Variants',
      花体: 'Fraktur',
      双线: 'Double-struck',
      罗马: 'Roman',
    },
  },
};

const FORMULAX_RUNTIME_MESSAGES: Record<FormulaXLocale, Record<FormulaXRuntimeMessageKey, string>> = {
  en_US: {
    'editor.placeholder.root': 'Type formula here',
  },
  zh_CN: {
    'editor.placeholder.root': '请输入公式',
  },
};

export function normalizeFormulaXLocale(locale?: string): FormulaXLocale {
  if (locale === 'zh_CN') {
    return 'zh_CN';
  }

  return DEFAULT_FORMULAX_LOCALE;
}

export function translateFormulaXText(
  namespace: FormulaXI18nNamespace,
  value: string,
  locale: FormulaXLocale,
): string {
  if (locale === 'zh_CN') {
    return value;
  }

  const normalizedValue = value.replace(/<br\s*\/?>/gi, '').trim();
  const translatedValue = FORMULAX_TRANSLATIONS[locale]?.[namespace]?.[normalizedValue];

  if (!translatedValue) {
    return value;
  }

  const lineBreakMatch = value.match(/<br\s*\/?>/i);
  if (/<br\s*\/?>/i.test(translatedValue)) {
    return translatedValue;
  }

  return lineBreakMatch ? `${translatedValue}${lineBreakMatch[0]}` : translatedValue;
}

export function getFormulaXRuntimeMessage(
  key: FormulaXRuntimeMessageKey,
  locale: FormulaXLocale = DEFAULT_FORMULAX_LOCALE,
): string {
  const normalizedLocale = normalizeFormulaXLocale(locale);
  return FORMULAX_RUNTIME_MESSAGES[normalizedLocale][key]
    ?? FORMULAX_RUNTIME_MESSAGES[DEFAULT_FORMULAX_LOCALE][key];
}
