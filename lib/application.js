'use strict';

// ** Libraries
const extend = require('extend');
const util = require('util');
const EventEmitter = require('eventemitter2').EventEmitter2;
const errors = require('./errors.js');
const logger = require('./logger.js');
const functions = require('./functions.js');
const files = require('./files.js');
const measured = require('measured');

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
    static get packageInfo() {
        logger.info('REQUIRE:', 'package.json');
        return files.requireFile('package.json');
    }

    constructor() {
        super();
        const self = this;

        self.isLoaded = false;
        self.isStarted = false;

        // ** Create a single application instance
        SIGNAL('SIGINT', () => self.shutdown());
        SIGNAL('SIGHUP', () => self.shutdown());
        SIGNAL('SIGTERM', () => self.shutdown());

        // ** Application Level Statistics Container
        self.stats = measured.createCollection();

        // ** Default event handler
        self.onAny(function () {
            const event = this.event;

            // ** Log each event
            logger.debug('EVENT:', event);

            // ** Track stats for all events by default
            self.stats.meter('event:' + event).mark();
        });
    }

    get name() {
        return Application.packageInfo.name;
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
module.exports.Application = Application;