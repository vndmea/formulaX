/**
 * 公式扩展接口
 */

import __dep_0 from '../kf.js';
import __dep_1 from './def.js';
import __dep_2 from './expression/placeholder.js';

function require(id) {
  switch (id) {
    case 'kf':
      return __dep_0;
    case 'kf-ext/def':
      return __dep_1;
    case 'kf-ext/expression/placeholder':
      return __dep_2;
    default:
      throw new Error('Unknown legacy dependency: ' + id);
  }
}

var kf = require( "kf" ),
        SELECT_COLOR = require( "kf-ext/def" ).selectColor,
        ALL_SELECT_COLOR = require( "kf-ext/def" ).allSelectColor;

    function ext ( parser ) {

        kf.PlaceholderExpression = require( "kf-ext/expression/placeholder" );

        kf.Expression.prototype.select = function () {

            this.box.fill( SELECT_COLOR );

        };

        kf.Expression.prototype.selectAll = function () {
            this.box.fill( ALL_SELECT_COLOR );
        };

        kf.Expression.prototype.unselect = function () {

            this.box.fill( "transparent" );

        };

        // 扩展解析和逆解析
        parser.getKFParser().expand( {

            parse: {
                "placeholder": {
                    name: "placeholder",
                    handler: function ( info ) {

                        delete info.handler;
                        info.operand = [];

                        return info;

                    },
                    sign: false
                }
            },

            reverse: {

                "placeholder": function () {

                    return "\\placeholder ";

                }

            }

        } );

    }

export default {
        ext: ext
    };
