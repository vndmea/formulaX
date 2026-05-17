<script>
  import { onMount } from 'svelte';
  import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';
  import 'ckeditor5/ckeditor5.css';
  import { FormulaX } from '@formulaxjs/ckeditor5';

  let host;

  onMount(() => {
    let editorInstance;
    let disposed = false;

    ClassicEditor.create(host, {
      licenseKey: 'GPL',
      plugins: [Essentials, Paragraph, FormulaX],
      toolbar: ['formulaX'],
      formulaX: {
        toolbarText: 'FormulaX',
        tooltip: 'Insert or edit formula',
        modal: {
          title: 'FormulaX Editor',
        },
        editor: {
          render: {
            fontsize: 40,
          },
        },
      },
    })
      .then((editor) => {
        if (disposed) {
          void editor.destroy();
          return;
        }

        editorInstance = editor;
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      disposed = true;
      void editorInstance?.destroy();
    };
  });
</script>

<main class="fx-demo-shell">
  <section class="fx-hero">
    <p class="fx-kicker">Svelte Demo</p>
    <h1>CKEditor 5 + FormulaX</h1>
  </section>

  <section class="fx-stage">
    <div class="fx-stage-copy">
      <p>
        Click the <strong>FormulaX</strong> toolbar button to insert or update an inline
        formula inside CKEditor 5.
      </p>
    </div>

    <div class="fx-editor-panel">
      <div bind:this={host} class="fx-editor-host">
        <p>Click the <strong>FormulaX</strong> toolbar button to insert a formula.</p>
      </div>
    </div>
  </section>
</main>

<style>
  .fx-demo-shell {
    width: min(1120px, calc(100% - 32px));
    margin: 0 auto;
    padding: 24px 0 28px;
  }

  .fx-hero {
    margin-bottom: 16px;
  }

  .fx-kicker {
    margin: 0 0 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #9a3412;
  }

  .fx-hero h1 {
    margin: 0;
    font-size: 1.4em;
    line-height: 1;
  }

  .fx-stage {
    border: 1px solid rgba(120, 113, 108, 0.18);
    border-radius: 28px;
    padding: 18px;
    background: rgba(255, 252, 248, 0.92);
    box-shadow: 0 24px 60px rgba(41, 37, 36, 0.08);
    backdrop-filter: blur(14px);
  }

  .fx-stage-copy {
    margin-bottom: 12px;
  }

  .fx-stage-copy p {
    margin: 0;
    color: #57534e;
  }

  .fx-editor-panel {
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(120, 113, 108, 0.16);
    background: #fff;
  }

  .fx-editor-host {
    min-height: 360px;
  }

  :global(.fx-editor-panel .ck-editor__editable_inline) {
    min-height: 320px;
  }

  @media (max-width: 720px) {
    .fx-demo-shell {
      width: min(100%, calc(100% - 20px));
      padding: 16px 0 20px;
    }

    .fx-stage {
      padding: 14px;
      border-radius: 22px;
    }
  }
</style>
