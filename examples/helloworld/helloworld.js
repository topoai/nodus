'use strict';

/**
 * Greet the user.
 * @param name
 */
function sayHello(name, callback) {
    callback(null, 'Hello, ' + name + '!');
}

// ** Exports
module.exports.sayhello = sayHello;