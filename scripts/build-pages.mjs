import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const root = resolve(process.cwd());
const outputDir = join(root, '.pages-dist');
const repoName = process.env.PAGES_REPO || process.env.GITHUB_REPOSITORY?.split('/')[1] || 'formulaX';
const basePrefix = `/${repoName}`;

const apps = [
  {
    name: 'playground',
    dir: 'apps/playground',
    basePath: `${basePrefix}/playground/`,
    outputSubdir: 'playground',
    title: 'Playground',
    description: 'Standalone FormulaX editor surface with live LaTeX and KaTeX preview.',
  },
  {
    name: 'ckeditor5',
    dir: 'apps/ckeditor5-demo',
    basePath: `${basePrefix}/ckeditor5/`,
    outputSubdir: 'ckeditor5',
    title: 'CKEditor 5 Demo',
    description: 'Minimal CKEditor 5 integration showing FormulaX as an inline formula widget.',
  },
  {
    name: 'tiptap',
    dir: 'apps/tiptap-demo',
    basePath: `${basePrefix}/tiptap/`,
    outputSubdir: 'tiptap',
    title: 'Tiptap Demo',
    description: 'Minimal Tiptap integration showing FormulaX as an embeddable host editor node.',
  },
  {
    name: 'tinymce',
    dir: 'apps/tinymce-demo',
    basePath: `${basePrefix}/tinymce/`,
    outputSubdir: 'tinymce',
    title: 'TinyMCE Demo',
    description: 'Minimal TinyMCE integration showing FormulaX markup inserted into host content.',
  },
  {
    name: 'vue',
    dir: 'apps/vue-demo',
    basePath: `${basePrefix}/vue/`,
    outputSubdir: 'vue',
    title: 'Vue Demo',
    description: 'Vue 3 + TinyMCE v7 integration with FormulaX managed through component lifecycle hooks.',
  },
  {
    name: 'react',
    dir: 'apps/react-demo',
    basePath: `${basePrefix}/react/`,
    outputSubdir: 'react',
    title: 'React Demo',
    description: 'React + Tiptap v3 integration with FormulaX exposed through a lightweight toolbar action.',
  },
  {
    name: 'svelte',
    dir: 'apps/svelte-demo',
    basePath: `${basePrefix}/svelte/`,
    outputSubdir: 'svelte',
    title: 'Svelte Demo',
    description: 'Svelte + CKEditor 5 integration with FormulaX mounted through the official plugin surface.',
  },
];

const ensureCleanDir = (dir) => {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
};

const run = (command, cwd = root) => {
  execSync(command, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env },
  });
};

const buildApp = ({ dir, basePath, outputSubdir }) => {
  const appDir = join(root, dir);
  const outDir = join(outputDir, outputSubdir);
  mkdirSync(outDir, { recursive: true });
  run(`corepack pnpm vite build --base ${basePath} --outDir "${outDir}" --emptyOutDir`, appDir);
};

const renderIndex = () => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FormulaX Demos</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f5f7fb;
        --panel: rgba(255, 255, 255, 0.84);
        --border: rgba(148, 163, 184, 0.24);
        --text: #0f172a;
        --muted: #475569;
        --accent: #2563eb;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(96, 165, 250, 0.22), transparent 30%),
          radial-gradient(circle at top right, rgba(250, 204, 21, 0.18), transparent 28%),
          linear-gradient(180deg, #ffffff 0%, var(--bg) 100%);
      }
      main {
        max-width: 1120px;
        margin: 0 auto;
        padding: 48px 24px 72px;
      }
      header {
        display: grid;
        gap: 12px;
        margin-bottom: 32px;
      }
      .eyebrow {
        letter-spacing: 0.16em;
        text-transform: uppercase;
        font-size: 12px;
        color: var(--muted);
      }
      h1 {
        margin: 0;
        font-size: clamp(36px, 6vw, 64px);
        line-height: 1;
      }
      p.lead {
        margin: 0;
        max-width: 760px;
        color: var(--muted);
        font-size: 18px;
        line-height: 1.7;
      }
      .table-shell {
        overflow-x: auto;
        border-radius: 24px;
        border: 1px solid var(--border);
        background: var(--panel);
        backdrop-filter: blur(10px);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 720px;
      }
      thead th {
        padding: 18px 20px;
        text-align: left;
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
        background: rgba(255, 255, 255, 0.72);
      }
      tbody td {
        padding: 22px 20px;
        vertical-align: top;
        border-top: 1px solid var(--border);
      }
      tbody tr:hover {
        background: rgba(255, 255, 255, 0.44);
      }
      .demo-name {
        margin: 0;
        font-size: 22px;
        font-weight: 600;
      }
      .demo-desc {
        margin: 0;
        color: var(--muted);
        line-height: 1.65;
      }
      a.button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 120px;
        padding: 12px 16px;
        border-radius: 999px;
        background: var(--accent);
        color: white;
        text-decoration: none;
        font-weight: 600;
      }
      footer {
        margin-top: 28px;
        color: var(--muted);
      }
      @media (max-width: 760px) {
        main {
          padding: 32px 16px 56px;
        }
        thead th,
        tbody td {
          padding: 16px;
        }
        .demo-name {
          font-size: 18px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <div class="eyebrow">FormulaX</div>
        <h1>GitHub Pages Demo Hub</h1>
        <p class="lead">
          Explore the current FormulaX prototype across standalone editing and host-editor integrations.
          Each demo is published as a static site and can be shared independently.
        </p>
      </header>
      <section class="table-shell">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Demo</th>
            </tr>
          </thead>
          <tbody>
            ${apps
              .map(
                (app) => `
            <tr>
              <td>
                <p class="demo-name">${app.title}</p>
              </td>
              <td>
                <p class="demo-desc">${app.description}</p>
              </td>
              <td>
                <a class="button" href="${basePrefix}/${app.outputSubdir}/">Open demo</a>
              </td>
            </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </section>
      <footer>
        Built from the FormulaX monorepo.
      </footer>
    </main>
  </body>
</html>`;

ensureCleanDir(outputDir);
run('corepack pnpm build:packages');

for (const app of apps) {
  buildApp(app);
}

writeFileSync(join(outputDir, 'index.html'), renderIndex(), 'utf8');
writeFileSync(join(outputDir, '.nojekyll'), '', 'utf8');

if (existsSync(join(root, 'README.md'))) {
  const readme = readFileSync(join(root, 'README.md'), 'utf8');
  writeFileSync(join(outputDir, 'README.txt'), readme, 'utf8');
}

console.log(`Built Pages site at ${outputDir}`);
