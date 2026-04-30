// @ts-nocheck
import type { LegacyParserModuleContext } from './runtime';

export function registerParserCoreModule(context: LegacyParserModuleContext) {
  const { _p } = context;

  _p[43] = {
    value: function (_require, _exports, module) {
      const CONF = {};
      const IMPL_POLL = {};

      const extend = (target, ...sources) => {
        for (const source of sources) {
          for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }

        return target;
      };

      const setData = (container, key, value) => {
        if (typeof key === 'string') {
          container[key] = value;
          return;
        }

        if (typeof key === 'object') {
          for (const currentKey in key) {
            if (Object.prototype.hasOwnProperty.call(key, currentKey)) {
              container[currentKey] = key[currentKey];
            }
          }
          return;
        }

        throw new Error('invalid option');
      };

      class ParserInterface {
        constructor() {
          this.conf = {};
        }

        set(key, value) {
          extend(this.conf, key, value);
        }

        parse() {
          throw new Error('Abstract function');
        }
      }

      class ParserProxy {
        constructor(ParserImpl) {
          this.impl = new ParserImpl();
          this.conf = {};
        }

        config(key, value) {
          setData(this.conf, key, value);
          return this;
        }

        set(key, value) {
          this.impl.set(key, value);
          return this;
        }

        parse(data) {
          const result = {
            config: {},
            tree: this.impl.parse(data),
          };

          extend(result.config, CONF, this.conf);
          return result;
        }

        serialization(tree, options) {
          return this.impl.serialization(tree, options);
        }

        expand(obj) {
          this.impl.expand(obj);
          return this;
        }
      }

      const Parser = {
        use(type) {
          if (!IMPL_POLL[type]) {
            throw new Error('unknown parser type');
          }

          return this.proxy(IMPL_POLL[type]);
        },

        config(key, value) {
          setData(CONF, key, value);
          return this;
        },

        register(type, parserImpl) {
          IMPL_POLL[type.toLowerCase()] = parserImpl;
          return this;
        },

        implement(parser) {
          const parserDefinition = { ...parser };
          const parserConstructor = parserDefinition.constructor || function () {};
          delete parserDefinition.constructor;

          class ParserImplementation extends ParserInterface {
            constructor() {
              super();
              parserConstructor.call(this);
            }
          }

          extend(ParserImplementation.prototype, parserDefinition);
          return ParserImplementation;
        },

        proxy(parserImpl) {
          return new ParserProxy(parserImpl);
        },
      };

      module.exports = {
        Parser,
        ParserInterface,
      };
    },
  };
}
