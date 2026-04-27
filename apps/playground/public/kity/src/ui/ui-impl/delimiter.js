/*!
 * 分割符
 */

import __dep_0 from '../../kity.js';
import __dep_1 from './ui-utils.js';

function require(id) {
  switch (id) {
    case 'kity':
      return __dep_0;
    case 'ui/ui-impl/ui-utils':
      return __dep_1;
    default:
      throw new Error('Unknown legacy dependency: ' + id);
  }
}

var kity = require( "kity" ),

        PREFIX = "kf-editor-ui-",

        // UiUitls
        $$ = require( "ui/ui-impl/ui-utils" ),

        Delimiter = kity.createClass( "Delimiter", {

            constructor: function ( doc ) {

                this.doc = doc;
                this.element = this.createDilimiter();

            },

            setToolbar: function ( toolbar ) {
            // do nothing
            },

            createDilimiter: function () {

                var dilimiterNode = $$.ele( this.doc, "div", {
                    className: PREFIX + "delimiter"
                } );

                dilimiterNode.appendChild( $$.ele( this.doc, "div", {
                    className: PREFIX + "delimiter-line"
                } ) );

                return dilimiterNode;

            },

            attachTo: function ( container ) {

                container.appendChild( this.element );

            }

        });

export default Delimiter;
