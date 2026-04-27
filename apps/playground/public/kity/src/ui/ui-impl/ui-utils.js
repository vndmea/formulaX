/**
 * Created by hn on 14-4-1.
 */

define( function ( require ) {

    var kity = require( "kity" ),
        TOPIC_POOL = {};

    function normalizeEvent ( event ) {

        var wrappedEvent = Object.create( event ),
            button = typeof event.which === "number" && event.which > 0 ? event.which : 0,
            wheelDelta = typeof event.wheelDelta === "number" ? event.wheelDelta : 0;

        if ( !button ) {
            switch ( event.button ) {
                case 0:
                    button = 1;
                    break;
                case 1:
                    button = 2;
                    break;
                case 2:
                    button = 3;
                    break;
            }
        }

        if ( !wheelDelta && typeof event.deltaY === "number" ) {
            wheelDelta = -event.deltaY * 40;
        }

        wrappedEvent.originalEvent = event;
        wrappedEvent.which = button;
        wrappedEvent.wheelDelta = wheelDelta;

        return wrappedEvent;

    }

    var Utils = {

        ele: function ( doc, name, options ) {

            var node = null;

            if ( name === "text" ) {
                return doc.createTextNode( options );
            }

            node =  doc.createElement( name );
            options.className && ( node.className = options.className );

            if ( options.content ) {
                node.innerHTML = options.content;
            }
            return node;
        },

        getRectBox: function ( node ) {
            return node.getBoundingClientRect();
        },

        on: function ( target, type, fn ) {
            target && target.addEventListener( type, function ( event ) {
                fn.call( target, normalizeEvent( event ) );
            } );
            return this;
        },

        delegate: function ( target, selector, type, fn ) {

            target && target.addEventListener( type, function ( event ) {
                var current = event.target;

                while ( current && current !== target ) {
                    if ( current.matches && current.matches( selector ) ) {
                        fn.call( current, normalizeEvent( event ) );
                        return;
                    }
                    current = current.parentElement;
                }
            } );
            return this;

        },

        publish: function ( topic, args ) {

            var callbackList = TOPIC_POOL[ topic ];

            if ( !callbackList ) {
                return;
            }

            args = [].slice.call( arguments, 1 );

            kity.Utils.each( callbackList, function ( callback ) {

                callback.apply( null, args );

            } );

        },

        subscribe: function ( topic, callback ) {

            if ( !TOPIC_POOL[ topic ] ) {

                TOPIC_POOL[ topic ] = [];

            }

            TOPIC_POOL[ topic ].push( callback );

        },

        getClassList: function ( node ) {

            return node.classList || new ClassList( node );

        }

    };


    //注意： 仅保证兼容IE9以上
    function ClassList ( node ) {

        this.node = node;
        this.classes = node.className.replace( /^\s+|\s+$/g, '' ).split( /\s+/ );

    }

    ClassList.prototype = {

        constructor: ClassList,

        contains: function ( className ) {

            return this.classes.indexOf( className ) !== -1;

        },

        add: function ( className ) {

            if ( this.classes.indexOf( className ) == -1 ) {
                this.classes.push( className );
            }

            this._update();

            return this;

        },

        remove: function ( className ) {

            var index = this.classes.indexOf( className );

            if ( index !== -1 ) {
                this.classes.splice( index, 1 );
                this._update();
            }

            return this;
        },

        toggle: function ( className ) {

            var method = this.contains( className ) ? 'remove' : 'add';

            return this[ method ]( className );

        },

        _update: function () {

            this.node.className = this.classes.join( " " );

        }

    };

    return Utils;

} );
