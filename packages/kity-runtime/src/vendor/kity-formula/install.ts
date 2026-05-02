// @ts-nocheck

import { createBinaryExpressionClass } from './binary-expression';
import { createBracketsExpressionClass } from './brackets-expression';
import { createBracketsOperatorClass } from './brackets-operator';
import { createCanvgRuntime } from './canvg-runtime';
import { CHAR_CONF } from './char-conf';
import { createCharClass } from './char';
import { CHAR_MAP } from './char-map';
import { createCombinationExpressionClass } from './combination-expression';
import { createCombinationOperatorClass } from './combination-operator';
import { createCompoundExpressionClass } from './compound-expression';
import { createEmptyExpressionClass } from './empty-expression';
import { createExpressionClass } from './expression';
import { createFontInstallerClass } from './font-installer';
import { createFontManager } from './font-manager';
import { createFormulaClass } from './formula';
import { createFPaperClass } from './fpaper';
import { createFractionExpressionClass } from './fraction-expression';
import { createFractionOperatorClass } from './fraction-operator';
import { createFunctionExpressionClass } from './function-expression';
import { createFunctionOperatorClass } from './function-operator';
import { GTYPE } from './gtype';
import { createIntegrationExpressionClass } from './integration-expression';
import { createIntegrationOperatorClass } from './integration-operator';
import { createOperatorClass } from './operator';
import { createOutputClass } from './output';
import { createRadicalExpressionClass } from './radical-expression';
import { createRadicalOperatorClass } from './radical-operator';
import { createResourceManager } from './resource-manager';
import { SCRIPT_TYPE } from './script-type';
import { createScriptControllerClass } from './script-controller';
import { createScriptExpressionClass } from './script-expression';
import { createScriptOperatorClass } from './script-operator';
import { createSignGroupClass } from './signgroup';
import { createSubscriptExpressionClass } from './subscript-expression';
import { createSummationExpressionClass } from './summation-expression';
import { createSummationOperatorClass } from './summation-operator';
import { createSuperscriptExpressionClass } from './superscript-expression';
import { createSysconf } from './sysconf';
import { createTextClass } from './text';
import { FONT_CHECKER_TEMPLATE as _FONT_CHECKER_TEMPLATE } from './font-checker-template';
import { createTextExpressionClass } from './text-expression';
import { createTextFactory } from './text-factory';
import { KF_AMS_BB_FONT_MAP } from './font-map-kf-ams-bb';
import { KF_AMS_CAL_FONT_MAP } from './font-map-kf-ams-cal';
import { KF_AMS_FRAK_FONT_MAP } from './font-map-kf-ams-frak';
import { KF_AMS_MAIN_FONT_MAP } from './font-map-kf-ams-main';
import { KF_AMS_ROMAN_FONT_MAP } from './font-map-kf-ams-roman';

type KityFormulaRuntimeWindow = Window &
  typeof globalThis & {
    kf?: Record<string, unknown> & {
      ResourceManager?: unknown;
    };
    kity?: unknown;
    __kityFormulaRequire__?: <T = unknown>(id: string) => T | null;
    __kityFormulaUse__?: <T = unknown>(id: string) => T | null;
  };

type RuntimeModuleFactory = () => unknown;

type RuntimeModuleFactories = Record<string, RuntimeModuleFactory>;

let installed = false;

