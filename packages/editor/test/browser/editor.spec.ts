import { expect, test, type Page } from '@playwright/test';

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
