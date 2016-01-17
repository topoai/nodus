'use strict';

// ** Constants
const DEFAULT_OPTIONS = {
    console: {
        enabled: true,
        level: 'debug'
    }
};

// ** Libraries
const extend = require('extend');
const winston = require('winston');

// ** Components
class Logger extends winston.Logger {
    constructor(options) {
        super();
        const self = this;

        // ** Configure
        this.config = options;

        // ** Use CLI formatting by default
        if (self.config.console.enabled) {
            self.add(winston.transports.Console);

            // ** Use default console formatting
            self.cli();

            self.level = options.console.level;
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
