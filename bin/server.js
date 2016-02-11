#!/usr/bin/env node
'use strict';

const DEFAULT_CONFIG_FILE = 'server.json';

// ** Libraries
const _ = require('underscore');
const server = require('../lib').server;
const errors = require('../lib').errors;
const logger = require('../lib').logger;
const files = require('../lib').files;

/**
 * Load the server definition file.
 */
function load(filename) {
    const config = files.requireFile(filename || DEFAULT_CONFIG_FILE);

    // ** Load all interfaces
    // const interfaces = config.interfaces;
    const svr = server(config);

    // ** Load all services
    const services = config.services;
    _.forEach(services, (options, name) => {
        logger.info('ADD_SERVICE:', name, options);
        svr.addService(name, options);
    });

    // ** Load all interfaces
    _.forEach(config.interfaces, (options, name) => {
        logger.info('ADD_INTERFACE:', name, options);
        svr.addInterface(name, options);
    });

    return svr;
}

load('server.json')
    .start();