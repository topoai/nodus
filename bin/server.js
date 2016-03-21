#!/usr/bin/env node
'use strict';

const DEFAULT_CONFIG_FILE = './server';

// ** Libraries
const _ = require('underscore');
const yargs = require('yargs');
const server = require('../lib').server;
const errors = require('../lib').errors;
const logger = require('../lib').logger;
const files = require('../lib').files;

function parseCommandLineArgs() {
    yargs
        .usage('Usage: <app> [command] [args...] [options]')
        .alias('l', 'loglevel')
        .describe('loglevel', 'Change the output level to (debug|info|warn|error).')
        .describe('version', 'Display the application version information.')
        .alias('h', 'help')
        .wrap(yargs.terminalWidth());

    // ** Parse the command line
    const argv = yargs.argv;
    logger.debug('ARGV:', argv);

    // ** set the default log level
    if (argv.loglevel)
        logger.level(argv.loglevel);

    // ** Display version information
    if (argv.version) {
        console.log(app_def.version);
        process.exit();
    }

    // ** Display help
    if (argv.help) {
        yargs.showHelp();
        process.exit();
    }

    return argv;
}

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
        svr.loadService(name, options);
    });

    // ** Load all interfaces
    _.forEach(config.interfaces, (options, name) => {
        logger.info('ADD_INTERFACE:', name, options);
        svr.addInterface(name, options);
    });

    return svr;
}

// ** Parse the Command Line Args
parseCommandLineArgs();

// ** Load the application and then start it.
load().start();