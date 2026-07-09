import { describe, expect, it } from 'vitest';
import { getFormulaXRuntimeMessage, normalizeFormulaXLocale } from '../src/i18n';

describe('runtime i18n', () => {
  it('normalizes zh locale variants to zh_CN', () => {
    expect(normalizeFormulaXLocale('zh_CN')).toBe('zh_CN');
    expect(normalizeFormulaXLocale('zh-CN')).toBe('zh_CN');
    expect(normalizeFormulaXLocale('zh')).toBe('zh_CN');
    expect(normalizeFormulaXLocale('zh-Hans')).toBe('zh_CN');
  });

  it('falls back to en_US for unknown locales', () => {
    expect(normalizeFormulaXLocale('fr_FR')).toBe('en_US');
    expect(getFormulaXRuntimeMessage('editor.placeholder.root', 'fr_FR')).toBe('Type formula here');
  });

  it('resolves runtime placeholder messages by locale', () => {
    expect(getFormulaXRuntimeMessage('editor.placeholder.root', 'en_US')).toBe('Type formula here');
    expect(getFormulaXRuntimeMessage('editor.placeholder.root', 'zh_CN')).toBe('请输入公式');
  });
});
