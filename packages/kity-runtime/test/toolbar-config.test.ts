import { describe, expect, test } from 'vitest';

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
});
