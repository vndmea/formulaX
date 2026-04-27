/**
 * 占位符操作符
 */

import __dep_0 from '../../kity.js';
import __dep_1 from '../../sysconf.js';
import __dep_2 from '../def.js';
import __dep_3 from '../../kf.js';

function require(id) {
  switch (id) {
    case 'kity':
      return __dep_0;
    case 'sysconf':
      return __dep_1;
    case 'kf-ext/def':
      return __dep_2;
    case 'kf':
      return __dep_3;
    default:
      throw new Error('Unknown legacy dependency: ' + id);
  }
}

var kity = require( "kity" ),
        BaseOperator = require( "kf" ).Operator,
        FILL_COLOR = require( "sysconf" ).rootPlaceholder.color,
        SELECT_COLOR = require( "kf-ext/def" ).selectColor,
        ALL_SELECT_COLOR = require( "kf-ext/def" ).allSelectColor;

function generateOpShape ( operator, label ) {

        if ( label !== null ) {
            return createRootPlaceholder( operator, label );
        } else {
            return createCommonShape( operator );
        }


    }

    // 创建通用图形
    function createCommonShape ( operator ) {

        var w = 35,
            h = 50,
            shape = null;

        shape =  new kity.Rect( w, h, 0, 0 ).stroke( "black" ).fill( "transparent" );
        shape.setAttr( "stroke-dasharray", "5, 5" );

        operator.addOperatorShape( shape );

        return shape;

    }

    // 创建根占位符图形
    function createRootPlaceholder ( operator, label ) {

        var textShape = new kity.Text( label ).fill( FILL_COLOR ),
            shapeGroup = new kity.Group(),
            padding = 20,
            radius = 7,
            borderBoxShape = new kity.Rect( 0, 0, 0, 0, radius ).stroke( FILL_COLOR ).fill( "transparent" ),
            textBox = null;

        textShape.setFontSize( 40 );
        shapeGroup.addShape( borderBoxShape );
        shapeGroup.addShape( textShape );
        operator.addOperatorShape( shapeGroup );

        textBox = textShape.getFixRenderBox();

        // 宽度要加上padding
        borderBoxShape.stroke( FILL_COLOR ).fill( "transparent" );
        borderBoxShape.setSize( textBox.width + padding * 2, textBox.height + padding * 2 );
        borderBoxShape.setRadius( radius );
        borderBoxShape.setAttr( "stroke-dasharray", "5, 5" );

        textShape.setAttr( {
            dx: 0-textBox.x,
            dy: 0-textBox.y
        } );

        textShape.translate( padding, padding );

        // 对于根占位符， 返回的不是组， 而是组容器内部的虚线框。 以方便选中变色
        return borderBoxShape;

    }

export default kity.createClass( 'PlaceholderOperator', {

        base: BaseOperator,

        constructor: function () {

            this.opShape = null;
            /* this.callBase( "Placeholder" ); */
            BaseOperator.call( this, "Placeholder" );

        },

        applyOperand: function () {

            this.opShape = generateOpShape( this, this.parentExpression.getLabel() );
            this.parentExpression.expand( 20, 20 );
            this.parentExpression.translateElement( 10, 10 );

        },

        select: function () {

            this.opShape.fill( SELECT_COLOR );

        },

        selectAll: function () {

            this.opShape.fill( ALL_SELECT_COLOR );

        },

        unselect: function () {

            this.opShape.fill( "transparent" );

        }

    } );
