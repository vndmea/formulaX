// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_MODEL_NAME,
  FORMULAX_DEFAULT_ICON_SVG,
  FormulaX,
  resolveOptions,
} from '../src';

describe('ckeditor5 adapter', () => {
  it('resolves the default model name', () => {
    expect(resolveOptions()).toMatchObject({
      name: DEFAULT_MODEL_NAME,
      buttonName: 'formulaX',
    });
  });

  it('allows a custom model name', () => {
    expect(resolveOptions({ name: 'inlineMath' }).name).toBe('inlineMath');
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

  it('logs and aborts initialization when the model name already exists', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const register = vi.fn();
    const editor = {
      config: {
        get: vi.fn(() => ({ name: 'inlineMath' })),
      },
      model: {
        schema: {
          isRegistered: vi.fn(() => true),
          register,
        },
      },
    };
    const plugin = new FormulaX(editor as never);

    plugin.init();

    expect(error).toHaveBeenCalledOnce();
    expect(register).not.toHaveBeenCalled();
    error.mockRestore();
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

  it('resolves default and custom toolbar icons', () => {
    expect(resolveOptions().formulaIcon).toBe(FORMULAX_DEFAULT_ICON_SVG);
    expect(resolveOptions({
      formulaIcon: ' <svg><path /></svg> ',
    }).formulaIcon).toBe('<svg><path /></svg>');
  });

  it('registers image attrs in the schema', () => {
    const { editor } = createPluginTestContext();
    const plugin = new FormulaX(editor as never);

    plugin.init();

    expect(editor.model.schema.register).toHaveBeenCalledWith('formulaX', expect.objectContaining({
      allowAttributes: expect.arrayContaining([
        'latex',
        'output',
        'imageUrl',
        'imageWidth',
        'imageHeight',
        'imageStyle',
      ]),
    }));
  });

  it('passes the configured svg icon into the toolbar button view', () => {
    const { editor } = createPluginTestContext({
      formulaIcon: '<svg><circle cx="12" cy="12" r="8" /></svg>',
    });
    const plugin = new FormulaX(editor as never);

    plugin.init();

    const factory = editor.ui.componentFactory.add.mock.calls[0]?.[1];
    const button = factory?.({}) as {
      icon?: string;
      label?: string;
      withText?: boolean;
    } | undefined;

    expect(button).toBeDefined();
    expect(button?.icon).toBe('<svg><circle cx="12" cy="12" r="8" /></svg>');
    expect(button?.label).toBe('FormulaX');
    expect(button?.withText).toBe(false);
  });

  it('upcasts persisted image markup into image attrs', () => {
    const { editor, conversions } = createPluginTestContext();
    const plugin = new FormulaX(editor as never);

    plugin.init();

    const upcast = conversions.upcast[0];
    const writer = {
      createElement: vi.fn((name: string, attrs: Record<string, unknown>) => ({ name, attrs })),
    };
    const imageChild = createViewImageElement({
      src: 'http://localhost:3109/f/48231.png',
      width: '128',
      height: '48',
      style: 'width:2.5em; height:0.94em',
    });
    const model = upcast?.model?.(createViewFormulaElement({
      'data-formulax-latex': '\\sqrt{x}',
      'data-formulax-output': 'image',
      'data-formulax-image-url': 'http://localhost:3109/f/48231.png',
      'data-formulax-image-width': '128',
      'data-formulax-image-height': '48',
      'data-formulax-image-style': 'width:2.5em; height:0.94em',
    }, [imageChild]), { writer });

    expect(model).toEqual({
      name: 'formulaX',
      attrs: {
        latex: '\\sqrt{x}',
        output: 'image',
        imageUrl: 'http://localhost:3109/f/48231.png',
        imageWidth: 128,
        imageHeight: 48,
        imageStyle: 'width:2.5em; height:0.94em',
      },
    });
  });

  it('downcasts image attrs back to wrapper plus img markup', () => {
    const { editor, conversions } = createPluginTestContext();
    const plugin = new FormulaX(editor as never);

    plugin.init();

    const dataDowncast = conversions.dataDowncast[0];
    const writer = createViewWriter();
    const view = dataDowncast?.view?.(
      createModelElement({
        latex: '\\sqrt{x}',
        output: 'image',
        imageUrl: 'http://localhost:3109/f/48231.png',
        imageWidth: 128,
        imageHeight: 48,
        imageStyle: 'width:2.5em; height:0.94em',
      }),
      { writer },
    );

    expect(view).toMatchObject({
      name: 'span',
      attrs: expect.objectContaining({
        'data-formulax': 'true',
        'data-formulax-output': 'image',
        'data-formulax-image-url': 'http://localhost:3109/f/48231.png',
        'data-formulax-image-width': '128',
        'data-formulax-image-height': '48',
        'data-formulax-image-style': 'width:2.5em; height:0.94em',
      }),
      children: [
        {
          name: 'img',
          attrs: expect.objectContaining({
            src: 'http://localhost:3109/f/48231.png',
            'data-formulax-image': 'true',
            width: '128',
            height: '48',
            style: 'width:2.5em; height:0.94em',
          }),
        },
      ],
    });
  });
});

function createPluginTestContext(configValue: Record<string, unknown> = {}) {
  const conversions: Record<string, Array<Record<string, any>>> = {
    upcast: [],
    dataDowncast: [],
    editingDowncast: [],
  };
  const editor = {
    config: {
      get: vi.fn(() => configValue),
    },
    model: {
      schema: {
        isRegistered: vi.fn(() => false),
        register: vi.fn(),
      },
      document: {
        selection: {
          getSelectedElement: vi.fn(() => null),
        },
      },
    },
    conversion: {
      for: vi.fn((pipeline: string) => ({
        elementToElement: (definition: Record<string, any>) => {
          conversions[pipeline]?.push(definition);
        },
      })),
    },
    editing: {
      mapper: {
        on: vi.fn(),
      },
      view: {
        focus: vi.fn(),
      },
    },
    commands: {
      add: vi.fn(),
    },
    ui: {
      componentFactory: {
        add: vi.fn(),
      },
      getEditableElement: vi.fn(() => null),
    },
  };

  return {
    editor,
    conversions,
  };
}

function createViewFormulaElement(
  attributes: Record<string, string>,
  children: Array<Record<string, unknown>> = [],
) {
  return {
    getAttribute(name: string) {
      return attributes[name] ?? null;
    },
    getChildren() {
      return children;
    },
  };
}

function createViewImageElement(attributes: Record<string, string>) {
  return {
    is(type: string, name: string) {
      return type === 'element' && name === 'img';
    },
    getAttribute(name: string) {
      return attributes[name] ?? null;
    },
  };
}

function createModelElement(attributes: Record<string, unknown>) {
  return {
    getAttribute(name: string) {
      return attributes[name];
    },
  };
}

function createViewWriter() {
  return {
    createContainerElement(name: string, attrs: Record<string, string>) {
      return { name, attrs, children: [] as Array<unknown> };
    },
    createEmptyElement(name: string, attrs: Record<string, string>) {
      return { name, attrs };
    },
    createText(data: string) {
      return { data };
    },
    createPositionAt(parent: { children: Array<unknown> }, index: number) {
      return { parent, index };
    },
    insert(position: { parent: { children: Array<unknown> }; index: number }, node: unknown) {
      position.parent.children.splice(position.index, 0, node);
      return node;
    },
  };
}
