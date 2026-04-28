/**
 * Created by hn on 14-4-11.
 */

import __dep_0 from '../kity.js';
import __dep_1 from './listener.js';

function require(id) {
  switch (id) {
    case 'kity':
      return __dep_0;
    case 'control/listener':
      return __dep_1;
    default:
      throw new Error('Unknown legacy dependency: ' + id);
  }
}

var kity = require( "kity" ),

        ListenerComponent = require( "control/listener" ),

        ControllerComponent = kity.createClass( 'ControllerComponent', {

            constructor: function ( kfEditor ) {

                this.kfEditor = kfEditor;

                this.components = {};

                this.initComponents();

            },

            initComponents: function () {

                this.components.listener = new ListenerComponent( this, this.kfEditor );

            }


        } );

export default ControllerComponent;
