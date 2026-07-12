import { kityExtensionStyle } from '../../kity-compat/extension-style';
import { getKityFormulaRuntime } from '../../kity-compat/runtime-context';
import PlaceholderExpression from './placeholder-expression';

type ParserWithKf = {
  getKFParser: () => {
    expand: (config: unknown) => void;
  };
};

const kf = getKityFormulaRuntime() as any;

export function installKityFormulaExtension(parser: ParserWithKf) {
  kf.PlaceholderExpression = PlaceholderExpression;

  kf.Expression.prototype.select = function select() {
    this.box.fill(kityExtensionStyle.selectColor);
  };

  kf.Expression.prototype.selectAll = function selectAll() {
    this.box.fill(kityExtensionStyle.allSelectColor);
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
  ext: installKityFormulaExtension,
};
