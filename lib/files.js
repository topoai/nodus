'use strict';

// ** Libraries
const path = require('path');
const fs = require('fs');
const errors = require('./errors.js');

/**
 * Require a file by relative path.
 * @param filepath
 */
function requireFile(filename) {
    // ** Determine the file path using CWD or Absolute path
    if (!path.isAbsolute(filename)) {
        const cwd = process.cwd();
        filename = path.resolve(cwd, filename);
    }

    // ** Ensure the file exists
    if (!fs.existsSync(filename))
        throw errors('FILE_NOT_FOUND', {file: filename});

    // ** Load the JSON file
    const file = require(filename);
    return file;
}

module.exports.requireFile = requireFile;