import { describe, expect, it } from 'vitest';
import { parseLatex, serializeLatex } from '../src';

describe('kity-adapter parser', () => {
  it('should parse latex string', () => {
    const result = parseLatex('\\alpha + \\beta');
    expect(result).toHaveProperty('type', 'doc');
  });

  it('should serialize latex', () => {
    const ast = parseLatex('\\alpha + \\beta');
    const result = serializeLatex(ast);
    expect(result).toContain('\\alpha');
  });
});
