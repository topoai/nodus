'use strict';

// ** Libraries
const request = require('request');
const logger = require('./logger.js');
const errors = require('./errors.js');

/**
 * Helper function to make http requests
 * @param req
 * @param callback
 */
function http_request(req, callback) {
    logger.debug('REQUEST:', JSON.stringify(req));
    request(req, (err, response, body) => {
        if (err) return callback(errors('REQUEST_ERROR', {response: response, body: body}, err));

        logger.debug('RESPONSE:', JSON.stringify(response, null, 2));
        logger.debug('BODY:', body);

        // ** Make sure the API returns a HTTP:STATUS_CODE:200
        if (response.statusCode !== 200)
            return callback(errors('INVALID_STATUS_CODE', {
                response: response,
                body: body
            }, 'Invalid status code was returned from the API.'));

        callback(null, body);
    });
}

module.export = http_request;
module.export.request = module.export.http_request = http_request;