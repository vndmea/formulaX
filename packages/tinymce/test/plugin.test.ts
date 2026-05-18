import { describe, expect, it, vi } from 'vitest';
import { createFormulaDisplayAttributes, createFormulaImageHtml } from '@formulaxjs/renderer-image';
import {
  createTinyMceFormulaMarkup,
  registerFormulaXTinyMcePlugin,
  resolveOptions,
} from '../src';

describe('registerFormulaXTinyMcePlugin', () => {
  it('registers plugin with constructable function for TinyMCE 5 compatibility', () => {
    let pluginFactory: unknown;

    const tinymce = {
      majorVersion: '5',
      PluginManager: {
        add(name: string, factory: unknown) {
          expect(name).toBe('formulax');
          pluginFactory = factory;
        },
      },
    };

    registerFormulaXTinyMcePlugin(tinymce as any);

    expect(typeof pluginFactory).toBe('function');
    expect(() => new (pluginFactory as any)(createFakeEditor())).not.toThrow();
  });

  it('registers FormulaXOpen command', () => {
    const commands = new Map<string, Function>();

    const tinymce = {
      majorVersion: '7',
      PluginManager: {
        add(_name: string, factory: unknown) {
          const editor = createFakeEditor(commands, new Map());
          (factory as any)(editor);
        },
      },
    };

    registerFormulaXTinyMcePlugin(tinymce as any);

    expect(commands.has('FormulaXOpen')).toBe(true);
  });

  it('registers formulax toolbar button', () => {
    const buttons = new Map<string, unknown>();

    const tinymce = {
      majorVersion: '7',
      PluginManager: {
        add(_name: string, factory: unknown) {
          const editor = createFakeEditor(new Map(), buttons);
          (factory as any)(editor);
        },
      },
    };

    registerFormulaXTinyMcePlugin(tinymce as any);

    expect(buttons.has('formulax')).toBe(true);
  });

  it('extends schema to preserve inline svg formula attributes', () => {
    const events = new Map<string, Function>();
    const addValidElements = vi.fn();

    const tinymce = {
      majorVersion: '7',
      PluginManager: {
        add(_name: string, factory: unknown) {
          const editor = createFakeEditor(new Map(), new Map(), events, addValidElements);
          (factory as any)(editor);
        },
      },
    };

    registerFormulaXTinyMcePlugin(tinymce as any);

    expect(addValidElements).toHaveBeenCalledTimes(1);
    expect(addValidElements.mock.calls[0]?.[0]).toContain('svg[');
    expect(addValidElements.mock.calls[0]?.[0]).toContain('img[');
    expect(addValidElements.mock.calls[0]?.[0]).toContain('viewbox');
    expect(addValidElements.mock.calls[0]?.[0]).toContain('preserveaspectratio');
  });

  it('resolves image output options', () => {
    expect(resolveOptions({
      output: 'image',
      image: {
        upload: vi.fn(),
      },
    })).toMatchObject({
      output: 'image',
    });
  });

  it('localizes modal defaults from the editor locale', () => {
    expect(resolveOptions({
      editor: {
        locale: 'zh_CN',
      },
    })).toMatchObject({
      modal: {
        title: 'FormulaX 编辑器',
        insertText: '插入',
        updateText: '更新',
        cancelText: '取消',
      },
      editor: {
        locale: 'zh_CN',
      },
    });
  });

  it('creates TinyMCE image markup with persisted image attrs', () => {
    const html = createTinyMceFormulaMarkup('\\sqrt{x}', {
      renderHtml: createFormulaImageHtml({
        src: 'http://localhost:3109/f/48231.png',
        latex: '\\sqrt{x}',
        className: 'formulax-math',
        width: 128,
        height: 48,
        style: 'width:2.5em; height:0.94em',
      }),
      extraAttributes: createFormulaDisplayAttributes({
        output: 'image',
        latex: '\\sqrt{x}',
        renderHtml: '',
        source: {
          engine: 'tinymce',
          output: 'svg',
          latex: '\\sqrt{x}',
          html: '',
        },
        image: {
          url: 'http://localhost:3109/f/48231.png',
          width: 128,
          height: 48,
          displayStyle: 'width:2.5em; height:0.94em',
        },
      }),
    });

    expect(html).toContain('data-mce-contenteditable="false"');
    expect(html).toContain('data-formulax-output="image"');
    expect(html).toContain('data-formulax-image-url="http://localhost:3109/f/48231.png"');
    expect(html).toContain('<img');
    expect(html).toContain('data-formulax-image="true"');
  });
});

function createFakeEditor(
  commands = new Map<string, Function>(),
  buttons = new Map<string, unknown>(),
  events = new Map<string, Function>(),
  addValidElements = vi.fn(),
) {
  return {
    addCommand(name: string, callback: Function) {
      commands.set(name, callback);
    },
    execCommand(name: string) {
      commands.get(name)?.();
    },
    insertContent: vi.fn(),
    on(name: string, callback: Function) {
      events.set(name, callback);
    },
    focus: vi.fn(),
    schema: {
      addValidElements,
    },
    getDoc: () => document,
    getBody: () => document.body,
    ui: {
      registry: {
        addButton: (name: string, config: unknown) => {
          buttons.set(name, config);
        },
        addMenuItem: vi.fn(),
      },
    },
    selection: {
      getNode: () => null,
    },
  };
}
