import { describe, expect, it } from 'vitest';
import { createFormulaXPayload, serializeFormulaXPayload } from '../src';

describe('tiptap adapter', () => {
  it('round-trips latex payloads', () => {
    const doc = createFormulaXPayload('\\sqrt{x}');
    expect(serializeFormulaXPayload(doc)).toBe('\\sqrt{x}');
  });
});
