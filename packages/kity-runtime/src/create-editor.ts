import { kityAssetManifest, type KityAssetManifest } from './asset-manifest';
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
import { legacyUiUtils } from './vendor/legacy-ui-utils';
import { legacyBaseUtils } from './vendor/legacy-utils';
import { installKityRuntime } from './kity/index';
import {
  clearFormulaXPerfMarks,
  markFormulaXPerf,
  measureFormulaXPerf,
} from './perf';
import { setToolbarAssetUrls } from './toolbar-assets';
import {
  DEFAULT_FORMULAX_LOCALE,
  normalizeFormulaXLocale,
  type FormulaXLocale,
} from './i18n';

const DEFAULT_LATEX = 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}';
const DEFAULT_EDITOR_HEIGHT = 'auto';
const KITY_STYLE_ID = 'formulax-kity-editor-styles';

type EditorRuntimeFactory = {
  ready: (
    callback: (this: { execCommand: (name: string, value?: string) => unknown }) => void,
  ) => void;
};

type EditorFactory = {
  create: (
    container: HTMLElement,
    options: {
      render: { fontsize: number };
      ui?: { locale?: FormulaXLocale };
      resource: { path: string; fonts?: KityFontAssetMap };
    },
  ) => EditorRuntimeFactory;
};

export type KityFontAssetMap = KityAssetManifest['fonts'];
export type KityToolbarAssetMap = KityAssetManifest['toolbar'];
export type KityStyleAssetMap = KityAssetManifest['styles'];
export type KityEditorAssets = {
  fonts: KityFontAssetMap;
  toolbar: KityToolbarAssetMap;
  styles: KityStyleAssetMap;
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
      uiUtils: typeof legacyUiUtils;
    };
    kf?: Record<string, unknown> & {
      EditorFactory?: EditorFactory;
      ResourceManager?: {
        ready: (
          callback: (formula: unknown) => void,
          options?: { path?: string; fonts?: KityFontAssetMap },
        ) => void;
      };
    };
  };

