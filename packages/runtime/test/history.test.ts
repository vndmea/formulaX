import { describe, expect, it } from 'vitest';
import { createEmptyFormulaDoc } from '../src/core/commands';
import { FormulaHistory } from '../src/editor/history';

describe('runtime history', () => {
  it('undoes and redoes snapshots', () => {
    const history = new FormulaHistory();
    const before = createEmptyFormulaDoc('x');
    const after = createEmptyFormulaDoc('xy');

    history.push(before, { rowId: before.root.id, offset: 1 }, 'insert');

    const undone = history.undo(after, { rowId: after.root.id, offset: 2 });
    expect(undone?.doc.root.children).toHaveLength(1);
    expect(history.canRedo()).toBe(true);

    const redone = history.redo(before, { rowId: before.root.id, offset: 1 });
    expect(redone?.doc.root.children).toHaveLength(2);
  });

  it('clears redo after a new push', () => {
    const history = new FormulaHistory();
    const base = createEmptyFormulaDoc('x');
    const next = createEmptyFormulaDoc('xy');
    const future = createEmptyFormulaDoc('xyz');

    history.push(base, { rowId: base.root.id, offset: 1 }, 'insert');
    history.undo(next, { rowId: next.root.id, offset: 2 });
    expect(history.canRedo()).toBe(true);

    history.push(next, { rowId: next.root.id, offset: 2 }, 'insert');
    expect(history.canRedo()).toBe(false);

    history.push(future, { rowId: future.root.id, offset: 3 }, 'insert', {
      mergeWithPrevious: true,
    });
    expect(history.canUndo()).toBe(true);
  });
});
