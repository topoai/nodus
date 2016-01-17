'use strict';

// ** Libraries
const _ = require('underscore');
const errors = require('./errors.js');
const logger = require('./logger.js');
const Service = require('./services.js').Service;

class Application extends Service {
    constructor(name) {
        super(name);

        this.services = {};

        // ** Load each service when this app loads
        this.on('load', app => {
            _.each(this.services, service => {
                logger.debug('Loading service:', service.name);
                service.load();
            });
        });

        // ** Unload each service when this app unloads
        this.on('unload', app => {
            _.each(this.services, service => {
                logger.debug('Unloading service:', service.name);
                service.unload();
            });
        })

        // ** Start all services when the app starts
        this.on('start', app => {
            _.each(this.services, service => {
                logger.debug('Starting service:', service.name);
                service.start();
            });
        });

        // ** Stop all services when this app stops
        this.on('stop', app => {
            _.each(this.services, service => {
                logger.debug('Stopping service:', service.name);
                service.stop();
            })
        });
    }

    config(property) {
        throw errors('NOT_IMPLEMENTED');
    }

    /**
     * Create or access a service by its name
     * @param name
     * @returns {*}
     */
    service(name) {
        if (this.services[name])
            return this.services[name];

        // ** Create new service
        const service = new Service(name);
        this.services[name] = service;

        // ** Forward service errors as application errors
        service.on('error', err => {
            this.emit('error', errors('SERVICE_ERROR', {service: name}, err));
        });

        return service;
    }
}

module.exports = name => {
    const app = new Application(name);
    return app;
};

module.exports.Application = Application;