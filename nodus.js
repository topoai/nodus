#!/usr/bin/env node
'use strict';

// ** Libraries
const REPL = require('repl');
const services = require('./lib').services;
const errors = require('./lib').errors;

/**
 * Start the nodus REPL
 */
function startREPL() {
    const repl = REPL.start('nodus> ');

    // ** Add a function to load an application using a JSON definition file.
    repl.context.load = filepath => {
        throw errors('NOT_IMPLEMENTED');
    };

    return repl;
}

startREPL();