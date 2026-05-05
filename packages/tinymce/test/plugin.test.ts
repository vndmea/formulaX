import { describe, expect, it, vi } from 'vitest';
import { registerFormulaXTinyMcePlugin } from '../src';

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
});

function createFakeEditor(
  commands = new Map<string, Function>(),
  buttons = new Map<string, unknown>(),
) {
  return {
    addCommand(name: string, callback: Function) {
      commands.set(name, callback);
    },
    execCommand(name: string) {
      commands.get(name)?.();
    },
    insertContent: vi.fn(),
    on: vi.fn(),
    focus: vi.fn(),
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