import { expect, test, type Page, type Request, type Response } from '@playwright/test';

type BrowserEditorHandleLike = {
  execCommand: (name: string) => unknown;
  requestService: (name: string) => { height: number };
};

type BrowserMountedEditor = {
  ready: (cb: (this: BrowserEditorHandleLike) => void) => void;
  getHandle: () => Promise<unknown>;
  execCommand: (name: string, value?: string) => Promise<unknown>;
};

type BrowserEditorOptions = {
  initialLatex?: string;
  height?: number | string;
  autofocus?: boolean;
  locale?: 'en_US' | 'zh_CN';
  hostWidth?: string;
  hostHeight?: string;
  hostStyles?: Record<string, string>;
  render?: {
    fontsize?: number;
  };
  mountWithElement?: boolean;
};

declare global {
  interface Window {
    __fxEditors?: Record<string, BrowserMountedEditor>;
  }
}

async function mountEditor(
  page: Page,
  id: string,
  options: BrowserEditorOptions = {},
) {
  await page.evaluate(({ id, options }) => {
    const Editor = window.FormulaXEditor!;
    const existing = document.getElementById(id);
    existing?.remove();

    const container = document.createElement('div');
    container.id = id;
    if (options.hostWidth) {
      container.style.width = options.hostWidth;
    }
    if (options.hostHeight) {
      container.style.height = options.hostHeight;
    }
    if (options.hostStyles) {
      Object.assign(container.style, options.hostStyles);
    }
    document.body.appendChild(container);

    const editor = new Editor({
      ...options,
      el: options.mountWithElement ? container : `#${id}`,
    });

    window.__fxEditors ??= {};
    window.__fxEditors[id] = editor as unknown as BrowserMountedEditor;
  }, { id, options });

  return page.locator(`#${id} .kf-editor`);
}

async function getEditorSource(page: Page, id: string) {
  return page.evaluate(({ id }) => {
    return new Promise<string>((resolve) => {
      window.__fxEditors![id].ready(function ready() {
        resolve(String(this.execCommand('get.source')));
      });
    });
  }, { id });
}

async function getRenderedContentHeight(page: Page, id: string) {
  return page.evaluate(({ id }) => {
    return new Promise<number>((resolve) => {
      window.__fxEditors![id].ready(function ready() {
        resolve(this.requestService('render.get.content.size').height);
      });
    });
  }, { id });
}

async function expectNoRuntimeErrors(page: Page, action: () => Promise<void>, ignore: RegExp[] = []) {
  const errors: string[] = [];
  const handler = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (ignore.some((pattern) => pattern.test(text))) {
        return;
      }
      errors.push(text);
    }
  };

  page.on('console', handler as never);
  try {
    await action();
  } finally {
    page.off('console', handler as never);
  }

  expect(errors).toEqual([]);
}

