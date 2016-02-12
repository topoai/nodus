'use strict';

// ** Libraries
const _ = require('underscore');
const measured = require('measured');
const errors = require('./errors');
const logger = require('./logger');
const functions = require('./functions.js');
const EventEmitter = require('eventemitter2').EventEmitter2;

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

class Service extends EventEmitter {
    constructor() {
        super();
        const self = this;

        self.isStarted = false;

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
            return callback(errors('COMMAND_NOT_FOUND', {command: name}));

        command.run(args, callback);
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
}

module.exports.Command = Command;
module.exports.Service = Service;