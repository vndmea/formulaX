import { describe, expect, test } from 'vitest';
import { getFormulaXEditorMessage } from '../src';

describe('editor i18n', () => {
  test('resolves modal messages by locale', () => {
    expect(getFormulaXEditorMessage('modal.title', 'en_US')).toBe('FormulaX Editor');
    expect(getFormulaXEditorMessage('modal.title', 'zh_CN')).toBe('FormulaX 编辑器');
    expect(getFormulaXEditorMessage('modal.insert', 'zh_CN')).toBe('插入');
  });

  test('falls back to en_US for unknown locales', () => {
    expect(getFormulaXEditorMessage('modal.cancel', 'fr_FR' as never)).toBe('Cancel');
  });
});
