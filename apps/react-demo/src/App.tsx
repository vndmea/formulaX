import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { createFormulaXNode } from '@formulaxjs/tiptap';

const FormulaXNode = createFormulaXNode();

type FormulaXEditorCommands = {
  openFormulaX: () => boolean;
};

export default function App() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, FormulaXNode],
    content:
      '<p>Click <strong>FormulaX</strong> to insert a formula, then double-click any existing formula to edit it.</p>',
  });

  return (
    <main className="fx-demo-shell">
      <section className="fx-hero">
        <p className="fx-kicker">React Demo</p>
        <h1>Tiptap v3 + FormulaX</h1>
      </section>

      <section className="fx-stage">
        <div className="fx-stage-copy">
          <p>
            Use the toolbar button to open the FormulaX modal, or double-click an inline
            formula to update it.
          </p>
        </div>

        <div className="fx-toolbar">
          <button
            type="button"
            className="fx-toolbar-button"
            disabled={!editor}
            onClick={() => (editor?.commands as unknown as FormulaXEditorCommands | undefined)?.openFormulaX()}
          >
            FormulaX
          </button>
        </div>

        <div className="fx-editor-panel">
          <EditorContent editor={editor} className="fx-editor-host" />
        </div>
      </section>
    </main>
  );
}
