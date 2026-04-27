/*!
 * 基础工具包
 */

import __dep_0 from './common.js';
import __dep_1 from './event/event.js';

function require(id) {
  switch (id) {
    case 'base/common':
      return __dep_0;
    case 'base/event/event':
      return __dep_1;
    default:
      throw new Error('Unknown legacy dependency: ' + id);
  }
}

var Utils = {},
        commonUtils = require( "base/common" );

    commonUtils.extend( Utils, commonUtils, require( "base/event/event" ) );

export default Utils;
