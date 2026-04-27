import {
  createLegacyUiUtils,
  installLegacyKityData,
  legacyCharPosition,
  legacyOtherPosition,
  legacySysconf,
} from '../../../packages/kity-runtime/src/index';

const KITY_BASE = 'kity';

const SOURCE_MODULES = [
  'base/common',
  'base/component',
  'base/utils',
  'base/event/event',
  'base/event/kfevent',
  'control/controller',
  'control/input-filter',
  'control/input',
  'control/listener',
  'control/location',
  'control/selection',
  'def/group-type',
  'editor/editor',
  'editor/factory',
  'kf-ext/def',
  'kf-ext/extension',
  'kf-ext/expression/placeholder',
  'kf-ext/operator/placeholder',
  'parse/parser',
  'parse/vgroup-def',
  'position/position',
  'print/printer',
  'render/render',
  'syntax/delete',
  'syntax/move',
  'syntax/syntax',
  'ui/def',
  'ui/toolbar-ele-list',
  'ui/ui',
  'ui/control/zoom',
  'ui/toolbar/toolbar',
  'ui/ui-impl/area',
  'ui/ui-impl/box',
  'ui/ui-impl/button',
  'ui/ui-impl/delimiter',
  'ui/ui-impl/drapdown-box',
  'ui/ui-impl/list',
  'ui/ui-impl/ui',
  'ui/ui-impl/def/box-type',
  'ui/ui-impl/def/ele-type',
  'ui/ui-impl/def/item-type',
  'ui/ui-impl/scrollbar/scrollbar',
] as const;

type ModuleRecord = {
  exports: unknown;
  value: unknown;
  factory: ((require: (id: string) => unknown, exports: Record<string, unknown>, module: ModuleRecord) => unknown) | null;
};

type JQueryShim = {
  get: (url: string, callback: (data: string, state: 'success' | 'error') => void) => void;
};

type KityWindow = Window &
  typeof globalThis & {
    __kityCurrentModuleId__?: string;
    __kityRuntimeReady__?: boolean;
    define?: (...args: unknown[]) => void;
    use?: (id: string) => unknown;
    inc?: {
      use: (id: string) => unknown;
      config: (_options: unknown) => void;
      record: (_key: string) => void;
      remove: (_node: Node) => void;
    };
    kity?: unknown;
    jQuery?: JQueryShim;
    $?: JQueryShim;
    __kityFormulaRequire__?: (id: string) => unknown;
    __kityFormulaUse__?: (id: string) => unknown;
    __kityRegisterModule__?: (id: string, value: unknown) => void;
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

function loadScript(src: string, moduleId?: string) {
  return new Promise<void>((resolve, reject) => {
    const selector = moduleId ? `script[data-kity-module="${moduleId}"]` : `script[data-kity-src="${src}"]`;
    const existing = document.querySelector<HTMLScriptElement>(selector);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const runtimeWindow = window as KityWindow;
    runtimeWindow.__kityCurrentModuleId__ = moduleId;

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.kitySrc = src;
    if (moduleId) {
      script.dataset.kityModule = moduleId;
    }
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        runtimeWindow.__kityCurrentModuleId__ = undefined;
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      'error',
      () => {
        runtimeWindow.__kityCurrentModuleId__ = undefined;
        reject(new Error(`Failed to load ${src}`));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });
}

function installRuntime() {
  const runtimeWindow = window as KityWindow & {
    __kityModules__?: Record<string, ModuleRecord>;
  };

  if (runtimeWindow.__kityRuntimeReady__) {
    return;
  }

  const modules: Record<string, ModuleRecord> = {};

  function define(idOrFactory: unknown, depsOrFactory?: unknown, maybeFactory?: unknown) {
    let id: string | undefined;
    let factory: unknown;

    if (typeof idOrFactory === 'string') {
      id = idOrFactory;
      factory = maybeFactory ?? depsOrFactory;
    } else {
      id = runtimeWindow.__kityCurrentModuleId__;
      factory = depsOrFactory ?? idOrFactory;
    }

    if (!id) {
      throw new Error('Missing module id for kity source module');
    }

    modules[id] = {
      exports: {},
      value: null,
      factory: typeof factory === 'function' ? (factory as ModuleRecord['factory']) : null,
    };

    if (typeof factory !== 'function') {
      modules[id].value = factory;
    }
  }

  function requireModule(id: string): unknown {
    const module = modules[id];

    if (!module) {
      throw new Error(`Missing kity module: ${id}`);
    }

    if (module.value !== null) {
      return module.value;
    }

    if (!module.factory) {
      return module.exports;
    }

    const exports = module.factory(requireModule, module.exports as Record<string, unknown>, module);
    module.value = exports ?? module.exports;
    module.factory = null;
    return module.value;
  }

  runtimeWindow.__kityModules__ = modules;
  runtimeWindow.define = define;
  runtimeWindow.use = requireModule;
  runtimeWindow.__kityRegisterModule__ = (id: string, value: unknown) => {
    modules[id] = {
      exports: {},
      value,
      factory: null,
    };
  };
  runtimeWindow.inc = {
    use: requireModule,
    config: () => {},
    record: () => {},
    remove: () => {},
  };
  runtimeWindow.__kityRuntimeReady__ = true;
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

function installEsmBackedModules(runtimeWindow: KityWindow) {
  const registerModule = runtimeWindow.__kityRegisterModule__;

  if (!registerModule || !runtimeWindow.kf || !runtimeWindow.kity) {
    return;
  }

  registerModule('kf', runtimeWindow.kf);
  registerModule('kity', runtimeWindow.kity);
  registerModule('sysconf', legacySysconf);
  registerModule('ui/char-position.data', legacyCharPosition);
  registerModule('ui/other-position.data', legacyOtherPosition);
  registerModule('ui/ui-impl/ui-utils', createLegacyUiUtils());
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
    installLegacyKityData(window);
    await loadScript(`${KITY_BASE}/dev-lib/kitygraph.all.js`);
    await loadScript(`${KITY_BASE}/dev-lib/kity-formula.all.js`);
    hydrateLegacyKf(runtimeWindow);
    await loadScript(`${KITY_BASE}/dev-lib/kity-formula-parser.all.min.js`);

    installRuntime();
    installEsmBackedModules(runtimeWindow);

    for (const moduleId of SOURCE_MODULES) {
      await loadScript(`${KITY_BASE}/src/${moduleId}.js`, moduleId);
    }

    await loadScript(`${KITY_BASE}/dev-lib/start.js`, 'kf.start');

    runtimeWindow.use?.('kf.start');
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
