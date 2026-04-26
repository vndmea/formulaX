import { describe, expect, it } from 'vitest';
import {
  SYMBOL_CATEGORIES,
  VISIBLE_SYMBOL_COUNT,
  type SymbolItem,
  type SymbolCategory,
} from '../src';

describe('symbols schema', () => {
  it('should have all required categories', () => {
    const categoryIds = SYMBOL_CATEGORIES.map((c: SymbolCategory) => c.id);
    expect(categoryIds).toContain('greek');
    expect(categoryIds).toContain('operators');
    expect(categoryIds).toContain('relations');
    expect(categoryIds).toContain('arrows');
    expect(categoryIds).toContain('misc');
  });

  it('should have valid symbol items', () => {
    SYMBOL_CATEGORIES.forEach((category: SymbolCategory) => {
      category.symbols.forEach((symbol: SymbolItem) => {
        expect(symbol.id).toBeDefined();
        expect(symbol.label).toBeDefined();
        expect(symbol.latex).toBeDefined();
        expect(symbol.category).toBe(category.id);
      });
    });
  });

  it('should have visible symbol count cap', () => {
    expect(VISIBLE_SYMBOL_COUNT).toBeGreaterThan(0);
    expect(VISIBLE_SYMBOL_COUNT).toBeLessThan(10);
  });

  it('greek category should have alpha symbol', () => {
    const greek = SYMBOL_CATEGORIES.find((c: SymbolCategory) => c.id === 'greek');
    expect(greek).toBeDefined();
    const alpha = greek!.symbols.find((s) => s.id === 'alpha');
    expect(alpha).toBeDefined();
    expect(alpha!.latex).toBe('\\alpha');
  });
});
