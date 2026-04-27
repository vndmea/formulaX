/**
 * Created by hn on 14-3-17.
 */



export default {

        createEvent: function ( type, e ) {

            var evt = document.createEvent( 'Event' );

            evt.initEvent( type, true, true );

            return evt;

        }

    };
