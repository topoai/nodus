'use strict';

// ** Libraries
const util = require('util');
const async = require('async');
const stack = require('callsite');
const errors = require('./errors.js');
const logger = require('./logger.js');

/**
 * Returns a function that adds an additional argument to the argument list it was passed.
 * - Useful to add optional variables that add context (i.e. Application.on())
 * @param fn - The original function
 * @param arg - The argument to add to the function
 */
function appendArgument(fn, arg) {
    return () => {
        const args = Array.prototype.slice.call(arguments);
        args.push(arg);

        fn(args);
    }
}

/**
 * Get Information about who included this module
 */
function callsite() {
    const site = stack()[2];

    return {
        function_name: site.getFunctionName() || '<anonymous>',
        filename: site.getFileName(),
        line_number: site.getLineNumber()
    };
}

/**
 * Transforms an async function, with a callback, into one that can be only run N instances simultaneously.
 * - NOTE: A function(entry) is returned with where entry is an object { args:{}, callback: function(err, result) }
 * @param fn - function(..., callback)
 * @param instances - The N max number of simultaneous executions to allow at any given time.
 */
function workers(fn, instances) {
    // instances defaults to 1 if not specified
    if (util.isNullOrUndefined(instances))
        instances = 1;

    if (instances <= 0) throw errors('ARGUMENT_ERROR', {instances: instances},
        'The "instances" argument must be an integer greater than zero.');

    // ** Create a queue
    const queue = async.queue(function (entry, next) {
        // ** Get the arguments that were used to call the worker function wrapper (returned below).
        const args = entry.args;

        // ** Check if this function has a callback
        const callback = args[args.length - 1];
        if (!util.isFunction(callback)) throw errors('ARGUMENT_ERROR', {arguments: args},
            'The functions last argument must contain a callback.');

        // ** callback -> callback -> next
        args[args.length - 1] = function () {
            callback.apply(this, arguments);
            next();
        };

        fn.apply(this, args);
    }, instances);

    // ** Return a function({args: {}, callback: function(err, result)}) that is used to call this function
    return function () {
        queue.push({args: arguments});
    }
}

module.exports.appendArgument = appendArgument;
module.exports.callsite = callsite;
module.exports.workers = workers;

