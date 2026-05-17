import { describe, expect, test } from 'vitest';

import { resolveUnicode } from '../src/formula-symbols';
import { getFormulaXRuntimeMessage, translateFormulaXText } from '../src/i18n';
import { createToolbarConfig } from '../src/legacy/toolbar-config';

function findButtonLabel(config: ReturnType<typeof createToolbarConfig>, label: string) {
  return config.find((item) => item?.options?.button?.label === label);
}

describe('createToolbarConfig', () => {
  test('uses en_US labels by default', () => {
    const config = createToolbarConfig();

    const presets = findButtonLabel(config, 'Presets<br/>');
    const fraction = findButtonLabel(config, 'Fraction<br/>');

    expect(presets).toBeTruthy();
    expect(fraction).toBeTruthy();
    expect(fraction?.options.box.group[0].title).toBe('Fraction');
  });

  test('supports zh_CN labels explicitly', () => {
    const config = createToolbarConfig('zh_CN');

    const presets = findButtonLabel(config, '预设<br/>');
    const fraction = findButtonLabel(config, '分数<br/>');

    expect(presets).toBeTruthy();
    expect(fraction).toBeTruthy();
    expect(fraction?.options.box.group[0].title).toBe('分数');
  });

  test('falls back to en_US for unknown locales', () => {
    const config = createToolbarConfig('fr_FR' as never);
    const fraction = findButtonLabel(config, 'Fraction<br/>');

    expect(fraction).toBeTruthy();
  });

  test('translates toolbar text through the shared i18n helper', () => {
    expect(translateFormulaXText('toolbar', '积分<br/>', 'en_US')).toBe('Integrals<br/>');
    expect(translateFormulaXText('toolbar', '大型<br/>运算符', 'en_US')).toBe('Large<br/>ops');
    expect(translateFormulaXText('toolbar', '积分<br/>', 'zh_CN')).toBe('积分<br/>');
  });

  test('resolves runtime placeholder messages by locale', () => {
    expect(getFormulaXRuntimeMessage('editor.placeholder.root', 'en_US')).toBe('Type formula here');
    expect(getFormulaXRuntimeMessage('editor.placeholder.root', 'zh_CN')).toBe('请输入公式');
  });

  test('resolves vertical arrow unicode symbols correctly', () => {
    expect(resolveUnicode('\\updownarrow')).toEqual({ char: '\u2195' });
    expect(resolveUnicode('\\Updownarrow')).toEqual({ char: '\u21D5' });
  });
});
