#!/usr/bin/env node
'use strict';

// ** Libraries
const _ = require('underscore');
const util = require('util');
const yargs = require('yargs');
const logger = require('../lib').logger;
const errors = require('../lib').errors;
const application = require('../lib').application;
const streams = require('../lib').streams;
const files = require('../lib').files;

function load_definition(app_name) {
    return files.requireFile(app_name + '.app.json');
}
function load_app(app_name) {
    return files.requireFile(app_name + '.app.js');
}

/**
 * Parse the command line arguments
 * @param callback
 */
function parse_cli_args(callback) {
    yargs
        .usage('Usage: <app> [command] [args...] [options]')
        .demand(1)  // ** Only demand one argument
        .alias('l', 'loglevel')
        .describe('loglevel', 'Change the output level to (debug|info|warn|error).')
        .boolean('newline')
        .describe('newline', 'Include a newline character for all outputs.')
        //.boolean('json')
        //.describe('json', 'Parse input as JSON.')
        //.default('json', true)
        .describe('version', 'Display the application version information.')
        .alias('h', 'help')
        .wrap(yargs.terminalWidth());

    // ** Parse the command line
    const argv = yargs.argv;
    logger.debug('ARGV:', argv);

    // ** set the default log level
    if (argv.loglevel)
        logger.level(argv.loglevel);

    // ** Add all the commands supported by this application
    const app_name = argv._.shift();
    const command = argv._.shift();
    const args = {};
    const app_def = load_definition(app_name);

    // ** Display version information
    if (argv.version) {
        console.log(app_def.version);
        process.exit();
    }

    const commands = app_def.commands;
    _.forEach(commands, (command, name) => yargs.command(name, command.description));

    // ** Display help
    if (argv.help || _.isEmpty(command)) {
        yargs.showHelp();
        process.exit();
    }

    // ** Convert arguments to name=value pairs to object
    for (let lcv = 0; lcv < argv._.length; lcv++) {
        const split = argv._[lcv].split('=');
        const name = split[0];

        const value = argv._[lcv].replace(name + '=', '');

        // logger.debug('ARG:%s=%s', name, value);
        args[name] = value;
    }

    // ** Load the application files
    const app = load_app(app_name);

    return {
        app: app,
        command: command,
        args: args,
        newline: argv.newline === true || false,
        json: argv.json === true || false
    };
}

// ** Load application
const options = parse_cli_args();
const app = options.app;
const command = options.command;
const args = options.args;

/**
 * Display a result.
 * @param result
 * @param done
 */
function RESULT(result, done) {
    const stringify = function(data) {

        if (data instanceof Buffer) {
            logger.debug('BUFFER!');
            return data.toString();
        }

        return options.newline === true
            ? JSON.stringify(data, null, 2)
            : JSON.stringify(data);
    };

    if (streams.isReadableStream(result)) {
        logger.debug('STREAM RESULT!');
        const stream = result
            .pipe(es.mapSync(stringify));

        stream.on('data', console.log);
        stream.on('error', done);
        stream.on('end', done);
    } else {
        // ** If RESULT IS UNDEFINED, IGNORE IT
        if (typeof result === 'undefined')
            console.log();
        else
            console.log(stringify(result));

        done();
    }
}

/**
 * Exit the application
 * @param err
 * @constructor
 */
function EXIT(err) {
    if (err) console.log(util.inspect(err));

    application.shutdown();
}

// ** Run the application
application
    .on('start', () => {
        // ** Run the application command provided
        application.run(command, args, (err, result) => {
            if (err) return EXIT(err);

            RESULT(result, EXIT);
        });
    })
    .on('shutdown', () => {
        process.exit();
    })
    .start();
