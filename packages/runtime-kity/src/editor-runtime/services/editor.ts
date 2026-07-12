import { kityBaseUtils } from '../../kity-compat/base-utils';
import { getKityFormulaRuntime, getKityGraphicsRuntime } from '../../kity-compat/runtime-context';

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

type ComponentConstructor = new (editor: KityRuntimeEditorInstance, options?: unknown) => unknown;

type RegisteredService = {
  provider: unknown;
  key: string;
  service: Record<string, (...args: any[]) => unknown>;
};

export type KityRuntimeEditorInstance = {
  options: typeof defaultOptions & Record<string, any>;
  FormulaClass: unknown;
  _readyState: boolean;
  _callbacks: Array<(editor: KityRuntimeEditorInstance) => void>;
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
  ready: (cb: (editor: KityRuntimeEditorInstance) => void) => void;
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

function getService(this: KityRuntimeEditorInstance, serviceName: string) {
  const serviceObject = this.services[serviceName];

  if (!serviceObject) {
    throw new Error(`KFEditor: not found service, ${serviceName}`);
  }

  return serviceObject;
}

const kity = getKityGraphicsRuntime();
const kf = getKityFormulaRuntime();

const KFEditor = kity.createClass('KFEditor', {
  constructor(this: KityRuntimeEditorInstance, container: HTMLElement, options?: Record<string, unknown>) {
    this.options = kityBaseUtils.extend(true, {}, defaultOptions, options);
    this.FormulaClass = null;
    this._readyState = false;
    this._callbacks = [];
    this.container = container;
    this.services = {};
    this.commands = {};
    this.initResource();
  },

  isReady(this: KityRuntimeEditorInstance) {
    return !!this._readyState;
  },

  triggerReady(this: KityRuntimeEditorInstance) {
    let callback: ((editor: KityRuntimeEditorInstance) => void) | undefined;

    while ((callback = this._callbacks.shift())) {
      callback.call(this, this);
    }
  },

  ready(this: KityRuntimeEditorInstance, callback: (editor: KityRuntimeEditorInstance) => void) {
    if (this._readyState) {
      callback.call(this, this);
      return;
    }

    this._callbacks.push(callback);
  },

  getContainer(this: KityRuntimeEditorInstance) {
    return this.container;
  },

  getDocument(this: KityRuntimeEditorInstance) {
    return this.container.ownerDocument;
  },

  getFormulaClass(this: KityRuntimeEditorInstance) {
    return this.FormulaClass;
  },

  getOptions(this: KityRuntimeEditorInstance) {
    return this.options;
  },

  initResource(this: KityRuntimeEditorInstance) {
    kf.ResourceManager.ready((formula) => {
      this.FormulaClass = formula;
      this.initComponents();
      this._readyState = true;
      this.triggerReady();
    }, this.options.resource);
  },

  initComponents(this: KityRuntimeEditorInstance) {
    kityBaseUtils.each(components, (Component: ComponentConstructor, name: string) => {
      new Component(this, this.options[name]);
    });
  },

  requestService(this: KityRuntimeEditorInstance, serviceName: string, ...args: any[]) {
    const serviceObject = getService.call(this, serviceName);
    return serviceObject.service[serviceObject.key].apply(serviceObject.provider, args);
  },

  request(this: KityRuntimeEditorInstance, serviceName: string) {
    return getService.call(this, serviceName).service;
  },

  registerService(
    this: KityRuntimeEditorInstance,
    serviceName: string,
    provider: unknown,
    serviceObject: Record<string, (...args: any[]) => unknown>,
  ) {
    let key = '';

    for (const currentKey in serviceObject) {
      if (Object.prototype.hasOwnProperty.call(serviceObject, currentKey) && serviceObject[currentKey]) {
        serviceObject[currentKey] = kityBaseUtils.proxy(serviceObject[currentKey], provider);
        key = currentKey;
      }
    }

    this.services[serviceName] = {
      provider,
      key,
      service: serviceObject,
    };
  },

  registerCommand(this: KityRuntimeEditorInstance, commandName: string, executor: unknown, execFn: (...args: any[]) => unknown) {
    this.commands[commandName] = {
      executor,
      execFn,
    };
  },

  execCommand(this: KityRuntimeEditorInstance, commandName: string, ...args: any[]) {
    const commandObject = this.commands[commandName];

    if (!commandObject) {
      throw new Error(`KFEditor: not found command, ${commandName}`);
    }

    return commandObject.execFn.apply(commandObject.executor, args);
  },
});

kityBaseUtils.extend(KFEditor, {
  registerComponents(name: string, component: ComponentConstructor) {
    components[name] = component;
  },
});

export default KFEditor as {
  new (container: HTMLElement, options?: Record<string, unknown>): KityRuntimeEditorInstance;
  registerComponents: (name: string, component: ComponentConstructor) => void;
};
