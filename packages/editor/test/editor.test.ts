import { doc, text } from '@formulax/core';
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
});
