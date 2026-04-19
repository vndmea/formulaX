import { createEmptyState, text } from '@formulax/core';
import { describe, expect, it } from 'vitest';
import { createSymbolCommand, createToolbarActions, renderModal, renderToolbar } from '../src';

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
    expect(renderToolbar()).toContain('fx-ribbon');
    expect(renderToolbar()).toContain('Greek');
    expect(renderModal('Title', 'Content')).toContain('role="dialog"');
  });

  it('renders localized toolbar labels', () => {
    expect(createToolbarActions('zh').map((item) => item.label)).toContain('分数');
    expect(renderToolbar('zh')).toContain('公式');
    expect(renderToolbar('zh')).toContain('希腊字母');
  });

  it('creates symbol commands that insert resolved symbols', () => {
    const next = createSymbolCommand('\\alpha')(createEmptyState());
    expect(next.doc.body).toEqual([text('\u03b1')]);
  });
});
