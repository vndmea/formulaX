import { legacyKfExtDef } from '../vendor/legacy-kf-ext-def';
import { getLegacyKf } from '../vendor/runtime-interop';
import PlaceholderExpression from './kf-ext-placeholder-expression';

type ParserWithKf = {
  getKFParser: () => {
    expand: (config: unknown) => void;
  };
};

const kf = getLegacyKf() as any;

export function installLegacyKfExtension(parser: ParserWithKf) {
  kf.PlaceholderExpression = PlaceholderExpression;

  kf.Expression.prototype.select = function select() {
    this.box.fill(legacyKfExtDef.selectColor);
  };

  kf.Expression.prototype.selectAll = function selectAll() {
    this.box.fill(legacyKfExtDef.allSelectColor);
  };

  kf.Expression.prototype.unselect = function unselect() {
    this.box.fill('transparent');
  };

  parser.getKFParser().expand({
    parse: {
      placeholder: {
        name: 'placeholder',
        handler(info: Record<string, unknown>) {
          delete info.handler;
          info.operand = [];
          return info;
        },
        sign: false,
      },
    },
    reverse: {
      placeholder() {
        return '\\placeholder ';
      },
    },
  });
}

export default {
  ext: installLegacyKfExtension,
};
