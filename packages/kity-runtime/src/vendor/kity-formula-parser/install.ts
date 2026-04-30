// @ts-nocheck
import { registerAssemblyModule } from './assembly';
import { bootstrapLegacyParserRuntime } from './bootstrap';
import { registerLatexParserModules } from './latex-parser';
import { registerLatexSupportModules } from './latex-support';
import { registerParserCoreModule } from './parser-core';
import { createLegacyParserModuleRegistry } from './runtime';

type ParserRuntimeWindow = Window &
  typeof globalThis & {
    kf?: Record<string, unknown> & {
      Parser?: unknown;
      Assembly?: unknown;
    };
  };

let installed = false;

export function installLegacyParserRuntime(target: ParserRuntimeWindow = window) {
  if (installed && target.kf?.Parser && target.kf?.Assembly) {
    return target.kf;
  }

  target.kf = target.kf ?? {};

  const context = {
    _p: createLegacyParserModuleRegistry(),
    window: target,
  };

  registerAssemblyModule(context);
  registerLatexSupportModules(context);
  registerLatexParserModules(context);
  registerParserCoreModule(context);
  bootstrapLegacyParserRuntime(context);

  installed = true;
  return target.kf;
}

export default installLegacyParserRuntime;
