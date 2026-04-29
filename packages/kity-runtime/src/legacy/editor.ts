import { legacyBaseUtils } from '../vendor/legacy-utils';
import { getLegacyKf, getLegacyKity } from '../vendor/runtime-interop';

const defaultOptions = {
  formula: {
    fontsize: 50,
    autoresize: false,
  },
  ui: {
    zoom: true,
    maxzoom: 2,
    minzoom: 1,
  },
};

type ComponentConstructor = new (editor: LegacyEditorInstance, options?: unknown) => unknown;

type RegisteredService = {
  provider: unknown;
  key: string;
  service: Record<string, (...args: any[]) => unknown>;
};

export type LegacyEditorInstance = {
  options: typeof defaultOptions & Record<string, any>;
  FormulaClass: unknown;
  _readyState: boolean;
  _callbacks: Array<(editor: LegacyEditorInstance) => void>;
  container: HTMLElement;
  services: Record<string, RegisteredService>;
  commands: Record<
    string,
    {
      executor: unknown;
      execFn: (...args: any[]) => unknown;
    }
  >;
  initResource: () => void;
  initComponents: () => void;
  isReady: () => boolean;
  triggerReady: () => void;
  ready: (cb: (editor: LegacyEditorInstance) => void) => void;
  getContainer: () => HTMLElement;
  getDocument: () => Document;
  getFormulaClass: () => unknown;
  getOptions: () => typeof defaultOptions & Record<string, any>;
  requestService: (serviceName: string, ...args: any[]) => unknown;
  request: (serviceName: string) => Record<string, (...args: any[]) => unknown>;
  registerService: (serviceName: string, provider: unknown, serviceObject: Record<string, (...args: any[]) => unknown>) => void;
  registerCommand: (commandName: string, executor: unknown, execFn: (...args: any[]) => unknown) => void;
  execCommand: (commandName: string, ...args: any[]) => unknown;
};

const components: Record<string, ComponentConstructor> = {};

function getService(this: LegacyEditorInstance, serviceName: string) {
  const serviceObject = this.services[serviceName];

  if (!serviceObject) {
    throw new Error(`KFEditor: not found service, ${serviceName}`);
  }

  return serviceObject;
}

const kity = getLegacyKity();
const kf = getLegacyKf();

const KFEditor = kity.createClass('KFEditor', {
  constructor(this: LegacyEditorInstance, container: HTMLElement, options?: Record<string, unknown>) {
    this.options = legacyBaseUtils.extend(true, {}, defaultOptions, options);
    this.FormulaClass = null;
    this._readyState = false;
    this._callbacks = [];
    this.container = container;
    this.services = {};
    this.commands = {};
    this.initResource();
  },

  isReady(this: LegacyEditorInstance) {
    return !!this._readyState;
  },

  triggerReady(this: LegacyEditorInstance) {
    let callback: ((editor: LegacyEditorInstance) => void) | undefined;

    while ((callback = this._callbacks.shift())) {
      callback.call(this, this);
    }
  },

  ready(this: LegacyEditorInstance, callback: (editor: LegacyEditorInstance) => void) {
    if (this._readyState) {
      callback.call(this, this);
      return;
    }

    this._callbacks.push(callback);
  },

  getContainer(this: LegacyEditorInstance) {
    return this.container;
  },

  getDocument(this: LegacyEditorInstance) {
    return this.container.ownerDocument;
  },

  getFormulaClass(this: LegacyEditorInstance) {
    return this.FormulaClass;
  },

  getOptions(this: LegacyEditorInstance) {
    return this.options;
  },

  initResource(this: LegacyEditorInstance) {
    kf.ResourceManager.ready((formula) => {
      this.FormulaClass = formula;
      this.initComponents();
      this._readyState = true;
      this.triggerReady();
    }, this.options.resource);
  },

  initComponents(this: LegacyEditorInstance) {
    legacyBaseUtils.each(components, (Component: ComponentConstructor, name: string) => {
      new Component(this, this.options[name]);
    });
  },

  requestService(this: LegacyEditorInstance, serviceName: string, ...args: any[]) {
    const serviceObject = getService.call(this, serviceName);
    return serviceObject.service[serviceObject.key].apply(serviceObject.provider, args);
  },

  request(this: LegacyEditorInstance, serviceName: string) {
    return getService.call(this, serviceName).service;
  },

  registerService(
    this: LegacyEditorInstance,
    serviceName: string,
    provider: unknown,
    serviceObject: Record<string, (...args: any[]) => unknown>,
  ) {
    let key = '';

    for (const currentKey in serviceObject) {
      if (Object.prototype.hasOwnProperty.call(serviceObject, currentKey) && serviceObject[currentKey]) {
        serviceObject[currentKey] = legacyBaseUtils.proxy(serviceObject[currentKey], provider);
        key = currentKey;
      }
    }

    this.services[serviceName] = {
      provider,
      key,
      service: serviceObject,
    };
  },

  registerCommand(this: LegacyEditorInstance, commandName: string, executor: unknown, execFn: (...args: any[]) => unknown) {
    this.commands[commandName] = {
      executor,
      execFn,
    };
  },

  execCommand(this: LegacyEditorInstance, commandName: string, ...args: any[]) {
    const commandObject = this.commands[commandName];

    if (!commandObject) {
      throw new Error(`KFEditor: not found command, ${commandName}`);
    }

    return commandObject.execFn.apply(commandObject.executor, args);
  },
});

legacyBaseUtils.extend(KFEditor, {
  registerComponents(name: string, component: ComponentConstructor) {
    components[name] = component;
  },
});

export default KFEditor as {
  new (container: HTMLElement, options?: Record<string, unknown>): LegacyEditorInstance;
  registerComponents: (name: string, component: ComponentConstructor) => void;
};
