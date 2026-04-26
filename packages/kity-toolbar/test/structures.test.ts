import { describe, expect, it } from 'vitest';
import {
  STRUCTURE_CATEGORIES,
  type StructureItem,
  type StructureCategory,
} from '../src';

describe('structures schema', () => {
  it('should have all required categories', () => {
    const categoryIds = STRUCTURE_CATEGORIES.map((c: StructureCategory) => c.id);
    expect(categoryIds).toContain('fractions');
    expect(categoryIds).toContain('subsup');
    expect(categoryIds).toContain('root');
    expect(categoryIds).toContain('integral');
    expect(categoryIds).toContain('sum');
  });

  it('should have valid structure items', () => {
    STRUCTURE_CATEGORIES.forEach((category: StructureCategory) => {
      category.structures.forEach((structure: StructureItem) => {
        expect(structure.id).toBeDefined();
        expect(structure.label).toBeDefined();
        expect(structure.latex).toBeDefined();
        expect(structure.category).toBe(category.id);
      });
    });
  });

  it('fractions category should have frac structure', () => {
    const fractions = STRUCTURE_CATEGORIES.find((c: StructureCategory) => c.id === 'fractions');
    expect(fractions).toBeDefined();
    const frac = fractions!.structures.find((s) => s.id === 'frac');
    expect(frac).toBeDefined();
    expect(frac!.latex).toBe('\\frac{}{}');
  });

  it('subsup category should have dropdown option', () => {
    const subsup = STRUCTURE_CATEGORIES.find((c: StructureCategory) => c.id === 'subsup');
    expect(subsup).toBeDefined();
    const subsupItem = subsup!.structures.find((s) => s.id === 'supsub');
    expect(subsupItem).toBeDefined();
    expect(subsupItem!.hasDropdown).toBe(true);
  });
});
