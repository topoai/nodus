'use strict';

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

module.exports.appendArgument = appendArgument;