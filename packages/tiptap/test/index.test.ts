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

  it('resolves tiptap modal defaults', () => {
    expect(resolveOptions()).toMatchObject({
      formulaClassName: 'formulax-math',
      formulaAttributeName: 'data-formulax-latex',
      modal: {
        title: 'FormulaX Editor',
      },
    });
  });
});
