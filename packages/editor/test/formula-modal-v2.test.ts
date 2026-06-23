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

  it('renders a runtime toolbar and inserts structures from toolbar actions', async () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host') as HTMLElement;
    const mounted = mountFormulaXEditor(host, {
      runtime: 'v2',
      initialLatex: 'x',
      autofocus: false,
    });

    await mounted.getLatex();

    const fractionPanelButton = host.querySelector<HTMLButtonElement>('[data-formulax-toolbar-button="fraction"]');
    expect(fractionPanelButton).not.toBeNull();
    fractionPanelButton?.click();

    const fractionItem = host.querySelector<HTMLButtonElement>('[data-formulax-toolbar-latex="\\\\frac \\\\placeholder\\\\placeholder"]');
    expect(fractionItem).not.toBeNull();
    fractionItem?.click();

    expect(await mounted.getLatex()).toBe('x\\frac{}{}');

    mounted.destroy();
  });

  it('supports undo and redo from the runtime toolbar', async () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host') as HTMLElement;
    const mounted = mountFormulaXEditor(host, {
      runtime: 'v2',
      initialLatex: 'x',
      autofocus: false,
    });

    await mounted.getLatex();

    host.querySelector<HTMLButtonElement>('[data-formulax-toolbar-button="fraction"]')?.click();
    host.querySelector<HTMLButtonElement>('[data-formulax-toolbar-latex="\\\\frac \\\\placeholder\\\\placeholder"]')?.click();
    expect(await mounted.getLatex()).toBe('x\\frac{}{}');

    host.querySelector<HTMLButtonElement>('[data-formulax-toolbar-action="undo"]')?.click();
    expect(await mounted.getLatex()).toBe('x');

    host.querySelector<HTMLButtonElement>('[data-formulax-toolbar-action="redo"]')?.click();
    expect(await mounted.getLatex()).toBe('x\\frac{}{}');

    mounted.destroy();
  });

  it('renders floating popovers that close on outside click and insert nth roots', async () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host') as HTMLElement;
    const mounted = mountFormulaXEditor(host, {
      runtime: 'v2',
      initialLatex: 'x',
      autofocus: false,
    });

    await mounted.getLatex();

    host.querySelector<HTMLButtonElement>('[data-formulax-toolbar-button="radicals"]')?.click();
    const popover = host.querySelector<HTMLElement>('.fx-runtime-toolbar__popover');
    expect(popover?.classList.contains('is-hidden')).toBe(false);

    host.querySelector<HTMLButtonElement>('[data-formulax-toolbar-latex="\\\\sqrt [3] \\\\placeholder"]')?.click();
    expect(await mounted.getLatex()).toBe('x\\sqrt[3]{}');

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(popover?.classList.contains('is-hidden')).toBe(true);

    mounted.destroy();
  });
});
