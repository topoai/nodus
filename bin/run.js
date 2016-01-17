#!/usr/bin/env node

// ** Libraries
const yargs = require('yargs');
const application = require('../lib/applications.js');
const errors = require('../lib/errors.js');

yargs
    .usage('Usage: $0 <cmd> [args...] [options]')
    .demand(1)
    .help('help')
    .alias('h', 'help')
    .wrap(yargs.terminalWidth());

