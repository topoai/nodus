'use strict';

// ** Libraries
const _ = require('underscore');
const extend = require('extend');
const util = require('util');
const EventEmitter = require('eventemitter2').EventEmitter2;
const Service = require('./services.js').Service;
const errors = require('./errors.js');
const logger = require('./logger.js');
const functions = require('./functions.js');
const files = require('./files.js');

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

class Application extends Service {

    constructor() {
        super();
        const self = this;

        // ** Create a single application instance
        SIGNAL('SIGINT', () => self.shutdown());
        SIGNAL('SIGHUP', () => self.shutdown());
        SIGNAL('SIGTERM', () => self.shutdown());

        // ** Check if this is running as a child process...
        if (process.send) {
            self.onAny(function (data) {
                const event = this.event;

                process.send({
                    type: 'event',
                    subject: event,
                    data: data
                });
            })
        }

        process.on('message', msg => {
            logger.info('RECEIVED:', msg);

            const id = msg.id;
            const subject = msg.subject.toLowerCase();
            const data = msg.data;

            /**
             * IPC: Send a response back to the parent.
             * @param err
             * @param data
             * @constructor
             */
            function SEND_RESPONSE(err, data) {
                const message = {
                    request: 'response/' + id
                };

                if (err) message.errors = [err];
                if (data) message.data = data;

                logger.info('SEND:', message);
                process.send(message);
            }

            switch (subject) {
                case 'start':
                    self.start();
                    break;
                case 'stop':
                    self.stop();
                    break;
                case 'run':
                    const command = data.command;
                    const args = data.args;

                    // ** Run the command and passback the result
                    self.run(command, args, SEND_RESPONSE);
                    break;
            }
        })
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