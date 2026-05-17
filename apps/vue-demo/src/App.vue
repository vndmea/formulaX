<script setup lang="ts">
import tinymce from 'tinymce';
import 'tinymce/icons/default';
import 'tinymce/models/dom';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/skin';
import 'tinymce/skins/content/default/content';
import { registerFormulaXTinyMcePlugin } from '@formulaxjs/tinymce';
import { onMounted, onUnmounted, ref } from 'vue';

const editorRef = ref<HTMLElement | null>(null);
let editor: any = null;

onMounted(async () => {
  if (!editorRef.value) {
    return;
  }

  registerFormulaXTinyMcePlugin(tinymce, {
    tooltip: 'Insert or edit formula',
    modal: {
      title: 'FormulaX Editor',
    },
  });

  const editors = await tinymce.init({
    target: editorRef.value,
    height: 360,
    width: '100%',
    menubar: false,
    plugins: 'formulax',
    toolbar: 'undo redo | formulax',
    license_key: 'gpl',
    content_style: `
      body {
        font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
        font-size: 16px;
        padding: 18px;
      }
    `,
  });

  editor = editors[0] ?? null;
});

onUnmounted(() => {
  editor?.remove();
});
</script>

<template>
  <main class="fx-demo-shell">
    <section class="fx-hero">
      <p class="fx-kicker">Vue 3 Demo</p>
      <h1>TinyMCE v7 + FormulaX</h1>
    </section>

    <section class="fx-stage">
      <div class="fx-stage-copy">
        <p>
          Click the <strong>FormulaX</strong> toolbar button to insert or edit a formula inline.
        </p>
      </div>
      <div ref="editorRef" class="fx-editor-host"></div>
    </section>
  </main>
</template>

<style scoped>
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

.fx-stage-copy h2 {
  margin: 0 0 8px;
  font-size: 1.15rem;
}

.fx-stage-copy p {
  margin: 0;
  color: #57534e;
}

.fx-editor-host {
  min-height: 360px;
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
