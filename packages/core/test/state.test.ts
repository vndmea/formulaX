import { describe, expect, it } from 'vitest';
import {
  applyCommand,
  backspace,
  containerKeyForBranch,
  createCursor,
  createEmptyState,
  createSelection,
  createStateFromDoc,
  doc,
  fenced,
  frac,
  getNodeAtPath,
  group,
  insertAtPath,
  insertFenced,
  insertSqrt,
  insertSubscript,
  insertSuperscript,
  insertText,
  isCollapsed,
  removeAtPath,
  resolveParent,
  selectionToCursor,
  sqrt,
  supsub,
  text,
  FormulaTransaction,
} from '../src';

describe('state and traversal helpers', () => {
  it('creates and mutates state through commands', () => {
    const empty = createEmptyState();

    const withText = applyCommand(empty, insertText('a'));
    expect(withText.doc).toEqual(doc([text('a')]));
    expect(withText.selection).toEqual({ anchor: [0], focus: [1] });

    const withSup = applyCommand(createStateFromDoc(doc([])), insertSuperscript());
    expect(withSup.doc.body).toEqual([supsub([text('x')], [text('2')])]);

    const withSub = applyCommand(createStateFromDoc(doc([])), insertSubscript());
    expect(withSub.doc.body).toEqual([supsub([text('x')], undefined, [text('i')])]);

    const withSqrt = applyCommand(createStateFromDoc(doc([])), insertSqrt());
    expect(withSqrt.doc.body).toEqual([sqrt([])]);

    const withFence = applyCommand(createStateFromDoc(doc([])), insertFenced('[', ']'));
    expect(withFence.doc.body).toEqual([fenced('[', ']', [])]);
  });

  it('supports transaction focus movement and backspace at boundaries', () => {
    const state = createStateFromDoc(doc([text('a'), text('b')]));
    const next = new FormulaTransaction(state).moveFocus([1]).deleteBackward().apply();

    expect(next.doc).toEqual(doc([text('b')]));
    expect(next.selection).toEqual({ anchor: [0], focus: [0] });

    const unchanged = backspace()(createEmptyState());
    expect(unchanged.doc).toEqual(doc([]));
    expect(unchanged.selection).toEqual({ anchor: [0], focus: [0] });
  });

  it('resolves parent containers and inserts nested content', () => {
    const root = doc([frac([text('a')], [text('b')]), supsub([text('x')])]);

    const nestedParent = resolveParent(root, [0, 1, 1]);
    expect(nestedParent.container).toEqual([text('b')]);
    expect(nestedParent.index).toBe(1);

    const missingTopLevel = resolveParent(root, [10]);
    expect(missingTopLevel.container).toBe(root.body);
    expect(missingTopLevel.index).toBe(10);

    const inserted = insertAtPath(root, [1, 1, 0], text('2'));
    expect(inserted.body[1]).toEqual(supsub([text('x')], [text('2')]));
    expect(root.body[1]).toEqual(supsub([text('x')]));
  });

  it('removes nodes and retrieves nested nodes by path', () => {
    const root = doc([
      group([text('g')]),
      frac([text('a')], [text('b')]),
      fenced('(', ')', [text('c')]),
    ]);

    expect(getNodeAtPath(root, [])).toEqual(root);
    expect(getNodeAtPath(root, [0])).toEqual(group([text('g')]));
    expect(getNodeAtPath(root, [1, 0, 0])).toEqual(text('a'));
    expect(getNodeAtPath(root, [2, 0, 0])).toEqual(text('c'));
    expect(getNodeAtPath(root, [9])).toBeNull();
    expect(getNodeAtPath(root, [1, 0, 9])).toBeNull();

    const removed = removeAtPath(root, [2]);
    expect(removed.body).toEqual([group([text('g')]), fenced('(', ')', [text('c')])]);
    expect(removeAtPath(root, [0])).toEqual(root);
  });

  it('maps branches to container keys for all node types', () => {
    expect(containerKeyForBranch(doc([]), 0)).toBe('body');
    expect(containerKeyForBranch(group([]), 0)).toBe('body');
    expect(containerKeyForBranch(frac([], []), 0)).toBe('numerator');
    expect(containerKeyForBranch(frac([], []), 1)).toBe('denominator');
    expect(containerKeyForBranch(supsub([]), 0)).toBe('base');
    expect(containerKeyForBranch(supsub([]), 1)).toBe('sup');
    expect(containerKeyForBranch(supsub([]), 2)).toBe('sub');
    expect(containerKeyForBranch(sqrt([]), 0)).toBe('value');
    expect(containerKeyForBranch(fenced('(', ')', []), 0)).toBe('body');
    expect(containerKeyForBranch(text('x'), 0)).toBe('body');
  });

  it('creates collapsed and expanded selections and cursors', () => {
    const selection = createSelection([1, 0]);
    expect(selection).toEqual({ anchor: [1, 0], focus: [1, 0] });
    expect(isCollapsed(selection)).toBe(true);

    const expanded = { anchor: [1, 0], focus: [1, 1] };
    expect(isCollapsed(expanded)).toBe(false);

    expect(createCursor([2, 1])).toEqual({ path: [2, 1] });
    expect(selectionToCursor(expanded)).toEqual({ path: [1, 1] });
  });
});
