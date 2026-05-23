import { describe, expect, it } from 'vitest';
import {
  FORMULAX_DEFAULT_ICON_SVG,
  FORMULAX_DEFAULT_ICON_NAME,
  normalizeFormulaXIconSvg,
  resolveFormulaXIcon,
  resolveFormulaXIconName,
} from '../src';

describe('FormulaX icon helpers', () => {
  it('returns the default icon svg when no override is provided', () => {
    expect(resolveFormulaXIcon()).toBe(FORMULAX_DEFAULT_ICON_SVG);
  });

  it('returns the custom icon svg when provided', () => {
    expect(resolveFormulaXIcon({
      formulaIcon: '  <svg><path /></svg>  ',
    })).toBe('<svg><path /></svg>');
  });

  it('returns the default icon name when no override is provided', () => {
    expect(resolveFormulaXIconName()).toBe(FORMULAX_DEFAULT_ICON_NAME);
  });

  it('returns the custom icon name when provided', () => {
    expect(resolveFormulaXIconName({
      formulaIconName: '  custom-formula-icon  ',
    })).toBe('custom-formula-icon');
  });

  it('normalizes svg icon markup by trimming whitespace', () => {
    expect(normalizeFormulaXIconSvg('  <svg />  ')).toBe('<svg />');
  });
});
