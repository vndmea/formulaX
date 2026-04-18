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
];

const ensureCleanDir = (dir) => {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
};

const buildApp = ({ dir, basePath, outputSubdir }) => {
  const appDir = join(root, dir);
  const outDir = join(outputDir, outputSubdir);
  mkdirSync(outDir, { recursive: true });
  execSync(`corepack pnpm vite build --base ${basePath} --outDir "${outDir}"`, {
    cwd: appDir,
    stdio: 'inherit',
    env: { ...process.env },
  });
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
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 20px;
      }
      .card {
        padding: 24px;
        border-radius: 24px;
        border: 1px solid var(--border);
        background: var(--panel);
        backdrop-filter: blur(10px);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
      }
      .card h2 {
        margin: 0 0 12px;
        font-size: 24px;
      }
      .card p {
        margin: 0 0 20px;
        color: var(--muted);
        line-height: 1.6;
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
      <section class="grid">
        ${apps
          .map(
            (app) => `
          <article class="card">
            <h2>${app.title}</h2>
            <p>${app.description}</p>
            <a class="button" href="${basePrefix}/${app.outputSubdir}/">Open demo</a>
          </article>`,
          )
          .join('')}
      </section>
      <footer>
        Built from the FormulaX monorepo.
      </footer>
    </main>
  </body>
</html>`;

ensureCleanDir(outputDir);

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
