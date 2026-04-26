import './app.css';
import { mountKityEditor } from './kity-loader';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root not found');
}

app.innerHTML = `
  <main class="playground-shell">
    <section class="playground-editor" data-testid="playground-editor">
      <div id="kity-editor" class="playground-editor-root"></div>
    </section>
  </main>
`;

const editorRoot = document.querySelector<HTMLDivElement>('#kity-editor');

if (!editorRoot) {
  throw new Error('Kity editor root not found');
}

void mountKityEditor(editorRoot);
