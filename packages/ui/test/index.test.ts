import { describe, expect, it } from 'vitest';
import { createToolbarActions, renderFormulaPanel, renderModal, renderToolbar } from '../src';

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
    expect(renderFormulaPanel()).toContain('基础结构');
    expect(renderModal('标题', '内容')).toContain('role="dialog"');
  });
});
