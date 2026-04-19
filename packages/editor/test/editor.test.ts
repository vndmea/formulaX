import { doc, fenced, frac, sqrt, supsub, text } from '@formulax/core';
import { describe, expect, it } from 'vitest';
import { FormulaEditor } from '../src';

describe('FormulaEditor', () => {
  it('renders initial text nodes', () => {
    const root = document.createElement('div');
    const editor = new FormulaEditor({
      root,
      initialState: {
        doc: doc([text('x')]),
        selection: { anchor: [1], focus: [1] },
      },
    });

    expect(root.textContent).toContain('x');
    expect(editor.getState().doc.body).toHaveLength(1);
  });

  it('handles keyboard insertion', () => {
    const root = document.createElement('div');
    const editor = new FormulaEditor({ root });

    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));

    expect(editor.getState().doc.body).toEqual([text('a')]);
  });

  it('supports command keyboard shortcuts and click-based selection', () => {
    const root = document.createElement('div');
    const changes: string[] = [];
    const editor = new FormulaEditor({
      root,
      onChange: (state) => {
        changes.push(JSON.stringify(state.selection.focus));
      },
    });

    root.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }));
    root.dispatchEvent(new KeyboardEvent('keydown', { key: '^', bubbles: true }));
    root.dispatchEvent(new KeyboardEvent('keydown', { key: '_', bubbles: true }));
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', ctrlKey: true, bubbles: true }));
    root.dispatchEvent(new KeyboardEvent('keydown', { key: '(', bubbles: true }));

    expect(editor.getState().doc.body).toEqual([
      frac([], []),
      supsub([text('x')], [text('2')]),
      supsub([text('x')], undefined, [text('i')]),
      sqrt([]),
      fenced('(', ')', []),
    ]);

    const slot = root.querySelector('[data-path="2"]');
    expect(slot).not.toBeNull();
    slot?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(editor.getState().selection).toEqual({ anchor: [2], focus: [2] });
    expect(changes.at(-1)).toBe('[2]');
  });

  it('ignores unsupported clicks, updates state explicitly, and backspaces content', () => {
    const root = document.createElement('div');
    const editor = new FormulaEditor({ root });

    editor.setState({
      doc: doc([text('x'), text('y')]),
      selection: { anchor: [2], focus: [2] },
    });
    expect(root.textContent).toContain('x');
    expect(root.textContent).toContain('y');

    root.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(editor.getState().selection).toEqual({ anchor: [2], focus: [2] });

    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    expect(editor.getState().doc.body).toEqual([text('x')]);
  });

  it('injects styles only once and ignores modified character input', () => {
    document.head.innerHTML = '';

    const firstRoot = document.createElement('div');
    const secondRoot = document.createElement('div');
    const firstEditor = new FormulaEditor({ root: firstRoot });
    const secondEditor = new FormulaEditor({ root: secondRoot });

    expect(document.head.querySelectorAll('#fx-editor-styles')).toHaveLength(1);
    expect(firstRoot.classList.contains('fx-editor')).toBe(true);
    expect(secondRoot.tabIndex).toBe(0);

    secondRoot.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true }));
    secondRoot.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', metaKey: true, bubbles: true }));

    expect(firstEditor.getState().doc.body).toEqual([]);
    expect(secondEditor.getState().doc.body).toEqual([]);
  });
});
