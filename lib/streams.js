'use strict';

// ** Libraries
const util = require('util');
const stream = require('stream');

function isReadableStream(obj) {
    return obj instanceof stream.Stream && typeof (obj._read === 'function') && typeof (obj._readableState === 'object');
}

function canPipe(obj) {
    return util.isFunction(obj.pipe);
}

module.exports.isReadableStream = isReadableStream;
module.exports.canPipe = canPipe;