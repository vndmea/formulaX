// @ts-nocheck
import type { LegacyParserModuleContext } from './runtime';

export function bootstrapLegacyParserRuntime(context: LegacyParserModuleContext) {
  const { _p, window } = context;

  _p[44] = {
    value: function () {
      const Parser = _p.r(43).Parser;
      _p.r(25);
      window.kf.Parser = Parser;
      window.kf.Assembly = _p.r(0);
    },
  };

  _p.r(44);
}
