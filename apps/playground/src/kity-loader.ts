import { legacyCharPosition } from '../../../packages/kity-runtime/src/vendor/char-position';
import { legacyOtherPosition } from '../../../packages/kity-runtime/src/vendor/other-position';
import { legacyCommonUtils } from '../../../packages/kity-runtime/src/vendor/legacy-common';
import { createLegacyBaseComponent } from '../../../packages/kity-runtime/src/vendor/legacy-component';
import { legacyEventListener } from '../../../packages/kity-runtime/src/vendor/legacy-event';
import { legacyKfEvent } from '../../../packages/kity-runtime/src/vendor/legacy-kfevent';
import { legacySysconf } from '../../../packages/kity-runtime/src/vendor/legacy-sysconf';
import { createLegacyUiUtils } from '../../../packages/kity-runtime/src/vendor/legacy-ui-utils';
import { legacyBaseUtils } from '../../../packages/kity-runtime/src/vendor/legacy-utils';

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
    __FORMULAX_KITY_RUNTIME__?: {
      baseComponent?: unknown;
      baseUtils?: typeof legacyBaseUtils;
      sysconf: typeof legacySysconf;
      charPosition: typeof legacyCharPosition;
      commonUtils?: typeof legacyCommonUtils;
      eventListener?: typeof legacyEventListener;
      kf?: unknown;
      kfEvent?: typeof legacyKfEvent;
      kity?: unknown;
      otherPosition: typeof legacyOtherPosition;
      uiUtils: ReturnType<typeof createLegacyUiUtils>;
    };
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
    baseComponent: runtimeWindow.kity ? createLegacyBaseComponent(runtimeWindow.kity as { createClass: (name: string, definition: object) => unknown }) : undefined,
    baseUtils: legacyBaseUtils,
    sysconf: legacySysconf,
    charPosition: legacyCharPosition,
    commonUtils: legacyCommonUtils,
    eventListener: legacyEventListener,
    kf: runtimeWindow.kf,
    kfEvent: legacyKfEvent,
    kity: runtimeWindow.kity,
    otherPosition: legacyOtherPosition,
    uiUtils: createLegacyUiUtils(),
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
    installLegacyRuntime(runtimeWindow);

    const { installKityEditorStart } = await import('../../../packages/kity-runtime/src/boot/start');
    installKityEditorStart(runtimeWindow);
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
