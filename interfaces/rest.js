'use strict';

// ** Constants
const INTERFACE_TYPE = 'interfaces/rest';
const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 3000;

// ** Libraries
const errors = require('../lib/errors.js');
const logger = require('../lib/logger.js');
const files = require('../lib/files.js');
const Service = require('../lib/services.js').Service;
const EventEmitter = require('eventemitter2').EventEmitter2;

class RestInterface extends Service {
    constructor(config) {
        super();

        this.type = INTERFACE_TYPE;
        this.host = config.host || DEFAULT_HOST;
        this.port = config.port || DEFAULT_PORT;

        // ** Start the HTTP Listener
        this.on('start', () => {

        });

        // ** Stop the HTTP Listener
        this.on('stop', () => {

        });
    }

    endpoint(path, handler) {
        throw errors('NOT_IMPLEMENTED');
    }
}

function createInterface(options) {
    const rest = new RestInterface(options);
    return rest;
}

module.exports = createInterface;
module.exports.createInterface = createInterface;
module.exports.RestInterface = RestInterface;