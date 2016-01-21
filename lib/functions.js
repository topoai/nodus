'use strict';

// ** Libraries
const stack = require('callsite');

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
    const site = stack()[0];

    return {
        function_name: site.getFunctionName() || '<anonymous>',
        file_name: site.getFileName(),
        line_number: site.getLineNumber()
    };
}


module.exports.appendArgument = appendArgument;
module.exports.callsite = callsite;

