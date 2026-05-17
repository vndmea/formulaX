import { describe, expect, it, vi } from 'vitest';
import {
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
});
