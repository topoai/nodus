'use strict';

// ** Constants
const DEFAULT_OPTIONS = {
    console: {
        enabled: true,
        level: 'info'
    },
    fluentd: {
        host: 'fluentd',
        port: 24224
    }
};

// ** Libraries
const extend = require('extend');
const winston = require('winston');
const path = require('path');
const fluentlogger = require('fluent-logger');

class FluentTransport extends winston.Transport {
    constructor(options) {
        super(options);
        options = extend(true, {}, DEFAULT_OPTIONS.fluentd, options);

        if (!options.tag)
            throw errors('ARGUMENT_ERROR', 'FluentTransport options requires "tag" property.');

        if (!options.label)
            throw errors('ARGUMENT_ERROR', 'FluentTransport options requires "label" property');

        // Set transport name
        this.name = 'fluent';

        this.tag = options.tag;
        this.label = options.label;
        this.options = options;

        console.log(options);

        this.sender = fluentlogger.createFluentSender(this.tag, this.options);
    }

    log(level, message, meta, callback) {

        console.log(arguments);
        const self = this;

        if (typeof meta !== 'object' && meta != null) {
            meta = {meta: meta};
        }

        // ** Create data object to contain all meta data passed to this message
        const data = extend(true, {level: level.toUpperCase(), message: message}, meta);
        self.sender.emit(self.label, data, err => {
            if (err) return self.emit('error', err);
            if (self.sender._sendQueue.length === 0) return self.emit('logged');
        });

        callback(null, true);
    }
}

// ** Components
class Logger extends winston.Logger {
    constructor(options) {
        super();
        const self = this;

        // ** Configure
        this.config = options;

        // ** Use CLI formatting by default
        if (self.config.console.enabled) {
            self.add(winston.transports.Console, {
                level: options.console.level,
                prettyPrint: true,
                colorize: true,
                silent: false,
                timestamp: true
            });
        }
    }
}

function createLogger(options) {
    const config = extend(true, {}, DEFAULT_OPTIONS, options);
    return new Logger(config);
}

// ** Module Exports
let logger = createLogger();
module.exports = logger;
module.exports.FluentTransport = FluentTransport;
module.exports.createLogger = createLogger;
module.exports.setLogLevel = (level) => {

    const options = {
        console: {
            level: level
        }
    };

    extend(true, DEFAULT_OPTIONS, options);

    logger.level = level;
};
