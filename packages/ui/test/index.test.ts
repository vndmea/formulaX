import { createEmptyState, text } from '@formulax/core';
import { describe, expect, it } from 'vitest';
import { createSymbolCommand, createToolbarActions, renderFormulaPanel, renderModal, renderToolbar } from '../src';

describe('ui package', () => {
  it('creates a fixed toolbar command set', () => {
    expect(createToolbarActions().map((item) => item.id)).toEqual([
      'fraction',
      'sup',
      'sub',
      'sqrt',
      'fence',
    ]);
  });

  it('renders helper UI fragments', () => {
    expect(renderToolbar()).toContain('data-command="fraction"');
    expect(renderFormulaPanel()).toContain('Symbol Panel');
    expect(renderFormulaPanel()).toContain('Greek Letters');
    expect(renderFormulaPanel()).toContain('fx-symbol-btn');
    expect(renderModal('Title', 'Content')).toContain('role="dialog"');
  });

  it('creates symbol commands that insert resolved symbols', () => {
    const next = createSymbolCommand('\\alpha')(createEmptyState());
    expect(next.doc.body).toEqual([text('\u03b1')]);
  });
});
