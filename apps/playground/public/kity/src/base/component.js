/*!
 * 组件抽象类，所有的组件都是该类的子类
 * @abstract
 */

import __dep_0 from '../kity.js';

function require(id) {
  switch (id) {
    case 'kity':
      return __dep_0;
    default:
      throw new Error('Unknown legacy dependency: ' + id);
  }
}

var kity = require( "kity" );

export default kity.createClass( 'Component', {

        constructor: function () {}

    } );