function isTrackedAssetUrl(url: string) {
  return /\.(css|woff2?|png|svg)(?:[?#].*)?$/i.test(url);
}

async function expectNoAssetLoadFailures(page: Page, action: () => Promise<void>) {
  const failures: string[] = [];
  const onRequestFailed = (request: Request) => {
    if (!isTrackedAssetUrl(request.url())) {
      return;
    }
    failures.push(`requestfailed ${request.failure()?.errorText ?? 'unknown error'} ${request.url()}`);
  };
  const onResponse = (response: Response) => {
    if (!isTrackedAssetUrl(response.url()) || response.status() < 400) {
      return;
    }
    failures.push(`response ${response.status()} ${response.url()}`);
  };

  page.on('requestfailed', onRequestFailed);
  page.on('response', onResponse);
  try {
    await action();
    await page.waitForTimeout(250);
  } finally {
    page.off('requestfailed', onRequestFailed);
    page.off('response', onResponse);
  }

  expect(failures).toEqual([]);
}

async function openToolbarPopupByText(page: Page, editorId: string, label: string) {
  await page.locator(`#${editorId} .kf-editor-toolbar`).getByText(label).first().click();
  const popup = page.locator(`#${editorId} .kf-editor-ui-box:visible`).first();
  await expect(popup).toBeVisible();
  return popup;
}

test.describe('FormulaX Editor', () => {
  test('page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await expect(page).toHaveTitle('FormulaX Playground');
    expect(errors.filter((error) => !error.includes('favicon'))).toHaveLength(0);
  });

  test('playground bootstraps a default editor instance', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#app .kf-editor')).toBeVisible();
    const inputValue = await page.locator('#app .kf-editor-input-box').inputValue();
    expect(inputValue).toContain('\\frac');
    expect(inputValue).toContain('\\sqrt');
  });

  test('loads Kity css, font and image assets without network failures', async ({ page }) => {
    await expectNoAssetLoadFailures(page, async () => {
      await page.goto('/');
      await expect(page.locator('#app .kf-editor')).toBeVisible();
      await expect(page.locator('#app .kf-editor-toolbar')).toBeVisible();

      await page.locator('#app .kf-editor-toolbar').getByText('Fraction').first().click();
      await expect(page.locator('#app .kf-editor-ui-box:visible').first()).toBeVisible();

      await page.evaluate(async () => {
        await document.fonts.ready;
      });
    });
  });

  test('formulax editor instance is available on window', async ({ page }) => {
    await page.goto('/');
    const hasEditor = await page.evaluate(() => typeof window.FormulaXEditor !== 'undefined');
    expect(hasEditor).toBe(true);
  });

  test('multiple containers can be created', async ({ page }) => {
    await page.goto('/');
    const editor1 = await mountEditor(page, 'editor1', { autofocus: false });
    const editor2 = await mountEditor(page, 'editor2', { autofocus: false });

    await expect(editor1).toBeVisible();
    await expect(editor2).toBeVisible();
    const source1 = await getEditorSource(page, 'editor1');
    const source2 = await getEditorSource(page, 'editor2');
    expect(source1).toContain('\\frac');
    expect(source1).toContain('\\sqrt');
    expect(source2).toBe(source1);
  });

  test('initialLatex option renders custom formula', async ({ page }) => {
    await page.goto('/');
    const customEditor = await mountEditor(page, 'custom-latex', {
      initialLatex: 'a+b=c',
      autofocus: false,
    });

    await expect(customEditor).toBeVisible();
    await expect.poll(() => getEditorSource(page, 'custom-latex')).toBe('a+b=c');
  });

  test('height option sets container height', async ({ page }) => {
    await page.goto('/');
    const heightEditor = await mountEditor(page, 'height-editor', {
      height: 300,
      autofocus: false,
    });

    await expect(heightEditor).toBeVisible();
    await expect(heightEditor).toHaveCSS('height', '300px');
  });

  test('autofocus option controls focus behavior', async ({ page }) => {
    await page.goto('/');
    const noFocusEditor = await mountEditor(page, 'no-focus-editor', {
      autofocus: false,
      initialLatex: 'x=1',
    });

    await expect(noFocusEditor).toBeVisible();

    const isInputFocused = await page.evaluate(() => {
      const input = document.querySelector('#no-focus-editor .kf-editor-input-box');
      return document.activeElement === input;
    });

    expect(isInputFocused).toBe(false);
  });

  test('ready callback receives editor handle', async ({ page }) => {
    await page.goto('/');
    const readyPayload = await page.evaluate(() => {
      return new Promise<{ hasExecCommand: boolean; source: string }>((resolve) => {
        const container = document.createElement('div');
        container.id = 'ready-test';
        document.body.appendChild(container);

        const editor = new (window.FormulaXEditor!)({
          el: '#ready-test',
          initialLatex: 'x=1',
          autofocus: false,
        });

        editor.ready(function ready() {
          resolve({
            hasExecCommand: typeof this.execCommand === 'function',
            source: String(this.execCommand('get.source')),
          });
        });
      });
    });

    expect(readyPayload).toEqual({
      hasExecCommand: true,
      source: 'x=1',
    });
  });

  test('destroy cleans up container', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(async () => {
      const container = document.createElement('div');
      container.id = 'destroy-test';
      document.body.appendChild(container);
      const editor = new (window.FormulaXEditor!)({
        el: '#destroy-test',
        initialLatex: 'x=1',
      });
      await editor.getHandle();
      editor.destroy();
    });

    const destroyTest = page.locator('#destroy-test');
    await expect(destroyTest).toBeEmpty();
  });

  test('execCommand render updates the formula source after ready', async ({ page }) => {
    await page.goto('/');
    const execEditor = await mountEditor(page, 'exec-test', {
      autofocus: false,
    });

    await expect(execEditor).toBeVisible();

    await page.evaluate(async () => {
      const editor = window.__fxEditors!['exec-test'];
      await editor.getHandle();
      await editor.execCommand('render', 'x^2+1');
    });

    await expect.poll(() => getEditorSource(page, 'exec-test')).toBe('{x}^{2}+1');
  });

  test('typing before using the toolbar keeps cursor state fresh', async ({ page }) => {
    await page.goto('/');
    const staleEditor = await mountEditor(page, 'stale-cursor-test', {
      initialLatex: 'x',
    });

    await expect(staleEditor).toBeVisible();
    const input = page.locator('#stale-cursor-test .kf-editor-input-box');
    await input.fill('abc');

    await expectNoRuntimeErrors(page, async () => {
      await page.locator('#stale-cursor-test .kf-editor-toolbar').getByText('Fraction').first().click();
      await page.locator('#stale-cursor-test .kf-editor-ui-box-item[data-value="\\\\frac \\\\placeholder\\\\placeholder"]').first().click();
    }, [/favicon/i]);

    await expect.poll(() => getEditorSource(page, 'stale-cursor-test')).toContain('\\frac');
  });

  test('locale option supports zh_CN toolbar labels', async ({ page }) => {
    await page.goto('/');
    const localizedEditor = await mountEditor(page, 'locale-zh-editor', {
      autofocus: false,
      locale: 'zh_CN',
    });

    await expect(localizedEditor).toBeVisible();
    await expect(page.locator('#locale-zh-editor .kf-editor-toolbar').getByText('分数').first()).toBeVisible();
  });

  test('default en_US toolbar stays compact and dropdowns remain visible in modal-sized hosts', async ({ page }) => {
    await page.goto('/');
    const localizedEditor = await mountEditor(page, 'locale-en-editor', {
      hostWidth: '860px',
      hostHeight: '264px',
      height: '100%',
      hostStyles: {
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: '9999',
        background: '#fff',
      },
    });

    await expect(localizedEditor).toBeVisible();

    const toolbarHeight = await page.locator('#locale-en-editor .kf-editor-toolbar').evaluate((node) => {
      return Math.round(node.getBoundingClientRect().height);
    });
    expect(toolbarHeight).toBeLessThanOrEqual(104);

    await page.locator('#locale-en-editor .kf-editor-toolbar').getByText('Fraction').first().click();
    const presetsBox = page.locator('#locale-en-editor .kf-editor-ui-box:visible').first();
    await expect(presetsBox).toBeVisible();

    const boxRect = await presetsBox.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
      };
    });
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    expect(boxRect.top).toBeGreaterThanOrEqual(0);
    expect(boxRect.bottom).toBeLessThanOrEqual(viewportHeight);
  });

  test('presets dropdown keeps formula cards stacked vertically', async ({ page }) => {
    await page.goto('/');
    const localizedEditor = await mountEditor(page, 'presets-layout-editor', {
      hostWidth: '860px',
      hostHeight: '264px',
      height: '100%',
      hostStyles: {
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: '9999',
        background: '#fff',
      },
    });

    await expect(localizedEditor).toBeVisible();
    await page.locator('#presets-layout-editor .kf-editor-ui-yushe-btn').first().click();

    const itemTops = await page.locator('#presets-layout-editor .kf-editor-ui-box:visible .kf-editor-ui-box-item').evaluateAll((nodes) => {
      return nodes.slice(0, 3).map((node) => Math.round(node.getBoundingClientRect().top));
    });

    expect(itemTops).toHaveLength(3);
    expect(itemTops[1]).toBeGreaterThan(itemTops[0]);
    expect(itemTops[2]).toBeGreaterThan(itemTops[1]);
  });

  test('all toolbar dropdown panels stay visible in modal-sized hosts', async ({ page }) => {
    await page.goto('/');
    const editor = await mountEditor(page, 'all-popups-editor', {
      hostWidth: '860px',
      hostHeight: '264px',
      height: '100%',
      hostStyles: {
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: '9999',
        background: '#fff',
      },
    });

    await expect(editor).toBeVisible();

    const labels = ['Presets', 'Fraction', 'Scripts', 'Radicals', 'Integrals', 'Large', 'Brackets', 'Functions'];

    for (const label of labels) {
      const popup = await openToolbarPopupByText(page, 'all-popups-editor', label);
      const metrics = await popup.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return {
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          width: Math.round(rect.width),
          itemCount: node.querySelectorAll('.kf-editor-ui-box-item').length,
        };
      });

      const viewportHeight = await page.evaluate(() => window.innerHeight);
      expect(metrics.width).toBeGreaterThan(100);
      expect(metrics.itemCount).toBeGreaterThan(0);
      expect(metrics.top).toBeGreaterThanOrEqual(0);
      expect(metrics.bottom).toBeLessThanOrEqual(viewportHeight);

      await page.mouse.click(1200, 40);
    }

    await page.locator('#all-popups-editor .kf-editor-ui-area-button').click();
    const areaPopup = page.locator('#all-popups-editor .kf-editor-ui-area-mount .kf-editor-ui-box:visible').first();
    await expect(areaPopup).toBeVisible();

    const areaMetrics = await areaPopup.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        itemCount: node.querySelectorAll('.kf-editor-ui-overlap-button, .kf-editor-ui-box-item').length,
      };
    });
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    expect(areaMetrics.itemCount).toBeGreaterThan(0);
    expect(areaMetrics.top).toBeGreaterThanOrEqual(0);
    expect(areaMetrics.bottom).toBeLessThanOrEqual(viewportHeight);
  });

  test('integrals dropdown wraps items onto multiple rows when needed', async ({ page }) => {
    await page.goto('/');
    const editor = await mountEditor(page, 'integrals-wrap-editor', {
      hostWidth: '860px',
      hostHeight: '264px',
      height: '100%',
      hostStyles: {
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: '9999',
        background: '#fff',
      },
    });

    await expect(editor).toBeVisible();

    const popup = await openToolbarPopupByText(page, 'integrals-wrap-editor', 'Integrals');
    const itemTops = await popup.locator('.kf-editor-ui-box-item').evaluateAll((nodes) => {
      return nodes.map((node) => Math.round(node.getBoundingClientRect().top));
    });

    const distinctRows = new Set(itemTops);
    expect(distinctRows.size).toBeGreaterThan(1);
  });

  test('invalid selector throws error', async ({ page }) => {
    await page.goto('/');
    const errorMessage = await page.evaluate(() => {
      try {
        new (window.FormulaXEditor!)({ el: '#non-existent-selector-xyz' });
        return null;
      } catch (error) {
        return error instanceof Error ? error.message : String(error);
      }
    });

    expect(errorMessage).toContain('mount target not found');
  });

  test('HTMLElement can be passed directly', async ({ page }) => {
    await page.goto('/');
    const elementEditor = await mountEditor(page, 'element-test', {
      mountWithElement: true,
      initialLatex: 'y=mx+b',
      autofocus: false,
    });

    await expect(elementEditor).toBeVisible();
    await expect.poll(() => getEditorSource(page, 'element-test')).toBe('y=mx+b');
  });

  test('render fontsize option increases rendered formula height', async ({ page }) => {
    await page.goto('/');
    const defaultEditor = await mountEditor(page, 'fontsize-default', {
      initialLatex: '\\int_0^1 x dx',
      autofocus: false,
    });
    const customEditor = await mountEditor(page, 'fontsize-custom', {
      initialLatex: '\\int_0^1 x dx',
      autofocus: false,
      render: { fontsize: 60 },
    });

    await expect(defaultEditor).toBeVisible();
    await expect(customEditor).toBeVisible();

    await expect.poll(async () => {
      const defaultHeight = await getRenderedContentHeight(page, 'fontsize-default');
      const customHeight = await getRenderedContentHeight(page, 'fontsize-custom');
      return customHeight > defaultHeight;
    }).toBe(true);
  });
});
