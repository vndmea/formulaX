/**
 * 占位符表达式， 扩展KF自有的Empty表达式
 */

import __dep_0 from '../../kity.js';
import __dep_1 from '../../kf.js';
import __dep_2 from '../operator/placeholder.js';

function require(id) {
  switch (id) {
    case 'kity':
      return __dep_0;
    case 'kf':
      return __dep_1;
    case 'kf-ext/operator/placeholder':
      return __dep_2;
    default:
      throw new Error('Unknown legacy dependency: ' + id);
  }
}

var kity = require( "kity" ) ,

        kf = require( "kf" ),
        BaseCompoundExpression = kf.CompoundExpression,

        PlaceholderOperator = require( "kf-ext/operator/placeholder" );

export default kity.createClass( 'PlaceholderExpression', {

        base: kf.CompoundExpression,

        constructor: function () {

            /* this.callBase(); */
            BaseCompoundExpression.call( this );

            this.setFlag( "Placeholder" );

            this.label = null;

            this.box.setAttr( "data-type", null );
            this.setOperator( new PlaceholderOperator() );

        },

        setLabel: function ( label ) {
            this.label = label;
        },

        getLabel: function () {
            return this.label;
        },

        // 重载占位符的setAttr， 以处理根占位符节点
        setAttr: function ( key, val ) {

            if ( key === "label" ) {
                this.setLabel( val );
            } else {

                if ( key.label ) {
                    this.setLabel( key.label );
                    // 删除label
                    delete key.label;
                }
                // 继续设置其他属性
                BaseCompoundExpression.prototype.setAttr.call( this, key, val );

            }

        },

        select: function () {

            this.getOperator().select();

        },

        selectAll: function () {

            this.getOperator().selectAll();

        },

        unselect: function () {
            this.getOperator().unselect();
        }

    } );
