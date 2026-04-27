const KITY_BASE = 'kity';

type JQueryShim = {
  get: (url: string, callback: (data: string, state: 'success' | 'error') => void) => void;
};

type KityWindow = Window &
  typeof globalThis & {
    kity?: unknown;
    jQuery?: JQueryShim;
    $?: JQueryShim;
    __kityFormulaRequire__?: (id: string) => unknown;
    kf?: Record<string, unknown> & {
      EditorFactory?: {
        create: (
          container: HTMLElement,
          options: {
            render: { fontsize: number };
            resource: { path: string };
          },
        ) => {
          ready: (callback: (this: { execCommand: (name: string, value?: string) => void }) => void) => void;
        };
      };
      ResourceManager?: {
        ready: (callback: (formula: unknown) => void, options?: { path?: string }) => void;
      };
    };
  };

let runtimePromise: Promise<void> | null = null;

function installMiniJQuery(runtimeWindow: KityWindow) {
  if (runtimeWindow.jQuery?.get) {
    return;
  }

  const shim: JQueryShim = {
    get(url, callback) {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch ${url}`);
          }

          return response.arrayBuffer();
        })
        .then(() => callback('', 'success'))
        .catch(() => callback('', 'error'));
    },
  };

  runtimeWindow.jQuery = shim;
  runtimeWindow.$ = shim;
}

function ensureStyle(href: string) {
  const existing = document.querySelector<HTMLLinkElement>(`link[data-kity-href="${href}"]`);
  if (existing) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.kityHref = href;
  document.head.appendChild(link);
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-kity-src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.kitySrc = src;
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true },
    );
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

function loadModuleScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-kity-module-src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load module ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = src;
    script.dataset.kityModuleSrc = src;
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true },
    );
    script.addEventListener('error', () => reject(new Error(`Failed to load module ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

function hydrateLegacyKf(runtimeWindow: KityWindow) {
  const requireFormula = runtimeWindow.__kityFormulaRequire__;

  if (!requireFormula) {
    return;
  }

  runtimeWindow.kf = {
    ...(runtimeWindow.kf ?? {}),
    ResourceManager: requireFormula('resource-manager') as NonNullable<KityWindow['kf']>['ResourceManager'],
    Operator: requireFormula('operator/operator'),
    Expression: requireFormula('expression/expression'),
    CompoundExpression: requireFormula('expression/compound'),
    TextExpression: requireFormula('expression/text'),
    EmptyExpression: requireFormula('expression/empty'),
    CombinationExpression: requireFormula('expression/compound-exp/combination'),
    FunctionExpression: requireFormula('expression/compound-exp/func'),
    FractionExpression: requireFormula('expression/compound-exp/fraction'),
    IntegrationExpression: requireFormula('expression/compound-exp/integration'),
    RadicalExpression: requireFormula('expression/compound-exp/radical'),
    ScriptExpression: requireFormula('expression/compound-exp/script'),
    SuperscriptExpression: requireFormula('expression/compound-exp/binary-exp/superscript'),
    SubscriptExpression: requireFormula('expression/compound-exp/binary-exp/subscript'),
    SummationExpression: requireFormula('expression/compound-exp/summation'),
    BracketsExpression: requireFormula('expression/compound-exp/brackets'),
  };
}

async function ensureRuntime() {
  if (runtimePromise) {
    return runtimePromise;
  }

  runtimePromise = (async () => {
    const runtimeWindow = window as KityWindow;

    ensureStyle(`${KITY_BASE}/assets/styles/page.css`);
    ensureStyle(`${KITY_BASE}/assets/styles/base.css`);
    ensureStyle(`${KITY_BASE}/assets/styles/ui.css`);
    ensureStyle(`${KITY_BASE}/assets/styles/scrollbar.css`);

    runtimeWindow.kf = runtimeWindow.kf ?? {};
    installMiniJQuery(runtimeWindow);

    await loadScript(`${KITY_BASE}/dev-lib/kitygraph.all.js`);
    await loadScript(`${KITY_BASE}/dev-lib/kity-formula.all.js`);
    hydrateLegacyKf(runtimeWindow);
    await loadScript(`${KITY_BASE}/dev-lib/kity-formula-parser.all.min.js`);

    await loadModuleScript(`${KITY_BASE}/src/start.js`);
  })();

  return runtimePromise;
}

export async function mountKityEditor(container: HTMLElement) {
  await ensureRuntime();

  const runtimeWindow = window as KityWindow;

  if (!runtimeWindow.kf?.EditorFactory) {
    throw new Error('Kity editor runtime did not initialize');
  }

  container.innerHTML = '';
  container.classList.add('kf-editor');
  container.style.width = '100%';
  container.style.height = '100%';

  const factory = runtimeWindow.kf.EditorFactory.create(container, {
    render: {
      fontsize: 40,
    },
    resource: {
      path: `${KITY_BASE}/resource/`,
    },
  });

  factory.ready(function ready() {
    this.execCommand('render', 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}');
    this.execCommand('focus');
  });
}
