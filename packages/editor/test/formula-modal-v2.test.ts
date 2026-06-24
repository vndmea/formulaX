import { describe, expect, it } from 'vitest';
import { ensureFormulaXModalStyles, mountFormulaXEditor } from '../src/formula-modal';

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

  it('does not mount undo and redo controls in the runtime toolbar', async () => {
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

    // TODO: Restore these expectations when toolbar-level undo/redo is redesigned and remounted.
    // host.querySelector<HTMLButtonElement>('[data-formulax-toolbar-action="undo"]')?.click();
    // expect(await mounted.getLatex()).toBe('x');
    // host.querySelector<HTMLButtonElement>('[data-formulax-toolbar-action="redo"]')?.click();
    // expect(await mounted.getLatex()).toBe('x\\frac{}{}');
    expect(host.querySelector('[data-formulax-toolbar-action="undo"]')).toBeNull();
    expect(host.querySelector('[data-formulax-toolbar-action="redo"]')).toBeNull();
    expect(host.querySelector('.fx-runtime-toolbar__history')).toBeNull();

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
    Object.defineProperty(shell, 'clientWidth', { configurable: true, value: 700 });
    shell!.getBoundingClientRect = () => ({
      left: 20,
      top: 10,
      right: 720,
      bottom: 90,
      width: 700,
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

  it('uses kity-style area paging buttons without opening the popover', async () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host') as HTMLElement;
    const mounted = mountFormulaXEditor(host, {
      runtime: 'v2',
      initialLatex: 'x',
      autofocus: false,
    });

    await mounted.getLatex();

    const prevButton = host.querySelector<HTMLButtonElement>(
      '[data-formulax-toolbar-area-action="prev"]',
    );
    const nextButton = host.querySelector<HTMLButtonElement>(
      '[data-formulax-toolbar-area-action="next"]',
    );
    const openButton = host.querySelector<HTMLButtonElement>('.fx-runtime-toolbar__area-open');
    const popover = host.querySelector<HTMLElement>('.fx-runtime-toolbar__popover');
    const before = Array.from(
      host.querySelectorAll<HTMLElement>('.fx-runtime-toolbar__area-item'),
      (item) => item.dataset.formulaxToolbarLatex,
    );

    expect(prevButton).not.toBeNull();
    expect(nextButton).not.toBeNull();
    expect(openButton).not.toBeNull();
    expect(prevButton?.disabled).toBe(true);
    expect(nextButton?.disabled).toBe(false);

    nextButton?.click();

    const after = Array.from(
      host.querySelectorAll<HTMLElement>('.fx-runtime-toolbar__area-item'),
      (item) => item.dataset.formulaxToolbarLatex,
    );
    expect(popover?.classList.contains('is-hidden')).toBe(true);
    expect(after).not.toEqual(before);
    expect(prevButton?.disabled).toBe(false);

    openButton?.click();

    expect(popover?.classList.contains('is-hidden')).toBe(false);

    mounted.destroy();
  });

  it('renders toolbar previews through renderer-next without mounting history controls', async () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host') as HTMLElement;
    const mounted = mountFormulaXEditor(host, {
      runtime: 'v2',
      initialLatex: 'x',
      autofocus: false,
    });

    await mounted.getLatex();
    ensureFormulaXModalStyles(document);

    const fractionButton = host.querySelector<HTMLButtonElement>(
      '[data-formulax-toolbar-button="fraction"]',
    );
    const fractionIcon = fractionButton?.querySelector<HTMLElement>(
      '.fx-runtime-toolbar__button-icon',
    );
    const scriptsButton = host.querySelector<HTMLButtonElement>(
      '[data-formulax-toolbar-button="scripts"]',
    );
    const scriptsIcon = scriptsButton?.querySelector<HTMLElement>(
      '.fx-runtime-toolbar__button-icon',
    );
    const largeOpsButton = host.querySelector<HTMLButtonElement>(
      '[data-formulax-toolbar-button="large-ops"]',
    ) ?? host.querySelector<HTMLButtonElement>(
      '[data-formulax-toolbar-button="大型-运算符"]',
    );
    await expect.poll(() => fractionIcon?.querySelector('svg')).not.toBeNull();
    await expect.poll(() => scriptsIcon?.querySelector('svg')).not.toBeNull();
    expect(fractionIcon?.style.backgroundImage).toBe('');
    expect(fractionIcon?.querySelector('[data-formulax-role="placeholder"]')).toBeNull();
    expect(scriptsIcon?.style.backgroundImage).toBe('');
    expect(scriptsIcon?.querySelector('[data-formulax-role="placeholder"]')).toBeNull();
    expect(
      largeOpsButton?.querySelector('.fx-runtime-toolbar__button-label > .fx-runtime-toolbar__button-sign'),
    ).not.toBeNull();
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
    await expect.poll(() => (
      host.querySelector<SVGTextElement>('.fx-runtime-toolbar__area-item text')
        ?.getAttribute('font-size')
    )).toBe('20');
    await expect.poll(() => (
      host.querySelector<SVGTextElement>('.fx-runtime-toolbar__area-item text')
        ?.getAttribute('text-anchor')
    )).toBe('middle');
    await expect.poll(() => Number.parseFloat(
      host.querySelector<SVGTextElement>('.fx-runtime-toolbar__area-item text')
        ?.getAttribute('x') ?? '0',
    )).toBeGreaterThan(0);
    const areaItemStyle = getComputedStyle(
      host.querySelector<HTMLElement>('.fx-runtime-toolbar__area-item') as HTMLElement,
    );
    const areaInnerStyle = getComputedStyle(
      host.querySelector<HTMLElement>('.fx-runtime-toolbar__area-item .fx-runtime-toolbar__area-item-inner') as HTMLElement,
    );
    expect(areaItemStyle.width).toBe('26px');
    expect(areaItemStyle.height).toBe('26px');
    expect(areaInnerStyle.width).toBe('34px');
    expect(areaInnerStyle.height).toBe('34px');
    expect(areaInnerStyle.transform).toContain('0.76');
    expect(
      host.querySelectorAll('.fx-runtime-toolbar__area-button-container > button').length,
    ).toBe(3);
    // TODO: Restore these layout assertions when toolbar-level undo/redo is redesigned and remounted.
    // const controls = Array.from(
    //   host.querySelectorAll<HTMLElement>('.fx-runtime-toolbar__button'),
    // );
    // const undoIndex = controls.findIndex((item) => item.dataset.formulaxToolbarAction === 'undo');
    // const redoIndex = controls.findIndex((item) => item.dataset.formulaxToolbarAction === 'redo');
    // const fractionIndex = controls.findIndex((item) => item.dataset.formulaxToolbarButton === 'fraction');
    // expect(undoIndex).toBeGreaterThan(0);
    // expect(redoIndex).toBe(undoIndex + 1);
    // expect(fractionIndex).toBe(redoIndex + 1);
    // expect(
    //   controls[redoIndex]
    //     ?.closest('.fx-runtime-toolbar__history')
    //     ?.nextElementSibling
    //     ?.getAttribute('data-formulax-toolbar-button'),
    // ).toBe('fraction');
    // expect(
    //   controls[undoIndex]
    //     ?.closest('.fx-runtime-toolbar__history')
    //     ?.previousElementSibling
    //     ?.classList.contains('fx-runtime-toolbar__delimiter'),
    // ).toBe(true);
    expect(host.querySelector('[data-formulax-toolbar-action="undo"]')).toBeNull();
    expect(host.querySelector('[data-formulax-toolbar-action="redo"]')).toBeNull();
    expect(host.querySelector('.fx-runtime-toolbar__history')).toBeNull();

    const itemButton = fractionPreview?.closest<HTMLElement>('.fx-runtime-toolbar__item');
    const itemContent = fractionPreview?.closest<HTMLElement>('.fx-runtime-toolbar__item-content');
    expect(getComputedStyle(itemButton as HTMLElement).width).toBe('68px');
    expect(getComputedStyle(itemButton as HTMLElement).height).toBe('87px');
    expect(getComputedStyle(itemContent as HTMLElement).width).toBe('68px');
    expect(getComputedStyle(itemContent as HTMLElement).height).toBe('87px');
    expect(getComputedStyle(fractionPreview as HTMLElement).width).toBe('56px');
    expect(getComputedStyle(fractionPreview as HTMLElement).height).toBe('75px');

    mounted.destroy();
  });

  it('does not emit kf or kity class names in the runtime-v2 DOM', async () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host') as HTMLElement;
    const mounted = mountFormulaXEditor(host, {
      runtime: 'v2',
      initialLatex: 'x',
      autofocus: false,
    });

    await mounted.getLatex();
    ensureFormulaXModalStyles(document);

    expect(host.innerHTML.toLowerCase()).not.toContain('kf-');
    expect(host.innerHTML.toLowerCase()).not.toContain('kity');

    mounted.destroy();
  });

  it('uses kity-style popover grids for symbols and vertical presets', async () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host') as HTMLElement;
    const mounted = mountFormulaXEditor(host, {
      runtime: 'v2',
      initialLatex: 'x',
      autofocus: false,
    });

    await mounted.getLatex();
    ensureFormulaXModalStyles(document);

    const presetsBadge = host.querySelector<HTMLElement>(
      '.fx-runtime-toolbar__button--presets .fx-runtime-toolbar__button-icon',
    );
    expect(presetsBadge?.querySelector('svg')).not.toBeNull();
    expect(getComputedStyle(presetsBadge as HTMLElement).color).toBe('rgb(83, 184, 86)');

    host.querySelector<HTMLButtonElement>('.fx-runtime-toolbar__area-open')?.click();
    const symbolGrid = host.querySelector<HTMLElement>('.fx-runtime-toolbar__grid--symbols');
    const symbolItem = host.querySelector<HTMLElement>('.fx-runtime-toolbar__item--symbols');
    expect(symbolGrid).not.toBeNull();
    expect(getComputedStyle(symbolItem as HTMLElement).width).toBe('32px');
    expect(getComputedStyle(symbolItem as HTMLElement).height).toBe('32px');

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));

    const presetsButton = host.querySelector<HTMLButtonElement>('.fx-runtime-toolbar__button');
    const presetsIcon = presetsButton?.querySelector<HTMLElement>('.fx-runtime-toolbar__button-icon');
    expect(presetsIcon?.dataset.formulaxToolbarPreview).toBeUndefined();
    expect(presetsIcon?.querySelector('svg')).not.toBeNull();
    presetsButton?.click();

    const presetsGrid = host.querySelector<HTMLElement>('.fx-runtime-toolbar__grid--presets');
    const presetsItem = host.querySelector<HTMLElement>('.fx-runtime-toolbar__item--presets');
    const presetsPreview = host.querySelector<HTMLElement>(
      '.fx-runtime-toolbar__item--presets .fx-runtime-toolbar__item-preview--template',
    );
    expect(presetsGrid).not.toBeNull();
    expect(getComputedStyle(presetsItem as HTMLElement).display).toBe('block');
    expect(getComputedStyle(presetsPreview as HTMLElement).width).toBe('100%');
    expect(getComputedStyle(presetsPreview as HTMLElement).height).toBe('73px');
    expect(getComputedStyle(presetsPreview as HTMLElement).overflow).toBe('hidden');
    await expect.poll(() => presetsPreview?.querySelector('.fx-runtime-svg')).not.toBeNull();
    await expect.poll(() => (
      presetsPreview?.querySelector<SVGTextElement>('text')?.getAttribute('font-size')
    )).toBe('24');
    const presetsSvgStyle = getComputedStyle(
      presetsPreview?.querySelector('.fx-runtime-svg') as HTMLElement,
    );
    expect(presetsSvgStyle.maxWidth).toBe('100%');
    expect(presetsSvgStyle.maxHeight).toBe('100%');

    mounted.destroy();
  });

  it('shows symbol catalog sections in a single popover without category switching', async () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host') as HTMLElement;
    const mounted = mountFormulaXEditor(host, {
      runtime: 'v2',
      initialLatex: 'x',
      autofocus: false,
    });

    await mounted.getLatex();
    ensureFormulaXModalStyles(document);

    host.querySelector<HTMLButtonElement>('.fx-runtime-toolbar__area-open')?.click();
    const sections = Array.from(
      host.querySelectorAll<HTMLElement>('.fx-runtime-toolbar__popover .fx-runtime-toolbar__section'),
    );

    expect(sections.length).toBeGreaterThan(4);

    mounted.destroy();
  });

  it('preserves styled symbol preview font families', async () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host') as HTMLElement;
    const mounted = mountFormulaXEditor(host, {
      runtime: 'v2',
      initialLatex: 'x',
      autofocus: false,
      locale: 'en_US',
    });

    await mounted.getLatex();
    ensureFormulaXModalStyles(document);

    host.querySelector<HTMLButtonElement>('.fx-runtime-toolbar__area-open')?.click();
    const scriptPreview = host.querySelector<HTMLElement>(
      '[data-formulax-toolbar-latex="\\\\mathcal{A}"] .fx-runtime-toolbar__item-preview--symbol',
    );

    await expect.poll(() => scriptPreview?.querySelector('text')?.getAttribute('font-family'))
      .toContain('KF AMS CAL');
    await expect.poll(() => scriptPreview?.querySelector('text')?.getAttribute('font-size'))
      .toBe('20');
    await expect.poll(() => scriptPreview?.querySelector('text')?.getAttribute('text-anchor'))
      .toBe('middle');
    await expect.poll(() => Number.parseFloat(
      scriptPreview?.querySelector('text')?.getAttribute('x') ?? '0',
    )).toBeGreaterThan(0);

    mounted.destroy();
  });

  it('preserves the kity toolbar line breaks for English labels', async () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host') as HTMLElement;
    const mounted = mountFormulaXEditor(host, {
      runtime: 'v2',
      initialLatex: 'x',
      autofocus: false,
      locale: 'en_US',
    });

    await mounted.getLatex();
    ensureFormulaXModalStyles(document);

    const fraction = host.querySelector<HTMLElement>('[data-formulax-toolbar-control="fraction"] .fx-runtime-toolbar__button-label');
    const largeOps = host.querySelector<HTMLElement>('[data-formulax-toolbar-control="large-ops"]');
    const largeOpsLabel = largeOps?.querySelector<HTMLElement>('.fx-runtime-toolbar__button-label');
    const largeOpsSign = largeOps?.querySelector<HTMLElement>('.fx-runtime-toolbar__button-sign');
    expect(fraction?.innerHTML.startsWith('Fraction<br>')).toBe(true);
    expect(fraction?.querySelector('.fx-runtime-toolbar__button-sign')).not.toBeNull();
    expect(largeOpsLabel?.innerHTML.startsWith('Large<br>ops')).toBe(true);
    expect(largeOpsLabel?.querySelector('.fx-runtime-toolbar__button-sign')).toBe(largeOpsSign);
    expect(getComputedStyle(largeOpsSign as HTMLElement).marginLeft).toBe('3px');
    expect(getComputedStyle(largeOpsSign as HTMLElement).marginRight).toBe('0px');

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

    expect(host.querySelector('.fx-formula-runtime-surface')).not.toBeNull();
    expect(host.querySelector('.fx-runtime-editor__surface.fx-formula-runtime-canvas')).not.toBeNull();

    mounted.destroy();
  });
});
