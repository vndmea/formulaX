import { describe, expect, it } from 'vitest';
import { createRuntimeEditor } from '../src/editor/create-editor';

describe('FormulaRuntimeEditor', () => {
  it('mounts, updates latex, and returns svg markup', async () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById('root') as HTMLElement;
    const handle = await createRuntimeEditor(root, {
      initialLatex: '\\frac{a}{b}',
      autofocus: false,
    });

    expect(handle.getLatex()).toBe('\\frac{a}{b}');
    expect(handle.getRenderHtml()).toContain('<svg');

    handle.setLatex('x^2');
    expect(handle.getLatex()).toBe('x^2');
    expect(handle.getRenderHtml()).toContain('data-formulax-runtime="solid-svg"');

    handle.destroy();
    expect(root.innerHTML).toBe('');
  });
});
