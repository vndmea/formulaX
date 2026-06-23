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

  it('clears history on setLatex by default and supports wrapped layout', async () => {
    document.body.innerHTML = '<div id="root" style="width: 160px"></div>';
    const root = document.getElementById('root') as HTMLElement;
    const handle = await createRuntimeEditor(root, {
      initialLatex: '',
      autofocus: false,
      wrap: 'soft',
      maxWidth: 120,
    });

    handle.editor.dispatch({
      type: 'insertText',
      payload: { text: 'abcdef' },
    });
    expect(handle.editor.canUndo()).toBe(true);

    handle.setLatex('a+b+c+d+e+f+g+h');
    expect(handle.editor.canUndo()).toBe(false);
    expect(handle.getRenderHtml()).toContain('data-formulax-line-index="1"');
  });
});
