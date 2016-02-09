'use strict';

// ** Libraries
const _ = require('underscore');
const extend = require('extend');
const util = require('util');
const EventEmitter = require('eventemitter2').EventEmitter2;
const errors = require('./errors.js');
const logger = require('./logger.js');
const functions = require('./functions.js');
const files = require('./files.js');
const measured = require('measured');

/**
 * Helper to handle a process SIGNAL event sent by the system.
 * @param signal
 * @param handler
 * @constructor
 */
function SIGNAL(signal, handler) {
    process.on(signal, () => {
        logger.debug('*** [%s] RECEIVED ***', signal);

        handler();
    });
}

class Command extends EventEmitter {
    constructor(name, options, handler) {
        super();

        this.name = name;
        this.options = options || {};
        this.handler = functions.namedArgsWrapper(handler);
    }

    run(args, callback) {

        // ** Validate Parameters
        const parameters = this.options.parameters || {};
        _.forEach(parameters, parameter => {
            const name = parameter.name;

            // ** Check required parameters
            if (parameter.required && util.isNullOrUndefined(args[name]))
                throw errors('REQUIRED_ARGUMENT', {argument: name});
        });

        this.handler(args, callback);
    }
}

class Application extends EventEmitter {

    constructor() {
        super();
        const self = this;

        self.isLoaded = false;
        self.isStarted = false;

        // ** Create a single application instance
        SIGNAL('SIGINT', () => self.shutdown());
        SIGNAL('SIGHUP', () => self.shutdown());
        SIGNAL('SIGTERM', () => self.shutdown());

        // ** Application Level Statistics Container
        self.stats = measured.createCollection();

        // ** Commands
        self.commands = {};

        // ** Default event handler
        self.onAny(function () {
            const event = this.event;

            // ** Log each event
            logger.debug('EVENT:', event);

            // ** Track stats for all events by default
            self.stats.meter('event:' + event).mark();
        });
    }

    command(name, handler) {
        if (this.commands.hasOwnProperty(name))
            throw errors('COMMAND_ALREADY_DEFINED', {command: name});

        // ** Create a command and register it on the list of available commands
        const command = new Command(name, {}, handler);
        this.commands[name] = command;

        return this;
    }

    run(name, args, callback) {
        // function(name, callback) -> function(name, {}, callback)
        if (arguments.length === 2)
            return this.run(name, {}, args);

        const command = this.commands[name];
        if (!command)
            throw errors('COMMAND_NOT_FOUND', {command: name});

        command.run(args, callback);
    }

    error(err) {
        this.emit('error', err);
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

    shutdown(done) {
        logger.debug('Shutting down...');

        // ** Stop the application
        try {
            this.stop();
        } catch (err) {
            if (util.isFunction(done)) done(err);
            else throw errors('SHUTDOWN_ERROR', err);
        }

        // ** Fire done callback if provided
        if (util.isFunction(done)) done();

        // ** Exit the application
        process.exit();
    }
}

module.exports = new Application();
module.exports.Application = Application;
module.exports.Command = Command;