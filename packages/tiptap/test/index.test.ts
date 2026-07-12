// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import {
  FORMULAX_DEFAULT_ICON_SVG,
  FORMULAX_DEFAULT_ICON_NAME,
  createFormulaXActions,
  createFormulaXNode,
  createFormulaXPayload,
  resolveOptions,
  serializeFormulaXPayload,
  type TiptapNodeFactory,
} from '../src';

describe('tiptap adapter', () => {
  it('round-trips latex payloads', () => {
    const doc = createFormulaXPayload('\\sqrt{x}');
    expect(serializeFormulaXPayload(doc)).toBe('\\sqrt{x}');
  });

  it('can create a node with an injected tiptap runtime', () => {
    const create = vi.fn((config) => ({ config })) as unknown as TiptapNodeFactory['create'];
    const node = createFormulaXNode({ create });

    expect(create).toHaveBeenCalledOnce();
    expect((node as { config: { name: string } }).config.name).toBe('formulaX');
  });

  it('allows a custom node name', () => {
    const create = vi.fn((config) => ({ config })) as unknown as TiptapNodeFactory['create'];
    const node = createFormulaXNode({ create }, { name: 'inlineMath' });

    expect(create).toHaveBeenCalledOnce();
    expect((node as { config: { name: string } }).config.name).toBe('inlineMath');
  });

  it('warns when the configured node name is duplicated', () => {
    const create = vi.fn((config) => ({ config })) as unknown as TiptapNodeFactory['create'];
    const node = createFormulaXNode({ create }, { name: 'inlineMath' }) as {
      config: { onCreate: (this: unknown) => void };
    };
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    node.config.onCreate.call({
      name: 'inlineMath',
      editor: {
        extensionManager: {
          extensions: [{ name: 'inlineMath' }, { name: 'inlineMath' }],
        },
      },
    });

    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('resolves tiptap modal defaults', () => {
    expect(resolveOptions()).toMatchObject({
      name: 'formulaX',
      formulaClassName: 'formulax-math',
      formulaAttributeName: 'data-formulax-latex',
      modal: {
        title: 'FormulaX Editor',
      },
    });
  });

  it('localizes tiptap modal defaults from the editor locale', () => {
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

  it('resolves wrap-aware modal editor defaults', () => {
    expect(resolveOptions({
      editor: {
        runtime: 'standard',
      },
    })).toMatchObject({
      editor: {
        runtime: 'standard',
        wrap: 'none',
        maxWidth: 'host',
        lineGap: 14,
        continuationIndent: 30,
      },
    });
  });

  it('creates default toolbar actions with the shared icon metadata', () => {
    const editor = {
      commands: {
        openFormulaX: vi.fn(() => true),
      },
      can: () => ({
        openFormulaX: () => true,
      }),
    };

    const actions = createFormulaXActions(editor);

    expect(actions.openFormulaX).toMatchObject({
      icon: FORMULAX_DEFAULT_ICON_SVG,
      iconName: FORMULAX_DEFAULT_ICON_NAME,
      label: 'Insert formula',
    });
    expect(actions.openFormulaX.run()).toBe(true);
    expect(editor.commands.openFormulaX).toHaveBeenCalledOnce();
  });

  it('allows custom toolbar action icon overrides', () => {
    const actions = createFormulaXActions({
      commands: {},
    }, {
      formulaIconName: 'custom-formula',
      formulaIcon: ' <svg><path /></svg> ',
      label: 'Formula',
      tooltip: 'Insert Formula',
    });

    expect(actions.insertFormula).toMatchObject({
      iconName: 'custom-formula',
      icon: '<svg><path /></svg>',
      label: 'Formula',
      tooltip: 'Insert Formula',
    });
  });

  it('disables toolbar actions when the open command is unavailable', () => {
    const actions = createFormulaXActions({
      commands: {},
    });

    expect(actions.openFormulaX.isEnabled()).toBe(false);
    expect(actions.openFormulaX.run()).toBe(false);
  });

  it('renders persisted image metadata as img markup', () => {
    const create = vi.fn((config) => ({ config })) as unknown as TiptapNodeFactory['create'];
    const node = createFormulaXNode({ create }) as {
      config: {
        addOptions: () => unknown;
        renderHTML: (
          input: {
            node: {
              attrs: {
                latex: string;
                output: 'svg' | 'image';
                imageUrl: string | null;
                imageWidth: number | null;
                imageHeight: number | null;
                imageStyle: string | null;
              };
            };
          },
        ) => unknown;
      };
    };

    const rendered = node.config.renderHTML.call(
      { options: node.config.addOptions() },
      {
        node: {
          attrs: {
            latex: '\\sqrt{x}',
            output: 'image',
            imageUrl: 'https://h.uguu.se/test.png',
            imageWidth: 24,
            imageHeight: 40,
            imageStyle: 'width:0.75em; height:1.25em',
          },
        },
      },
    ) as unknown[];

    expect(rendered[0]).toBe('span');
    expect(rendered[2]).toEqual([
      'img',
      expect.objectContaining({
        src: 'https://h.uguu.se/test.png',
        'data-formulax-image': 'true',
        style: 'width:0.75em; height:1.25em',
      }),
    ]);
  });

  it('renders latex output as an empty persisted wrapper', () => {
    const create = vi.fn((config) => ({ config })) as unknown as TiptapNodeFactory['create'];
    const node = createFormulaXNode({ create }) as {
      config: {
        addOptions: () => unknown;
        renderHTML: (
          input: {
            node: {
              attrs: {
                latex: string;
                output: 'latex' | 'svg' | 'image';
                imageUrl: string | null;
                imageWidth: number | null;
                imageHeight: number | null;
                imageStyle: string | null;
              };
            };
          },
        ) => unknown;
      };
    };

    const rendered = node.config.renderHTML.call(
      { options: node.config.addOptions() },
      {
        node: {
          attrs: {
            latex: '\\sqrt{x}',
            output: 'latex',
            imageUrl: null,
            imageWidth: null,
            imageHeight: null,
            imageStyle: null,
          },
        },
      },
    ) as HTMLElement | null;

    expect(rendered?.getAttribute('data-formulax-output')).toBe('latex');
    expect(rendered?.innerHTML).toBe('');
  });

  it('renders latex output as svg in the editable node view', async () => {
    const create = vi.fn((config) => ({ config })) as unknown as TiptapNodeFactory['create'];
    const renderer = {
      renderLatex: vi.fn(async () => ({
        engine: 'test',
        output: 'svg',
        latex: '\\sqrt{x}',
        html: '<svg data-rendered-formula="true"></svg>',
      })),
    };
    const node = createFormulaXNode({ create }, {
      output: 'latex',
      renderer: renderer as any,
    }) as {
      config: {
        name: string;
        addOptions: () => unknown;
        addNodeView: (this: unknown) => (input: {
          editor: {
            commands: {
              openFormulaX: () => boolean;
              setNodeSelection: (position: number) => boolean;
            };
          };
          getPos: () => number;
          node: {
            attrs: {
              latex: string;
              output: 'latex' | 'svg' | 'image';
              imageUrl: string | null;
              imageWidth: number | null;
              imageHeight: number | null;
              imageStyle: string | null;
            };
          };
        }) => { dom: HTMLElement };
      };
    };

    const renderNodeView = node.config.addNodeView.call({
      name: node.config.name,
      options: node.config.addOptions(),
    });
    const view = renderNodeView({
      editor: {
        commands: {
          openFormulaX: vi.fn(() => true),
          setNodeSelection: vi.fn(() => true),
        },
      },
      getPos: () => 1,
      node: {
        attrs: {
          latex: '\\sqrt{x}',
          output: 'latex',
          imageUrl: null,
          imageWidth: null,
          imageHeight: null,
          imageStyle: null,
        },
      },
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(renderer.renderLatex).toHaveBeenCalledWith('\\sqrt{x}', expect.objectContaining({
      className: 'formulax-math',
    }));
    expect(view.dom.getAttribute('data-formulax-output')).toBe('latex');
    expect(view.dom.innerHTML).toContain('data-rendered-formula="true"');
    expect(view.dom.innerHTML).not.toContain('formulax-math__source');
  });

  it('parses persisted image metadata from wrapper markup', () => {
    const create = vi.fn((config) => ({ config })) as unknown as TiptapNodeFactory['create'];
    const node = createFormulaXNode({ create }) as {
      config: {
        addOptions: () => unknown;
        parseHTML: () => Array<{
          getAttrs: (element: HTMLElement) => unknown;
        }>;
      };
    };
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <span
        class="formulax-math"
        data-formulax="true"
        data-formulax-latex="\\sqrt{x}"
        data-formulax-output="image"
        data-formulax-image-url="http://localhost:3109/f/48231.png"
        data-formulax-image-width="128"
        data-formulax-image-height="48"
        data-formulax-image-style="width:2.5em; height:0.94em"
      >
        <img
          data-formulax-image="true"
          src="http://localhost:3109/f/48231.png"
          width="128"
          height="48"
          style="width:2.5em; height:0.94em"
        />
      </span>
    `;

    const parsed = node.config.parseHTML.call(
      { options: node.config.addOptions() },
    )[0]?.getAttrs(wrapper.firstElementChild as HTMLElement) as Record<string, unknown>;

    expect(parsed).toMatchObject({
      latex: '\\sqrt{x}',
      output: 'image',
      imageUrl: 'http://localhost:3109/f/48231.png',
      imageWidth: 128,
      imageHeight: 48,
      imageStyle: 'width:2.5em; height:0.94em',
    });
  });

  it('parses latex output wrappers without rendered children', () => {
    const create = vi.fn((config) => ({ config })) as unknown as TiptapNodeFactory['create'];
    const node = createFormulaXNode({ create }) as {
      config: {
        addOptions: () => unknown;
        parseHTML: () => Array<{
          getAttrs: (element: HTMLElement) => unknown;
        }>;
      };
    };
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <span
        class="formulax-math"
        data-formulax="true"
        data-formulax-latex="\\sqrt{x}"
        data-formulax-output="latex"
      ></span>
    `;

    const parsed = node.config.parseHTML.call(
      { options: node.config.addOptions() },
    )[0]?.getAttrs(wrapper.firstElementChild as HTMLElement) as Record<string, unknown>;

    expect(parsed).toMatchObject({
      latex: '\\sqrt{x}',
      output: 'latex',
      imageUrl: null,
    });
  });
});
