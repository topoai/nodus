'use strict';

// ** Libraries
const _ = require('underscore');
const extend = require('extend');
const util = require('util');
const childprocess = require('child_process');
const files = require('./files.js');
const errors = require('./errors.js');
const logger = require('./logger.js');
const Application = require('./application.js').Application;
const Service = require('./services.js').Service;
const EventEmitter = require('eventemitter2').EventEmitter2;
const interfaces = require('./interfaces');
const shortid = require('shortid');

/**
 * Container for an Application forked as a child process.
 */
class ServiceHost extends Service {
    constructor(options) {
        options = options || {};

        super();
        const self = this;

        this.options = options;
    }

    start() {
        const self = this;
        const options = self.options;

        logger.info('DEFINITION:', options.definition);
        const definition = files.requireFile(options.definition);
        this.definition = definition;

        logger.info('PROVIDER:', options.provider);
        const provider = options.provider;
        this.provider = provider;

        // ** Create a child process
        const child = childprocess.fork(provider, null, {
            silent: true
        });
        this.child = child;
        this.requests = {};

        // ** Kill the child process
        self.on('stop', () => {
            logger.info('STOP CHILD:', this.child.pid);
            this.child.kill('SIGTERM')
        });

        // ** Receive messages SENT from the child process
        child.on('message', msg => {
            logger.info('RECEIVE:', msg);

            const type = msg.type.toLowerCase();
            const subject = msg.subject;
            const error = msg.error;
            const data = msg.data;

            switch (type) {
                case 'response':
                    const id = msg.id;
                    const handler = this.requests[id];

                    if (!handler)
                        throw errors('NO_HANDLER');

                    // ** Send the response
                    handler(error, data);
                    delete this.requests[id];
                    break;
                case 'event':
                    self.emit(subject, data);
                    break;
                default:
                    logger.warn(errors('MESSAGE_NOT_SUPPORTED', {msg: msg}, 'The message type is not supported.'));
            }
        });

        // ** Send message to START the child application.
        this.child.send({
            type: 'request',
            subject: 'start'
        });

        super.start();
    }

    sendRequest(subject, data, callback) {
        const id = shortid.generate();

        // ** Register response handler
        this.requests[id] = callback;

        // ** Issue command to the application
        this.child.send({
            type: 'request',
            subject: subject,
            id: id,
            data: data
        });
    }

    run(command, args, callback) {
        // function(command, callback) -> function(command, null, callback)
        if (arguments.length === 2 && util.isFunction(args))
            return this.run(command, null, args);

        this.sendRequest('run', {command: command, args: args}, callback);
    }
}

/**
 * Application Hosting Service
 */
class Server extends Application {
    constructor(options) {
        super(options);

        this.options = options || {};
        this.services = {};
        this.interfaces = {};

        this.on('start', () => {
            this.startServices();
            this.startInterfaces();
        });

        this.on('stop', () => {
            this.stopServices();
            this.stopInterfaces();
        });
    }

    addService(name, options) {
        if (this.services.hasOwnProperty(name))
            throw errors('SERVICE_DEFINED', {name: name}, 'The specified service is already defined.');

        const service = new ServiceHost(options);
        this.services[name] = service;
    }

    addInterface(name, options) {
        const type = options.type;

        // ** Load the provider for this interface
        const provider = interfaces[type];
        if (!provider)
            throw errors('INTERFACE_TYPE_UNKNOWN', {type: type});

        const instance = provider.createInterface(options);
        this.interfaces[name] = instance;
    }

    startServices() {
        logger.info('Starting services...');
        const services = this.services;
        _.forEach(services, (service, name) => {
            logger.info('START_SERVICE:', name);
            service.start();

            service.on('started', () => {
                logger.info('SERVICE:', name, '[STARTED]');
            });
        });
    }

    stopServices() {
        logger.info('Stopping services...');
        const services = this.services;
        _.forEach(services, (service, name) => {
            logger.info('STOP_SERVICE:', name);
            service.stop();

            inter.on('stopped', () => {
                logger.info('SERVER:', name, '[STOPPED]');
            });
        });
    }

    startInterfaces() {
        logger.info('Starting interfaces...');
        const interfaces = this.interfaces;
        _.forEach(interfaces, (inter, name) => {

            // ** Map Services
            _.forEach(this.services, (service, name) => {
                inter.mapService(name, service);
            });

            logger.info('START: INTERFACE:', name);
            inter.start();

            inter.on('started', () => {
                logger.info('INTERFACE:', name, '[STARTED]');
            });
        });
    }

    stopInterfaces() {
        logger.info('Stopping interfaces...');
        const interfaces = this.interfaces;
        _.forEach(interfaces, (inter, name) => {
            logger.info('STOP: INTERFACE:', name);
            inter.start();

            inter.on('stopped', () => {
                logger.info('INTERFACE:', name, '[STOPPED]');
            });
        });
    }
}

function createServer(options) {
    if (util.isString(options)) {
        options = files.requireFile(options);
    }

    const server = new Server(options);
    return api;
}

module.exports = createServer;
module.exports.createServer = createServer;
module.exports.Server = Server;