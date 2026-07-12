import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RUNTIME_FONT_FAMILY,
  createRuntimeToolbarPanels,
  runtimeAssetManifest,
} from '../src';
import {
  applyFormulaCommand,
  createEmptyFormulaDoc,
} from '../src/core/commands';
import { createSelection } from '../src/core/selection';
import { layoutFormula } from '../src/layout/layout';
import { parseLatexToFormulaDoc } from '../src/latex/parse';
import { serializeFormulaDocToLatex } from '../src/latex/serialize';

const testMetrics = {
  measureText(text: string, style: { fontSize: number }) {
    return {
      width: Math.max(4, text.length * style.fontSize * 0.6),
      height: style.fontSize,
      ascent: style.fontSize * 0.8,
      descent: style.fontSize * 0.2,
    };
  },
};

const LEGACY_TOOLBAR_LATEX_SAMPLES = [
  '\\cos\\placeholder',
  '\\cos{2x}',
  '\\cot\\placeholder',
  '\\csc\\placeholder',
  '\\frac \\pi 2',
  '\\frac \\placeholder\\placeholder',
  '\\frac {\\Delta y}{\\Delta x}',
  '\\frac {-b\\pm\\sqrt{b^2-4ac}}{2a}',
  '\\frac {dy}{dx}',
  '\\iiint\\placeholder',
  '\\iiint^\\placeholder_\\placeholder\\placeholder',
  '\\iint\\placeholder',
  '\\iint^\\placeholder_\\placeholder\\placeholder',
  '\\int \\placeholder',
  '\\int^\\placeholder_\\placeholder\\placeholder',
  '\\left(\\placeholder\\right)',
  '\\left[\\placeholder\\right]',
  '\\left\\{\\placeholder\\right\\}',
  '\\left|\\placeholder\\right|',
  '\\placeholder^\\placeholder',
  '\\placeholder^\\placeholder_\\placeholder',
  '\\placeholder_\\placeholder',
  '\\sec\\placeholder',
  '\\sin\\placeholder',
  '\\sin\\theta',
  '\\sqrt [\\placeholder] \\placeholder',
  '\\sqrt [2] \\placeholder',
  '\\sqrt [3] \\placeholder',
  '\\sqrt \\placeholder',
  '\\sqrt {a^2+b^2}',
  '\\sum\\placeholder',
  '\\sum^\\placeholder_\\placeholder\\placeholder',
  '\\sum_\\placeholder\\placeholder',
  '\\tan\\placeholder',
  '\\tan\\theta=\\frac {\\sin\\theta}{\\cos\\theta}',
  '{\\left(x+a\\right)}^2=\\sum^n_{k=0}{\\left(^n_k\\right)x^ka^{n-k}}',
  '{\\placeholder/\\placeholder}',
  '{^\\placeholder_\\placeholder\\placeholder}',
  '{}^n_1Y',
  'a^2+b^2=c^2',
  'e^{-i\\omega t}',
  'x^2',
  'x=\\frac {-b\\pm\\sqrt {b^2-4ac}}{2a}',
] as const;

describe('runtime toolbar public surface', () => {
  it('creates localized toolbar panels with stable ids', () => {
    const englishPanels = createRuntimeToolbarPanels('en_US');
    const chinesePanels = createRuntimeToolbarPanels('zh-CN');

    expect(englishPanels.map((panel) => panel.id)).toEqual([
      'presets',
      'symbols',
      'fraction',
      'scripts',
      'radicals',
      'integrals',
      'large-ops',
      'brackets',
      'functions',
    ]);
    expect(chinesePanels.map((panel) => panel.id)).toEqual(englishPanels.map((panel) => panel.id));
    expect(englishPanels.find((panel) => panel.id === 'fraction')?.label).toBe('Fraction<br/>');
    expect(chinesePanels.find((panel) => panel.id === 'fraction')?.label).toBe('分数<br/>');
    expect(chinesePanels.find((panel) => panel.id === 'symbols')?.kind).toBe('area');
  });

  it('covers the legacy toolbar latex samples supported by runtime v2', () => {
    const latexValues = new Set(
      createRuntimeToolbarPanels()
        .flatMap((panel) => panel.groups)
        .flatMap((group) => group.items)
        .map((item) => item.latex),
    );

    for (const latex of LEGACY_TOOLBAR_LATEX_SAMPLES) {
      expect(latexValues.has(latex), latex).toBe(true);
    }
  });

  it('keeps every toolbar latex item parseable, serializable, layoutable, and insertable', () => {
    const toolbarItems = createRuntimeToolbarPanels()
      .flatMap((panel) => panel.groups)
      .flatMap((group) => group.items);

    expect(toolbarItems.length).toBeGreaterThan(LEGACY_TOOLBAR_LATEX_SAMPLES.length);

    for (const item of toolbarItems) {
      const parsed = parseLatexToFormulaDoc(item.latex);
      const serialized = serializeFormulaDocToLatex(parsed);
      const parsedLayout = layoutFormula(parsed, testMetrics);

      expect(serialized, item.latex).toEqual(expect.any(String));
      expect(parsedLayout.root.width, item.latex).toBeGreaterThan(0);
      expect(parsedLayout.nodeMap.size, item.latex).toBeGreaterThan(0);

      const baseDoc = createEmptyFormulaDoc();
      const inserted = applyFormulaCommand(baseDoc, createSelection(baseDoc.root.id, 0), {
        type: 'insertLatex',
        payload: { latex: item.latex },
      });
      const insertedLayout = layoutFormula(inserted.doc, testMetrics);

      expect(inserted.changed, item.latex).toBe(true);
      expect(inserted.selection, item.latex).not.toBeNull();
      expect(insertedLayout.root.width, item.latex).toBeGreaterThan(0);
      expect(serializeFormulaDocToLatex(inserted.doc), item.latex).toEqual(expect.any(String));
    }
  });

  it('exposes an explicit asset manifest for integrations', () => {
    expect(runtimeAssetManifest.requiresBundledAssets).toBe(false);
    expect(runtimeAssetManifest.defaultFontFamily).toBe(DEFAULT_RUNTIME_FONT_FAMILY);
    expect(runtimeAssetManifest.fonts).toEqual({});
    expect(runtimeAssetManifest.toolbar).toEqual({});
    expect(runtimeAssetManifest.styles).toEqual({});
  });
});
