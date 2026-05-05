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
import { installKityRuntime } from './kity/index';
import { setToolbarAssetBase } from './toolbar-assets';

const DEFAULT_ASSET_BASE = '';
const DEFAULT_LATEX = 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}';
const DEFAULT_EDITOR_HEIGHT = 'auto';

type EditorRuntimeFactory = {
  ready: (
    callback: (this: { execCommand: (name: string, value?: string) => void }) => void,
  ) => void;
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
    __kityFormulaRequire__?: <T = unknown>(id: string) => T | null;
    __kityFormulaUse__?: <T = unknown>(id: string) => T | null;
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
  height?: number | string;
  initialLatex?: string;
  autofocus?: boolean;
  render?: {
    fontsize?: number;
  };
  resource?: {
    path?: string;
  };
};

export type KityEditorConstructorOptions = KityEditorOptions & {
  el: string | HTMLElement;
};

export type KityEditorHandle = {
  ready: EditorRuntimeFactory['ready'];
  execCommand: (name: string, value?: string) => void;
  focus: () => void;
  destroy: () => void;
  host: HTMLElement;
  raw: EditorRuntimeFactory;
};

let runtimePromise: Promise<void> | null = null;

function resolveContainer(el: string | HTMLElement) {
  if (typeof el === 'string') {
    const element = document.querySelector(el);

    if (!(element instanceof HTMLElement)) {
      throw new Error(`Kity editor mount target not found: ${el}`);
    }

    return element;
  }

  return el;
}

function resolveDefaultAssetBase() {
  if (typeof document === 'undefined') {
    return DEFAULT_ASSET_BASE;
  }

  const baseUrl = new URL('.', document.baseURI);
  return baseUrl.pathname;
}

function normalizeAssetBase(assetBase?: string) {
  const resolvedAssetBase = assetBase ?? resolveDefaultAssetBase();

  if (resolvedAssetBase === '/') {
    return '';
  }

  return resolvedAssetBase.endsWith('/') ? resolvedAssetBase.slice(0, -1) : resolvedAssetBase;
}

function normalizeCssSize(value: number | string | undefined, fallback: string) {
  if (typeof value === 'number') {
    return `${value}px`;
  }

  return value ?? fallback;
}

function hydrateLegacyKf(runtimeWindow: KityWindow) {
  const requireFormula = runtimeWindow.__kityFormulaRequire__;

  if (!requireFormula) {
    return;
  }

  runtimeWindow.kf = {
    ...(runtimeWindow.kf ?? {}),
    ResourceManager: requireFormula('resource-manager') as NonNullable<
      KityWindow['kf']
    >['ResourceManager'],
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
      ? createLegacyBaseComponent(
          runtimeWindow.kity as { createClass: (name: string, definition: object) => unknown },
        )
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

export async function ensureKityRuntime(_options: Pick<KityEditorOptions, 'assetBase'> = {}) {
  if (runtimePromise) {
    return runtimePromise;
  }

  runtimePromise = (async () => {
    const runtimeWindow = window as KityWindow;

    runtimeWindow.kf = runtimeWindow.kf ?? {};

    installKityRuntime(runtimeWindow);

    const { installLegacyKityFormulaRuntime } = await import('./vendor/kity-formula/install');
    installLegacyKityFormulaRuntime(runtimeWindow);
    hydrateLegacyKf(runtimeWindow);

    const { installLegacyParserRuntime } = await import('./vendor/kity-formula-parser/install');
    installLegacyParserRuntime(runtimeWindow);

    installLegacyRuntime(runtimeWindow);

    const { installKityEditorStart } = await import('./boot/start');
    installKityEditorStart(runtimeWindow);
  })();

  return runtimePromise;
}

export async function createKityEditor(
  container: HTMLElement,
  options: KityEditorOptions = {},
): Promise<KityEditorHandle> {
  const assetBase = normalizeAssetBase(options.assetBase);
  const resourcePath = options.resource?.path ?? `${assetBase}/resource/`;
  const fontsize = options.render?.fontsize ?? 40;
  const editorHeight = normalizeCssSize(options.height, DEFAULT_EDITOR_HEIGHT);

  setToolbarAssetBase(options.assetBase);

  await ensureKityRuntime({ assetBase });

  const runtimeWindow = window as KityWindow;

  if (!runtimeWindow.kf?.EditorFactory) {
    throw new Error('Kity editor runtime did not initialize');
  }

  container.innerHTML = '';

  const host = document.createElement('div');
  host.className = 'kf-editor';
  host.style.width = '100%';
  host.style.height = editorHeight;

  container.appendChild(host);

  const factory = runtimeWindow.kf.EditorFactory.create(host, {
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
    },
    host,
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

export class FormulaXEditor {
  private readonly container: HTMLElement;
  private readonly options: KityEditorOptions;
  private readonly handlePromise: Promise<KityEditorHandle>;

  constructor(options: KityEditorConstructorOptions) {
    const { el, ...editorOptions } = options;
    this.container = resolveContainer(el);
    this.options = editorOptions;
    this.handlePromise = mountKityEditor(this.container, this.options);
  }

  ready(callback: Parameters<KityEditorHandle['ready']>[0]) {
    void this.handlePromise.then((handle) => handle.ready(callback));
    return this;
  }

  async execCommand(name: string, value?: string) {
    const handle = await this.handlePromise;
    handle.execCommand(name, value);
    return this;
  }

  async focus() {
    const handle = await this.handlePromise;
    handle.focus();
    return this;
  }

  async destroy() {
    const handle = await this.handlePromise;
    handle.destroy();
  }

  async getHandle() {
    return this.handlePromise;
  }
}

declare global {
  interface Window {
    FormulaXEditor?: typeof FormulaXEditor;
  }
}

if (typeof window !== 'undefined') {
  window.FormulaXEditor = FormulaXEditor;
}
