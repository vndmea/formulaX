import { legacyBoxType } from './vendor/legacy-box-type';
import { legacyCharPosition } from './vendor/char-position';
import { legacyOtherPosition } from './vendor/other-position';
import { legacyCommonUtils } from './vendor/legacy-common';
import { createLegacyBaseComponent } from './vendor/legacy-component';
import { legacyEleType } from './vendor/legacy-ele-type';
import { legacyEventListener } from './vendor/legacy-event';
import { legacyGroupType } from './vendor/legacy-group-type';
import { legacyInputFilter } from './vendor/legacy-input-filter';
import { legacyItemType } from './vendor/legacy-item-type';
import { legacyKfExtDef } from './vendor/legacy-kf-ext-def';
import { legacyKfEvent } from './vendor/legacy-kfevent';
import { legacySysconf } from './vendor/legacy-sysconf';
import { legacyUiDef } from './vendor/legacy-ui-def';
import { createLegacyUiUtils } from './vendor/legacy-ui-utils';
import { legacyBaseUtils } from './vendor/legacy-utils';

const DEFAULT_ASSET_BASE = '/kity';
const DEFAULT_LATEX = 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}';

type JQueryShim = {
  get: (url: string, callback: (data: string, state: 'success' | 'error') => void) => void;
};

type EditorRuntimeFactory = {
  ready: (callback: (this: { execCommand: (name: string, value?: string) => void }) => void) => void;
};

type EditorFactory = {
  create: (
    container: HTMLElement,
    options: {
      render: { fontsize: number };
      resource: { path: string };
    },
  ) => EditorRuntimeFactory;
};

type KityWindow = Window &
  typeof globalThis & {
    kity?: unknown;
    jQuery?: JQueryShim;
    $?: JQueryShim;
    __kityFormulaRequire__?: (id: string) => unknown;
    __FORMULAX_KITY_RUNTIME__?: {
      baseComponent?: unknown;
      baseUtils?: typeof legacyBaseUtils;
      boxType?: typeof legacyBoxType;
      sysconf: typeof legacySysconf;
      charPosition: typeof legacyCharPosition;
      commonUtils?: typeof legacyCommonUtils;
      eleType?: typeof legacyEleType;
      eventListener?: typeof legacyEventListener;
      groupType?: typeof legacyGroupType;
      inputFilter?: typeof legacyInputFilter;
      itemType?: typeof legacyItemType;
      kf?: unknown;
      kfExtDef?: typeof legacyKfExtDef;
      kfEvent?: typeof legacyKfEvent;
      kity?: unknown;
      otherPosition: typeof legacyOtherPosition;
      uiDef?: typeof legacyUiDef;
      uiUtils: ReturnType<typeof createLegacyUiUtils>;
    };
    kf?: Record<string, unknown> & {
      EditorFactory?: EditorFactory;
      ResourceManager?: {
        ready: (callback: (formula: unknown) => void, options?: { path?: string }) => void;
      };
    };
  };

export type KityEditorOptions = {
  assetBase?: string;
  initialLatex?: string;
  autofocus?: boolean;
  render?: {
    fontsize?: number;
  };
  resource?: {
    path?: string;
  };
};

export type KityEditorHandle = {
  ready: EditorRuntimeFactory['ready'];
  execCommand: (name: string, value?: string) => void;
  focus: () => void;
  destroy: () => void;
  raw: EditorRuntimeFactory;
};

let runtimePromise: Promise<void> | null = null;

function normalizeAssetBase(assetBase = DEFAULT_ASSET_BASE) {
  return assetBase.endsWith('/') ? assetBase.slice(0, -1) : assetBase;
}

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

function installLegacyRuntime(runtimeWindow: KityWindow) {
  runtimeWindow.__FORMULAX_KITY_RUNTIME__ = {
    baseComponent: runtimeWindow.kity
      ? createLegacyBaseComponent(runtimeWindow.kity as { createClass: (name: string, definition: object) => unknown })
      : undefined,
    baseUtils: legacyBaseUtils,
    boxType: legacyBoxType,
    sysconf: legacySysconf,
    charPosition: legacyCharPosition,
    commonUtils: legacyCommonUtils,
    eleType: legacyEleType,
    eventListener: legacyEventListener,
    groupType: legacyGroupType,
    inputFilter: legacyInputFilter,
    itemType: legacyItemType,
    kf: runtimeWindow.kf,
    kfExtDef: legacyKfExtDef,
    kfEvent: legacyKfEvent,
    kity: runtimeWindow.kity,
    otherPosition: legacyOtherPosition,
    uiDef: legacyUiDef,
    uiUtils: createLegacyUiUtils(),
  };
}

export async function ensureKityRuntime(options: Pick<KityEditorOptions, 'assetBase'> = {}) {
  if (runtimePromise) {
    return runtimePromise;
  }

  const assetBase = normalizeAssetBase(options.assetBase);

  runtimePromise = (async () => {
    const runtimeWindow = window as KityWindow;

    ensureStyle(`${assetBase}/assets/styles/page.css`);
    ensureStyle(`${assetBase}/assets/styles/base.css`);
    ensureStyle(`${assetBase}/assets/styles/ui.css`);
    ensureStyle(`${assetBase}/assets/styles/scrollbar.css`);

    runtimeWindow.kf = runtimeWindow.kf ?? {};
    installMiniJQuery(runtimeWindow);

    await loadScript(`${assetBase}/dev-lib/kitygraph.all.js`);
    await loadScript(`${assetBase}/dev-lib/kity-formula.all.js`);
    hydrateLegacyKf(runtimeWindow);
    await loadScript(`${assetBase}/dev-lib/kity-formula-parser.all.min.js`);
    installLegacyRuntime(runtimeWindow);

    const { installKityEditorStart } = await import('./boot/start');
    installKityEditorStart(runtimeWindow);
  })();

  return runtimePromise;
}

export async function createKityEditor(container: HTMLElement, options: KityEditorOptions = {}): Promise<KityEditorHandle> {
  const assetBase = normalizeAssetBase(options.assetBase);
  const resourcePath = options.resource?.path ?? `${assetBase}/resource/`;
  const fontsize = options.render?.fontsize ?? 40;

  await ensureKityRuntime({ assetBase });

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
      fontsize,
    },
    resource: {
      path: resourcePath,
    },
  });

  return {
    ready: factory.ready.bind(factory),
    execCommand(name, value) {
      factory.ready(function execWhenReady() {
        this.execCommand(name, value);
      });
    },
    focus() {
      factory.ready(function focusWhenReady() {
        this.execCommand('focus');
      });
    },
    destroy() {
      container.innerHTML = '';
      container.classList.remove('kf-editor');
    },
    raw: factory,
  };
}

export async function mountKityEditor(container: HTMLElement, options: KityEditorOptions = {}) {
  const editor = await createKityEditor(container, options);
  const initialLatex = options.initialLatex ?? DEFAULT_LATEX;
  const shouldFocus = options.autofocus ?? true;

  editor.ready(function ready() {
    this.execCommand('render', initialLatex);

    if (shouldFocus) {
      this.execCommand('focus');
    }
  });

  return editor;
}
