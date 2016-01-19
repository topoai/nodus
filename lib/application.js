'use strict';

// ** Libraries
const _ = require('underscore');
const EventEmitter = require('events');
const errors = require('./errors.js');
const logger = require('./logger.js');

class Application extends EventEmitter {
    constructor(name) {
        super();

        this.name = name;
        this.isLoaded = false;
        this.isStarted = false;
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
}

function SHUTDOWN(signal, action) {
    return () => {
        logger.debug('*** [%s] RECEIVED ***', signal);
        logger.debug('Shutting down...');
        action();

        process.exit();
    }
}

module.exports = name => {
    const app = new Application(name);

    // ** Create a single application instance
    process.on('SIGINT', SHUTDOWN('SIGINT', app.stop));
    process.on('SIGHUP', SHUTDOWN('SIGHUP', app.stop));
    process.on('SIGTERM', SHUTDOWN('SIGTERM', app.stop));

    return app;
};