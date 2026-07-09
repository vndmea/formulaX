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

  it('preserves top-level vertical offsets when rendering tall inline formulas', async () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById('root') as HTMLElement;
    const handle = await createRuntimeEditor(root, {
      initialLatex: 'x=\\frac {-b\\pm\\sqrt {b^2-4ac}}{2a}',
      autofocus: false,
    });

    const svgDoc = new DOMParser().parseFromString(handle.getRenderHtml(), 'image/svg+xml');
    const topLevelSymbols = Array.from(
      svgDoc.querySelectorAll('svg > g[data-formulax-line-index="0"] > g[data-formulax-box-kind="symbol"]'),
    );
    const firstSymbol = topLevelSymbols[0];
    const equalsSymbol = topLevelSymbols[1];

    expect(firstSymbol?.textContent).toBe('x');
    expect(equalsSymbol?.textContent).toBe('=');
    expect(firstSymbol?.getAttribute('transform')).toMatch(/translate\([^,]+,\s*(?!0(?:[.)]|$))[^)]+\)/);
    expect(equalsSymbol?.getAttribute('transform')).toMatch(/translate\([^,]+,\s*(?!0(?:[.)]|$))[^)]+\)/);

    handle.destroy();
  });

  it('localizes the root placeholder and preserves it across setLatex resets', async () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById('root') as HTMLElement;
    const handle = await createRuntimeEditor(root, {
      initialLatex: '',
      autofocus: false,
      locale: 'zh_CN',
    });

    expect(handle.getRenderHtml()).toContain('请输入公式');

    handle.setLatex('x');
    handle.setLatex('');
    expect(handle.getRenderHtml()).toContain('请输入公式');

    handle.destroy();
  });
});
