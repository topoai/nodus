'use strict';

// ** Constants
const INTERFACE_TYPE = 'interfaces/rest';
const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 3000;
const DEFAULT_BASE_PATH = '/';

// ** Libraries
const restify = require('restify');
const errors = require('../errors.js');
const logger = require('../logger.js');
const files = require('../files.js');
const Service = require('../services.js').Service;
const EventEmitter = require('eventemitter2').EventEmitter2;

class RestInterface extends Service {
    constructor(config) {
        super();
        const self = this;

        self.type = INTERFACE_TYPE;
        self.host = config.host || DEFAULT_HOST;
        self.port = config.port || DEFAULT_PORT;
        self.basePath - config.basePath || DEFAULT_BASE_PATH;

        self.server = restify.createServer({
            name: self.basePath
        });

        // ** Start the HTTP Listener
        self.on('start', () => {
            logger.info('REST: Starting Http Listener...');
            self.server.listen(self.port, self.host);
        });

        // ** Stop the HTTP Listener
        self.on('stop', () => {
            logger.info('REST: Stopping Http Listener...');
            self.server.close();
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