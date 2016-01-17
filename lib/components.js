'use strict';

// ** Libraries
const EventEmitter = require('events');
const errors = require('./errors.js');

class Component extends EventEmitter {
    constructor() {
        super();

        this.isLoaded = false;

        this.configuration = {};
    }

    config(name) {
        return;
    }

    load() {
        // ** Check if we are already loaded
        if (this.isLoaded)
            throw errors('ALREADY_LOADED');

        this.emit('load', this);

        this.isLoaded = true;
        this.emit('loaded', this);
    }

    unload() {
        if (this.isLoaded === false)
            throw errors('NOT_LOADED');

        this.emit('unload', this);

        this.isLoaded = false;
        this.emit('unloaded', this);
    }
}

module.exports.Component = Component;