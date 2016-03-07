'use strict';

// ** Constants
const DEFAULT_OPTIONS = {
    name: 'app',
    level: 'info',
    stream: process.stderr
};

// ** Libraries
const extend = require('extend');
const winston = require('winston');
const bunyan = require('bunyan');
const path = require('path');

// ** Global Application Log Object
const LOG = bunyan.createLogger(DEFAULT_OPTIONS);

/**
 * Creates a new logger that is a child of the main application logger.
 * @param options
 * @returns {XMLList|*}
 */
function createLogger(options) {
    return LOG.child(options);
}

// ** Module Exports
module.exports = LOG;
module.exports.createLogger = createLogger;
