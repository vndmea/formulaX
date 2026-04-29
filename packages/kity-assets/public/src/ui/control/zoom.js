/*!
 * 滚动缩放控制器
 */

import __dep_0 from '../../base/utils.js';
import __dep_1 from '../../kity.js';

function require(id) {
  switch (id) {
    case 'base/utils':
      return __dep_0;
    case 'kity':
      return __dep_1;
    default:
      throw new Error('Unknown legacy dependency: ' + id);
  }
}

var Utils = require( "base/utils" ),
        kity = require( "kity"),

        DEFAULT_OPTIONS = {
            min: 1,
            max: 2
        },

        ScrollZoomController = kity.createClass( 'ScrollZoomController', {

            constructor: function ( parentComponent, kfEditor, target, options ) {

                this.kfEditor = kfEditor;
                this.target = target;

                this.zoom = 1;
                this.step = 0.05;

                this.options = Utils.extend( {}, DEFAULT_OPTIONS, options );

                this.initEvent();

            },

            initEvent: function () {

                var kfEditor = this.kfEditor,
                    _self = this,
                    min = this.options.min,
                    max = this.options.max,
                    step = this.step;

                Utils.addEvent( this.target, 'mousewheel', function ( e ) {

                    e.preventDefault();

                    if ( e.wheelDelta  < 0 ) {
                        // 缩小
                        _self.zoom -= _self.zoom * step;
                    } else {
                        // 放大
                        _self.zoom += _self.zoom * step;
                    }

                    _self.zoom = Math.max( _self.zoom, min );
                    _self.zoom = Math.min( _self.zoom, max );

                    kfEditor.requestService( "render.set.canvas.zoom", _self.zoom );

                } );

            }

        } );

export default ScrollZoomController;
