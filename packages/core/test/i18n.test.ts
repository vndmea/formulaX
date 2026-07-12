import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FORMULAX_LOCALE,
  FORMULAX_LOCALES,
  normalizeFormulaXLocale,
} from '../src/i18n';

describe('FormulaX locale helpers', () => {
  it('exposes the supported locale list and default locale', () => {
    expect(FORMULAX_LOCALES).toEqual(['en_US', 'zh_CN']);
    expect(DEFAULT_FORMULAX_LOCALE).toBe('en_US');
  });

  it('normalizes zh locale variants to zh_CN', () => {
    expect(normalizeFormulaXLocale('zh_CN')).toBe('zh_CN');
    expect(normalizeFormulaXLocale('zh-CN')).toBe('zh_CN');
    expect(normalizeFormulaXLocale('zh')).toBe('zh_CN');
    expect(normalizeFormulaXLocale('zh-Hans')).toBe('zh_CN');
  });

  it('falls back to en_US for unknown locales', () => {
    expect(normalizeFormulaXLocale()).toBe('en_US');
    expect(normalizeFormulaXLocale('fr_FR')).toBe('en_US');
  });
});
