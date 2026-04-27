/**
 * Created by hn on 14-4-11.
 */

import __dep_0 from '../kity.js';
import __dep_1 from './location.js';
import __dep_2 from './input.js';
import __dep_3 from './selection.js';

function require(id) {
  switch (id) {
    case 'kity':
      return __dep_0;
    case 'control/location':
      return __dep_1;
    case 'control/input':
      return __dep_2;
    case 'control/selection':
      return __dep_3;
    default:
      throw new Error('Unknown legacy dependency: ' + id);
  }
}

var kity = require( "kity" ),

        // 光标定位
        LocationComponent = require( "control/location" ),

        // 输入控制组件
        InputComponent = require( "control/input" ),

        // 选区
        SelectionComponent = require( "control/selection" );

export default kity.createClass( "MoveComponent", {

        constructor: function ( parentComponent, kfEditor ) {

            this.parentComponent = parentComponent;
            this.kfEditor = kfEditor;

            this.components = {};

            this.initComponents();

        },

        initComponents: function () {

            this.components.location= new LocationComponent( this, this.kfEditor );
            this.components.selection = new SelectionComponent( this, this.kfEditor );
            this.components.input = new InputComponent( this, this.kfEditor );

        }

    } );
