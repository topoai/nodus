'use strict';

// ** Libraries
const errors = require('../lib').errors;

/**
 * Greet the user.
 * @param name
 */
function sayHello(name) {
    throw errors('NOT_IMPLEMENTED');
}

// ** Exports
module.exports.sayHello = sayHello;