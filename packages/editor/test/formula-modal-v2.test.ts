import { describe, expect, it } from 'vitest';
import { mountFormulaXEditor } from '../src/formula-modal';

describe('mountFormulaXEditor runtime=v2', () => {
  it('mounts the new runtime editor and exposes latex and svg html', async () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host') as HTMLElement;
    const mounted = mountFormulaXEditor(host, {
      runtime: 'v2',
      initialLatex: '\\sqrt{x+1}',
      autofocus: false,
    });

    expect(await mounted.getLatex()).toBe('\\sqrt{x+1}');
    expect(await mounted.getRenderHtml()).toContain('data-formulax-runtime="solid-svg"');

    mounted.destroy();
    expect(host.innerHTML).toBe('');
  });
});
