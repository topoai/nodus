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
const EventEmitter = require('eventemitter2').EventEmitter2;

/**
 * Container for an Application forked as a child process.
 */
class Service extends EventEmitter {
    constructor(options) {
        super();
        this.options = options || {};

        this.isStarted = false;
    }

    start() {
        logger.info('DEFINITION:', this.options.definition);
        const definition = files.requireFile(this.options.definition);

        logger.info('PROVIDER:', this.options.provider);
        const provider = this.options.provider;

        // ** Create a child process
        const child = childprocess.fork(provider);
        child.on('message', msg => {
            const type = msg.type.toLowerCase();
            const subject = msg.subject;
            const data = msg.data;

            switch (type) {
                case 'event':
                    this.emit(subject, data);
                    break;
                default:
                    logger.warn(errors('MESSAGE_NOT_SUPPORTED', {msg: msg}, 'The message type is not supported.'));
            }
        });

        child.send({
            type: 'request',
            subject: 'start'
        });
    }

    stop() {
        this.child.kill('SIGTERM');
    }

    send(msg) {
        logger.info('SEND:', msg);
        this.child.send(msg);
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

        this.on('start', () => this.startServices());
        this.on('stop', () => this.stopServices());
    }

    addService(name, options) {
        if (this.services.hasOwnProperty(name))
            throw errors('SERVICE_DEFINED', {name: name}, 'The specified service is already defined.');

        const service = new Service(options);
        this.services[name] = service;
    }

    addInterface(name, options) {
        throw errors('NOT_IMPLEMENTED');
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
            service.start();
        });
    }
}

function createServer(options) {
    if (util.isString(options)) {
        options = files.requireFile(options);
    }

    const server = new Server(options);
    return server;
}

module.exports = createServer;
module.exports.createServer = createServer;
module.exports.Server = Server;