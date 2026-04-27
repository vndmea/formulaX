/*!
 * event模块
 */

/* jshint camelcase: false */

import __dep_0 from './kfevent.js';
import __dep_1 from '../common.js';

function require(id) {
  switch (id) {
    case 'base/event/kfevent':
      return __dep_0;
    case 'base/common':
      return __dep_1;
    default:
      throw new Error('Unknown legacy dependency: ' + id);
  }
}

var EVENT_LISTENER = {},
        eid = 0,
        BEFORE_RESULT = true,
        KFEvent = require( "base/event/kfevent" ),
        commonUtils = require( "base/common" ),
        EVENT_HANDLER = function ( e ) {

            var type = e.type,
                target = e.target,
                eid = this.__kfe_eid,
                hasAutoTrigger = /^(?:before|after)/.test( type ),
                HANDLER_LIST = EVENT_LISTENER[ eid ][ type ];

            if ( !hasAutoTrigger ) {

                EventListener.trigger( target, 'before' + type );

                if ( BEFORE_RESULT === false ) {
                    BEFORE_RESULT = true;
                    return false;
                }

            }

            commonUtils.each( HANDLER_LIST, function ( handler, index ) {

                if ( !handler ) {
                    return;
                }

                if ( handler.call( target, e ) === false ) {
                    BEFORE_RESULT = false;
                    return BEFORE_RESULT;
                }

            } );

            if ( !hasAutoTrigger ) {

                EventListener.trigger( target, 'after' + type );

            }

        };

    var EventListener = {

        addEvent: function ( target, type, handler ) {

            var hasHandler = true,
                eventCache = null;

            if ( !target.__kfe_eid ) {
                hasHandler = false;
                target.__kfe_eid = generateId();
                EVENT_LISTENER[ target.__kfe_eid ] = {};
            }

            eventCache = EVENT_LISTENER[ target.__kfe_eid ];

            if ( !eventCache[ type ] ) {
                hasHandler = false;
                eventCache[ type ] = [];
            }

            eventCache[ type ].push( handler );

            if ( hasHandler ) {
                return;
            }

            target.addEventListener( type, EVENT_HANDLER, false );

        },

        trigger: function ( target, type, e ) {

            e = e || KFEvent.createEvent( type, e );

            target.dispatchEvent( e );

        }

    };

    function generateId () {

        return ++eid;

    }

export default EventListener;
