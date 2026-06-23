import { describe, expect, it, vi } from 'vitest';
import { createFormulaDisplayAttributes, createFormulaImageHtml } from '@formulaxjs/renderer-image';
import {
  FORMULAX_DEFAULT_ICON_NAME,
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
    const icons = new Map<string, string>();
    const contexts = new Map<string, (value: string) => boolean>();

    const tinymce = {
      majorVersion: '7',
      PluginManager: {
        add(_name: string, factory: unknown) {
          const editor = createFakeEditor(new Map(), buttons, new Map(), vi.fn(), icons, contexts);
          (factory as any)(editor);
        },
      },
    };

    registerFormulaXTinyMcePlugin(tinymce as any);

    expect(buttons.has('formulax')).toBe(true);
    expect(icons.has(FORMULAX_DEFAULT_ICON_NAME)).toBe(true);
    expect(contexts.has('formulax')).toBe(true);
    expect(buttons.get('formulax')).toMatchObject({
      icon: FORMULAX_DEFAULT_ICON_NAME,
      context: 'formulax:enabled',
    });
    expect(buttons.get('formulax')).not.toHaveProperty('text');
  });

  it('registers a custom toolbar icon override', () => {
    const buttons = new Map<string, unknown>();
    const icons = new Map<string, string>();

    const tinymce = {
      majorVersion: '7',
      PluginManager: {
        add(_name: string, factory: unknown) {
          const editor = createFakeEditor(new Map(), buttons, new Map(), vi.fn(), icons);
          (factory as any)(editor);
        },
      },
    };

    registerFormulaXTinyMcePlugin(tinymce as any, {
      formulaIconName: 'custom-formula',
      formulaIcon: ' <svg><path /></svg> ',
    });

    expect(icons.get('custom-formula')).toBe('<svg><path /></svg>');
    expect(buttons.get('formulax')).toMatchObject({
      icon: 'custom-formula',
    });
  });

  it('disables FormulaX UI in readonly mode but keeps it enabled for selected formula nodes', () => {
    const buttons = new Map<string, unknown>();
    const contexts = new Map<string, (value: string) => boolean>();
    const formulaNode = document.createElement('span');
    formulaNode.setAttribute('data-formulax', 'true');
    formulaNode.setAttribute('data-formulax-latex', '\\sqrt{x}');

    const tinymce = {
      majorVersion: '7',
      PluginManager: {
        add(_name: string, factory: unknown) {
          const editor = createFakeEditor(
            new Map(),
            buttons,
            new Map(),
            vi.fn(),
            new Map(),
            contexts,
            {
              isEditable: () => false,
              getNode: () => formulaNode,
            },
            'readonly',
          );
          (factory as any)(editor);
        },
      },
    };

    registerFormulaXTinyMcePlugin(tinymce as any);

    expect(contexts.get('formulax')?.('enabled')).toBe(false);

    const editableTinymce = {
      majorVersion: '7',
      PluginManager: {
        add(_name: string, factory: unknown) {
          const editor = createFakeEditor(
            new Map(),
            buttons,
            new Map(),
            vi.fn(),
            new Map(),
            contexts,
            {
              isEditable: () => false,
              getNode: () => formulaNode,
            },
            'design',
          );
          (factory as any)(editor);
        },
      },
    };

    registerFormulaXTinyMcePlugin(editableTinymce as any, {
      pluginName: 'formulax-editable',
      buttonName: 'formulax-editable',
      menuItemName: 'formulax-editable',
    });

    expect(contexts.get('formulax')?.('enabled')).toBe(true);
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
    expect(addValidElements.mock.calls[0]?.[0]).toContain('span[');
    expect(addValidElements.mock.calls[0]?.[0]).toContain('img[');
    expect(addValidElements.mock.calls[0]?.[0]).toContain('data-formulax-output');
    expect(addValidElements.mock.calls[0]?.[0]).toContain('data-mce-contenteditable');
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

  it('resolves runtime v2 wrap defaults for modal editors', () => {
    expect(resolveOptions({
      editor: {
        runtime: 'v2',
      },
    })).toMatchObject({
      editor: {
        runtime: 'v2',
        wrap: 'none',
        maxWidth: 'host',
        lineGap: 14,
        continuationIndent: 30,
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

  it('creates latex-only TinyMCE markup without rendered children', () => {
    const html = createTinyMceFormulaMarkup('\\sqrt{x}', {
      output: 'latex',
    });

    expect(html).toContain('data-formulax-output="latex"');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('formulax-math__render');
  });

  it('keeps explicit latex preview markup for TinyMCE editing', () => {
    const html = createTinyMceFormulaMarkup('\\sqrt{x}', {
      output: 'latex',
      renderHtml: '<span class="formulax-math__source">\\sqrt{x}</span>',
    });

    expect(html).toContain('data-formulax-output="latex"');
    expect(html).toContain('formulax-math__source');
  });

  it('serializes GetContent results to latex-only wrappers in latex mode', () => {
    const events = new Map<string, Function>();

    const tinymce = {
      majorVersion: '7',
      PluginManager: {
        add(_name: string, factory: unknown) {
          const editor = createFakeEditor(new Map(), new Map(), events);
          (factory as any)(editor);
        },
      },
    };

    registerFormulaXTinyMcePlugin(tinymce as any, {
      output: 'latex',
    });

    const payload = {
      content: '<span data-formulax="true" data-formulax-latex="\\\\sqrt{x}" data-formulax-output="image"><img data-formulax-image="true" src="https://example.com/a.png" /></span>',
    };

    events.get('GetContent')?.(payload);

    expect(payload.content).toContain('data-formulax-output="latex"');
    expect(payload.content).not.toContain('<img');
  });

  it('keeps latex-only wrappers alive before TinyMCE parses content', () => {
    const events = new Map<string, Function>();

    const tinymce = {
      majorVersion: '7',
      PluginManager: {
        add(_name: string, factory: unknown) {
          const editor = createFakeEditor(new Map(), new Map(), events);
          (factory as any)(editor);
        },
      },
    };

    registerFormulaXTinyMcePlugin(tinymce as any, {
      output: 'latex',
    });

    const payload = {
      content: `
        <p>
          <span
            class="formulax-math"
            data-formulax="true"
            data-formulax-latex="\\sqrt{x}"
            data-formulax-output="latex"
          ></span>
        </p>
      `,
    };

    events.get('BeforeSetContent')?.(payload);

    expect(payload.content).toContain('formulax-math__source');
    expect(payload.content).toContain('\\sqrt{x}');
  });

  it('renders latex persistence wrappers as svg in TinyMCE editing content', async () => {
    const events = new Map<string, Function>();
    document.body.innerHTML = `
      <span
        class="formulax-math"
        data-formulax="true"
        data-formulax-latex="\\sqrt{x}"
        data-formulax-output="latex"
      ></span>
    `;
    const renderer = {
      renderLatex: vi.fn().mockResolvedValue({
        engine: 'test',
        output: 'svg',
        latex: '\\sqrt{x}',
        html: '<svg data-rendered-formula="true"></svg>',
      }),
    };

    const tinymce = {
      majorVersion: '7',
      PluginManager: {
        add(_name: string, factory: unknown) {
          const editor = createFakeEditor(new Map(), new Map(), events);
          (factory as any)(editor);
        },
      },
    };

    registerFormulaXTinyMcePlugin(tinymce as any, {
      output: 'latex',
      renderer,
    });

    events.get('SetContent')?.({});
    await Promise.resolve();
    await Promise.resolve();

    expect(renderer.renderLatex).toHaveBeenCalledWith('\\sqrt{x}', expect.objectContaining({
      className: 'formulax-math',
    }));
    expect(document.body.innerHTML).toContain('data-rendered-formula="true"');
    expect(document.body.innerHTML).toContain('data-formulax-output="latex"');
  });

  it('hydrates latex-only wrappers into source preview on init', () => {
    const events = new Map<string, Function>();
    document.body.innerHTML = `
      <span
        class="formulax-math"
        data-formulax="true"
        data-formulax-latex="\\sqrt{x}"
        data-formulax-output="latex"
      ></span>
    `;

    const tinymce = {
      majorVersion: '7',
      PluginManager: {
        add(_name: string, factory: unknown) {
          const editor = createFakeEditor(new Map(), new Map(), events);
          (factory as any)(editor);
        },
      },
    };

    registerFormulaXTinyMcePlugin(tinymce as any, {
      output: 'latex',
    });

    events.get('init')?.({});

    expect(document.body.innerHTML).toContain('formulax-math__source');
    expect(document.body.innerHTML).toContain('\\sqrt{x}');
  });
});

function createFakeEditor(
  commands = new Map<string, Function>(),
  buttons = new Map<string, unknown>(),
  events = new Map<string, Function>(),
  addValidElements = vi.fn(),
  icons = new Map<string, string>(),
  contexts = new Map<string, (value: string) => boolean>(),
  selectionOverrides: {
    isEditable?: () => boolean;
    getNode?: () => HTMLElement | null;
  } = {},
  mode = 'design',
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
        addContext: (name: string, predicate: (value: string) => boolean) => {
          contexts.set(name, predicate);
        },
        addIcon: (name: string, svg: string) => {
          icons.set(name, svg);
        },
        addButton: (name: string, config: unknown) => {
          buttons.set(name, config);
        },
        addMenuItem: vi.fn(),
      },
    },
    selection: {
      isEditable: selectionOverrides.isEditable ?? (() => true),
      getNode: selectionOverrides.getNode ?? (() => null),
    },
    mode: {
      get: () => mode,
    },
  };
}