export function installLegacyKityFormulaRuntime(target: KityFormulaRuntimeWindow = window) {
  if (installed && target.kf?.ResourceManager && target.__kityFormulaRequire__) {
    return target.kf;
  }

  const runtimeWindow = target as any;
  const kity = runtimeWindow.kity;

  if (!kity) {
    throw new Error('Missing Kity Graphic Lib');
  }

  const moduleValues = new Map<string, unknown>();

  const requireModule = <T = unknown>(id: string): T | null => {
    if (moduleValues.has(id)) {
      return moduleValues.get(id) as T;
    }

    const factory = moduleFactories[id];
    if (!factory) {
      return null;
    }

    const value = factory();
    moduleValues.set(id, value);
    return value as T;
  };

  const useModule = <T = unknown>(id: string) => requireModule<T>(id);

  const moduleFactories: RuntimeModuleFactories = {
    kity: () => runtimeWindow.kity,
    'base/canvg': () => createCanvgRuntime(),
    'base/output': () => createOutputClass(requireModule('kity'), requireModule('base/canvg')),
    'char/char': () => createCharClass(requireModule('kity'), requireModule('signgroup')),
    'char/conf': () => CHAR_CONF,
    'char/map': () => CHAR_MAP,
    'char/text-factory': () => createTextFactory(requireModule('kity')),
    'char/text': () =>
      createTextClass(
        requireModule('kity'),
        requireModule<{ font: unknown }>('sysconf')?.font,
        requireModule('font/manager'),
        requireModule('char/text-factory'),
        requireModule('signgroup'),
      ),
    'def/gtype': () => GTYPE,
    'def/script-type': () => SCRIPT_TYPE,
    'expression/compound-exp/binary-exp/subscript': () =>
      createSubscriptExpressionClass(requireModule('kity'), requireModule('expression/compound-exp/script')),
    'expression/compound-exp/binary-exp/superscript': () =>
      createSuperscriptExpressionClass(requireModule('kity'), requireModule('expression/compound-exp/script')),
    'expression/compound-exp/binary': () =>
      createBinaryExpressionClass(requireModule('kity'), requireModule('expression/compound')),
    'expression/compound-exp/brackets': () =>
      createBracketsExpressionClass(
        requireModule('kity'),
        requireModule('expression/compound'),
        requireModule('operator/brackets'),
      ),
    'expression/compound-exp/combination': () =>
      createCombinationExpressionClass(
        requireModule('kity'),
        requireModule<{ font: unknown }>('sysconf')?.font,
        requireModule('expression/compound'),
        requireModule('operator/combination'),
      ),
    'expression/compound-exp/fraction': () =>
      createFractionExpressionClass(
        requireModule('kity'),
        requireModule('expression/compound-exp/binary'),
        requireModule('operator/fraction'),
      ),
    'expression/compound-exp/func': () =>
      createFunctionExpressionClass(
        requireModule('kity'),
        requireModule<{ func: unknown }>('sysconf')?.func,
        requireModule('expression/compound'),
        requireModule('operator/func'),
      ),
    'expression/compound-exp/integration': () =>
      createIntegrationExpressionClass(
        requireModule('kity'),
        requireModule('expression/compound'),
        requireModule('operator/integration'),
      ),
    'expression/compound-exp/radical': () =>
      createRadicalExpressionClass(
        requireModule('kity'),
        requireModule('expression/compound-exp/binary'),
        requireModule('operator/radical'),
      ),
    'expression/compound-exp/script': () =>
      createScriptExpressionClass(
        requireModule('kity'),
        requireModule('expression/compound'),
        requireModule('operator/script'),
      ),
    'expression/compound-exp/summation': () =>
      createSummationExpressionClass(
        requireModule('kity'),
        requireModule('expression/compound'),
        requireModule('operator/summation'),
      ),
    'expression/compound': () =>
      createCompoundExpressionClass(requireModule('kity'), requireModule('def/gtype'), requireModule('expression/expression')),
    'expression/empty': () =>
      createEmptyExpressionClass(
        requireModule('kity'),
        requireModule<{ font: unknown }>('sysconf')?.font,
        requireModule('expression/expression'),
      ),
    'expression/expression': () =>
      createExpressionClass(
        requireModule('kity'),
        requireModule('def/gtype'),
        requireModule<{ font: unknown }>('sysconf')?.font,
        requireModule('signgroup'),
      ),
    'expression/text': () =>
      createTextExpressionClass(
        requireModule('kity'),
        requireModule('char/conf'),
        requireModule('expression/expression'),
        requireModule('char/text'),
      ),
    'font/checker-tpl': () => _FONT_CHECKER_TEMPLATE,
    'font/installer': () =>
      createFontInstallerClass(
        requireModule('kity'),
        requireModule('font/manager'),
        requireModule<{ font: unknown }>('sysconf')?.font,
        requireModule('font/checker-tpl'),
      ),
    'font/manager': () => createFontManager(requireModule('kity'), requireModule<{ font: { list: unknown } }>('sysconf')?.font.list),
    'font/map/kf-ams-bb': () => KF_AMS_BB_FONT_MAP,
    'font/map/kf-ams-cal': () => KF_AMS_CAL_FONT_MAP,
    'font/map/kf-ams-frak': () => KF_AMS_FRAK_FONT_MAP,
    'font/map/kf-ams-main': () => KF_AMS_MAIN_FONT_MAP,
    'font/map/kf-ams-roman': () => KF_AMS_ROMAN_FONT_MAP,
    formula: () =>
      createFormulaClass(
        requireModule('kity'),
        requireModule('def/gtype'),
        requireModule('font/manager'),
        requireModule('font/installer'),
        requireModule('fpaper'),
        requireModule('base/output'),
      ),
    fpaper: () => createFPaperClass(requireModule('kity')),
    'operator/brackets': () =>
      createBracketsOperatorClass(requireModule('kity'), requireModule('operator/operator'), requireModule('char/text')),
    'operator/combination': () => createCombinationOperatorClass(requireModule('kity'), requireModule('operator/operator')),
    'operator/common/script-controller': () =>
      createScriptControllerClass(requireModule('kity'), requireModule('expression/empty')),
    'operator/fraction': () =>
      createFractionOperatorClass(
        requireModule('kity'),
        requireModule<{ zoom: unknown }>('sysconf')?.zoom,
        requireModule('operator/operator'),
      ),
    'operator/func': () =>
      createFunctionOperatorClass(
        requireModule('kity'),
        requireModule('operator/operator'),
        requireModule('char/text'),
        requireModule('operator/common/script-controller'),
      ),
    'operator/integration': () =>
      createIntegrationOperatorClass(
        requireModule('kity'),
        requireModule('operator/operator'),
        requireModule('operator/common/script-controller'),
      ),
    'operator/operator': () =>
      createOperatorClass(requireModule('kity'), requireModule('def/gtype'), requireModule('signgroup')),
    'operator/radical': () => createRadicalOperatorClass(requireModule('kity'), requireModule('operator/operator')),
    'operator/script': () =>
      createScriptOperatorClass(
        requireModule('kity'),
        requireModule('operator/operator'),
        requireModule('operator/common/script-controller'),
      ),
    'operator/summation': () =>
      createSummationOperatorClass(
        requireModule('kity'),
        requireModule('operator/operator'),
        requireModule('operator/common/script-controller'),
      ),
    'resource-manager': () =>
      createResourceManager(
        requireModule('kity'),
        requireModule<{ resource: unknown }>('sysconf')?.resource,
        requireModule('font/installer'),
        requireModule('formula'),
      ),
    signgroup: () => createSignGroupClass(requireModule('kity'), requireModule('def/gtype')),
    sysconf: () =>
      createSysconf([
        requireModule('font/map/kf-ams-main'),
        requireModule('font/map/kf-ams-cal'),
        requireModule('font/map/kf-ams-frak'),
        requireModule('font/map/kf-ams-bb'),
        requireModule('font/map/kf-ams-roman'),
      ]),
  };

  runtimeWindow.__kityFormulaRequire__ = requireModule;
  runtimeWindow.__kityFormulaUse__ = useModule;

  kity.extendClass(kity.Shape, {
    getFixRenderBox() {
      return this.getRenderBox(this.container.container);
    },

    getTranslate() {
      return this.transform.translate;
    },
  });

  runtimeWindow.kf = {
    ...(runtimeWindow.kf ?? {}),
    ResourceManager: requireModule('resource-manager'),
    Operator: requireModule('operator/operator'),
    Expression: requireModule('expression/expression'),
    CompoundExpression: requireModule('expression/compound'),
    TextExpression: requireModule('expression/text'),
    EmptyExpression: requireModule('expression/empty'),
    CombinationExpression: requireModule('expression/compound-exp/combination'),
    FunctionExpression: requireModule('expression/compound-exp/func'),
    FractionExpression: requireModule('expression/compound-exp/fraction'),
    IntegrationExpression: requireModule('expression/compound-exp/integration'),
    RadicalExpression: requireModule('expression/compound-exp/radical'),
    ScriptExpression: requireModule('expression/compound-exp/script'),
    SuperscriptExpression: requireModule('expression/compound-exp/binary-exp/superscript'),
    SubscriptExpression: requireModule('expression/compound-exp/binary-exp/subscript'),
    SummationExpression: requireModule('expression/compound-exp/summation'),
    BracketsExpression: requireModule('expression/compound-exp/brackets'),
  };

  installed = true;
  return runtimeWindow.kf;
}

export default installLegacyKityFormulaRuntime;
