/**
 * Created by hn on 14-3-31.
 */

import __dep_0 from './drapdown-box.js';
import __dep_1 from './delimiter.js';
import __dep_2 from './area.js';

function require(id) {
  switch (id) {
    case 'ui/ui-impl/drapdown-box':
      return __dep_0;
    case 'ui/ui-impl/delimiter':
      return __dep_1;
    case 'ui/ui-impl/area':
      return __dep_2;
    default:
      throw new Error('Unknown legacy dependency: ' + id);
  }
}



export default {

        DrapdownBox: require( "ui/ui-impl/drapdown-box" ),
        Delimiter: require( "ui/ui-impl/delimiter" ),
        Area: require( "ui/ui-impl/area" )

    };