export type KityEditorOptions = {
  height?: number | string;
  initialLatex?: string;
  autofocus?: boolean;
  locale?: FormulaXLocale;
  assets?: Partial<KityEditorAssets>;
  render?: {
    fontsize?: number;
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

function normalizeCssSize(value: number | string | undefined, fallback: string) {
  if (typeof value === 'number') {
    return `${value}px`;
  }

  return value ?? fallback;
}

function resolveEditorAssets(assets?: Partial<KityEditorAssets>): KityEditorAssets {
  return {
    fonts: {
      ...kityAssetManifest.fonts,
      ...assets?.fonts,
    },
    toolbar: {
      ...kityAssetManifest.toolbar,
      ...assets?.toolbar,
    },
    styles: {
      ...kityAssetManifest.styles,
      ...assets?.styles,
    },
  };
}

function ensureKityStylesheet(doc: Document, href: string): boolean {
  if (doc.getElementById(KITY_STYLE_ID)) {
    return false;
  }

  const link = doc.createElement('link');
  link.id = KITY_STYLE_ID;
  link.rel = 'stylesheet';
  link.href = href;
  doc.head.appendChild(link);
  return true;
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
    uiUtils: legacyUiUtils,
  };
}

export async function ensureKityRuntime() {
  if (runtimePromise) {
    return runtimePromise;
  }

  runtimePromise = (async () => {
    const runtimeTotalStart = markFormulaXPerf('fx:kity-runtime:total');
    const runtimeWindow = window as KityWindow;

    runtimeWindow.kf = runtimeWindow.kf ?? {};

    installKityRuntime(runtimeWindow);

    try {
      const formulaImportStart = markFormulaXPerf('fx:kity-runtime:formula-import');
      const { installLegacyKityFormulaRuntime } = await import('./vendor/kity-formula/install');
      const formulaImportEnd = markFormulaXPerf('fx:kity-runtime:formula-import:end');
      measureFormulaXPerf('fx:kity-runtime:formula-import', formulaImportStart, formulaImportEnd);
      clearFormulaXPerfMarks(formulaImportStart, formulaImportEnd);

      const formulaInstallStart = markFormulaXPerf('fx:kity-runtime:formula-install');
      installLegacyKityFormulaRuntime(runtimeWindow);
      hydrateLegacyKf(runtimeWindow);
      const formulaInstallEnd = markFormulaXPerf('fx:kity-runtime:formula-install:end');
      measureFormulaXPerf('fx:kity-runtime:formula-install', formulaInstallStart, formulaInstallEnd);
      clearFormulaXPerfMarks(formulaInstallStart, formulaInstallEnd);

      const parserImportStart = markFormulaXPerf('fx:kity-runtime:parser-import');
      const { installLegacyParserRuntime } = await import('./vendor/kity-formula-parser/install');
      const parserImportEnd = markFormulaXPerf('fx:kity-runtime:parser-import:end');
      measureFormulaXPerf('fx:kity-runtime:parser-import', parserImportStart, parserImportEnd);
      clearFormulaXPerfMarks(parserImportStart, parserImportEnd);

      const parserInstallStart = markFormulaXPerf('fx:kity-runtime:parser-install');
      installLegacyParserRuntime(runtimeWindow);
      const parserInstallEnd = markFormulaXPerf('fx:kity-runtime:parser-install:end');
      measureFormulaXPerf('fx:kity-runtime:parser-install', parserInstallStart, parserInstallEnd);
      clearFormulaXPerfMarks(parserInstallStart, parserInstallEnd);

      installLegacyRuntime(runtimeWindow);

      const bootImportStart = markFormulaXPerf('fx:kity-runtime:boot-import');
      const { installKityEditorStart } = await import('./boot/start');
      const bootImportEnd = markFormulaXPerf('fx:kity-runtime:boot-import:end');
      measureFormulaXPerf('fx:kity-runtime:boot-import', bootImportStart, bootImportEnd);
      clearFormulaXPerfMarks(bootImportStart, bootImportEnd);

      const bootInstallStart = markFormulaXPerf('fx:kity-runtime:boot-install');
      installKityEditorStart(runtimeWindow);
      const bootInstallEnd = markFormulaXPerf('fx:kity-runtime:boot-install:end');
      measureFormulaXPerf('fx:kity-runtime:boot-install', bootInstallStart, bootInstallEnd);
      clearFormulaXPerfMarks(bootInstallStart, bootInstallEnd);
    } finally {
      const runtimeTotalEnd = markFormulaXPerf('fx:kity-runtime:total:end');
      measureFormulaXPerf('fx:kity-runtime:total', runtimeTotalStart, runtimeTotalEnd);
      clearFormulaXPerfMarks(runtimeTotalStart, runtimeTotalEnd);
    }
  })();

  return runtimePromise;
}

export async function createKityEditor(
  container: HTMLElement,
  options: KityEditorOptions = {},
): Promise<KityEditorHandle> {
  const createEditorStart = markFormulaXPerf('fx:create-kity-editor:total');
  const fontsize = options.render?.fontsize ?? 40;
  const editorHeight = normalizeCssSize(options.height, DEFAULT_EDITOR_HEIGHT);
  const locale = normalizeFormulaXLocale(options.locale ?? DEFAULT_FORMULAX_LOCALE);
  const assets = resolveEditorAssets(options.assets);

  try {
    const stylesheetInserted = ensureKityStylesheet(document, assets.styles.editor);
    if (stylesheetInserted) {
      const stylesheetInsertedMark = markFormulaXPerf('fx:kity-css:link-inserted');
      measureFormulaXPerf('fx:kity-css:link-inserted', createEditorStart, stylesheetInsertedMark);
      clearFormulaXPerfMarks(stylesheetInsertedMark);
    }

    setToolbarAssetUrls(assets.toolbar);

    await ensureKityRuntime();

    const runtimeReadyMark = markFormulaXPerf('fx:kity-runtime:ready-for-editor');
    measureFormulaXPerf('fx:kity-runtime:ready-for-editor', createEditorStart, runtimeReadyMark);
    clearFormulaXPerfMarks(runtimeReadyMark);

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

    const factoryCreateStart = markFormulaXPerf('fx:kity-editor-factory:create');
    const factory = runtimeWindow.kf.EditorFactory.create(host, {
      render: {
        fontsize,
      },
      ui: {
        locale,
      },
      resource: {
        path: '',
        fonts: assets.fonts,
      },
    });
    const factoryCreateEnd = markFormulaXPerf('fx:kity-editor-factory:create:end');
    measureFormulaXPerf('fx:kity-editor-factory:create', factoryCreateStart, factoryCreateEnd);
    clearFormulaXPerfMarks(factoryCreateStart, factoryCreateEnd);

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
  } finally {
    const createEditorEnd = markFormulaXPerf('fx:create-kity-editor:total:end');
    measureFormulaXPerf('fx:create-kity-editor:total', createEditorStart, createEditorEnd);
    clearFormulaXPerfMarks(createEditorStart, createEditorEnd);
  }
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
