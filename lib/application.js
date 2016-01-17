'use strict';

// ** Libraries
const _ = require('underscore');
const EventEmitter = require('events');
const errors = require('./errors.js');
const logger = require('./logger.js');

class Application extends EventEmitter {
    constructor() {
        super();

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

module.exports = new Application();