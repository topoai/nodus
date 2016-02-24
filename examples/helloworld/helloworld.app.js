'use strict';

// ** Libraries
const application = require('../../lib').application;

// ** Provider
const sayhello = require('./helloworld.js').sayhello;

// ** Commands
application.command('sayhello', sayhello);