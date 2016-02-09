#!/usr/bin/env node
'use strict';

// ** Libraries
const REPL = require('repl');
const errors = require('./lib').errors;

/**
 * Start the nodus REPL
 */
function startREPL() {
    const repl = REPL.start('nodus> ');

    // ** Load an application.
    repl.context.load = name => {
        throw errors('NOT_IMPLEMENTED');
    };

    return repl;
}

startREPL();