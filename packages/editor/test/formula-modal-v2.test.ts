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

  it('aligns the symbol area popover with the left edge of the kity area container', async () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host') as HTMLElement;
    const mounted = mountFormulaXEditor(host, {
      runtime: 'v2',
      initialLatex: 'x',
      autofocus: false,
    });

    await mounted.getLatex();

    const shell = host.querySelector<HTMLElement>('.fx-runtime-toolbar');
    const areaContainer = host.querySelector<HTMLElement>('.fx-runtime-toolbar__area-container');
    const areaOpen = host.querySelector<HTMLButtonElement>('.fx-runtime-toolbar__area-open');
    const popover = host.querySelector<HTMLElement>('.fx-runtime-toolbar__popover');
    Object.defineProperty(shell, 'clientWidth', { configurable: true, value: 600 });
    shell!.getBoundingClientRect = () => ({
      left: 20,
      top: 10,
      right: 620,
      bottom: 90,
      width: 600,
      height: 80,
      x: 20,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect);
    areaContainer!.getBoundingClientRect = () => ({
      left: 120,
      top: 18,
      right: 413,
      bottom: 88,
      width: 293,
      height: 70,
      x: 120,
      y: 18,
      toJSON: () => ({}),
    } as DOMRect);
    areaOpen!.getBoundingClientRect = () => ({
      left: 414,
      top: 10,
      right: 432,
      bottom: 89,
      width: 18,
      height: 79,
      x: 414,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect);

    areaOpen?.click();

    expect(popover?.classList.contains('is-hidden')).toBe(false);
    expect(popover?.style.left).toBe('99px');

    mounted.destroy();
  });

  it('renders toolbar previews through renderer-next and keeps history controls beside the symbol area', async () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host') as HTMLElement;
    const mounted = mountFormulaXEditor(host, {
      runtime: 'v2',
      initialLatex: 'x',
      autofocus: false,
    });

    await mounted.getLatex();

    const fractionButton = host.querySelector<HTMLButtonElement>(
      '[data-formulax-toolbar-button="fraction"]',
    );
    const fractionIcon = fractionButton?.querySelector<HTMLElement>(
      '.fx-runtime-toolbar__button-icon',
    );
    const controls = Array.from(
      host.querySelectorAll<HTMLElement>('.fx-runtime-toolbar__button'),
    );

    await expect.poll(() => fractionIcon?.querySelector('svg')).not.toBeNull();
    expect(fractionIcon?.style.backgroundImage).toBe('');
    fractionButton?.click();
    const fractionPreview = host.querySelector<HTMLElement>(
      '[data-formulax-toolbar-latex="\\\\frac \\\\placeholder\\\\placeholder"] '
      + '.fx-runtime-toolbar__item-preview',
    );
    await expect.poll(() => fractionPreview?.querySelector('svg')).not.toBeNull();
    expect(fractionPreview?.style.backgroundImage).toBe('');
    expect(fractionPreview?.querySelector('[data-formulax-role="placeholder"]')).not.toBeNull();
    expect(fractionPreview?.textContent).not.toContain('□');
    await expect.poll(() => (
      host.querySelector<SVGTextElement>('.fx-runtime-toolbar__area-item text')
        ?.getAttribute('font-family')
    )).toContain('KF AMS MAIN');
    const areaItemStyle = getComputedStyle(
      host.querySelector<HTMLElement>('.fx-runtime-toolbar__area-item') as HTMLElement,
    );
    expect(areaItemStyle.display).toBe('flex');
    expect(areaItemStyle.alignItems).toBe('center');
    expect(controls[0]?.dataset.formulaxToolbarAction).toBe('undo');
    expect(controls[1]?.dataset.formulaxToolbarAction).toBe('redo');
    expect(
      controls[1]
        ?.closest('.fx-runtime-toolbar__history')
        ?.nextElementSibling
        ?.classList.contains('fx-runtime-toolbar__area'),
    ).toBe(true);

    const itemButton = fractionPreview?.closest<HTMLElement>('.fx-runtime-toolbar__item');
    const itemContent = fractionPreview?.closest<HTMLElement>('.fx-runtime-toolbar__item-content');
    expect(getComputedStyle(itemButton as HTMLElement).width).toBe('80px');
    expect(getComputedStyle(itemButton as HTMLElement).height).toBe('64px');
    expect(getComputedStyle(itemContent as HTMLElement).width).toBe('78px');
    expect(getComputedStyle(itemContent as HTMLElement).height).toBe('56px');
    expect(getComputedStyle(fractionPreview as HTMLElement).height).toBe('42px');

    mounted.destroy();
  });

  it('mounts the runtime surface as a kity-style editing area', async () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host') as HTMLElement;
    const mounted = mountFormulaXEditor(host, {
      runtime: 'v2',
      initialLatex: 'x',
      autofocus: false,
    });

    await mounted.getLatex();

    expect(host.querySelector('.fx-formula-runtime-surface.kf-editor-edit-area')).not.toBeNull();
    expect(host.querySelector('.fx-runtime-editor__surface.kf-editor-canvas-container')).not.toBeNull();

    mounted.destroy();
  });
});
