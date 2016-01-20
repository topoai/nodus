'use strict';

// ** Libraries
const _ = require('underscore');
const EventEmitter = require('events');
const errors = require('./errors.js');
const logger = require('./logger.js');
const functions = require('./functions.js');

/**
 * Helper to handle a process SIGNAL event sent by the system.
 * @param signal
 * @param handler
 * @constructor
 */
function SIGNAL(signal, handler) {
    process.on(signal, () => {
        logger.debug('*** [%s] RECEIVED ***', signal);

        handler();
    });
}

class Application extends EventEmitter {
    constructor() {
        super();

        this.isLoaded = false;
        this.isStarted = false;

        // ** Create a single application instance
        SIGNAL('SIGINT', () => this.shutdown());
        SIGNAL('SIGHUP', () => this.shutdown());
        SIGNAL('SIGTERM', () => this.shutdown());
    }

    config(property) {
        throw errors('NOT_IMPLEMENTED');
    }

    start() {
        this.emit('start', this);

        this.isStarted = true;
        this.emit('started', this);
    }

    stop() {
        this.emit('stop', this);

        this.isStarted = false;
        this.emit('stopped', this);
    }

    shutdown(done) {
        logger.debug('Shutting down...');

        // ** Stop the application
        try {
            this.stop();
        } catch (err) {
            if (util.isFunction(done)) done(err);
            else throw errors('SHUTDOWN_ERROR', err);
        }

        // ** Fire done callback if provided
        if (util.isFunction(done)) done();

        // ** Exit the application
        process.exit();
    }
}

module.exports = new Application();