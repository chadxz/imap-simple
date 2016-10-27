'use strict';
var util = require('util');

/**
 * Error thrown when a connection attempt has timed out
 *
 * @param {number} timeout timeout in milliseconds that the connection waited before timing out
 * @constructor
 */
function ConnectionTimeoutError(timeout) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.message = 'connection timed out';

    if (timeout) {
        this.message += '. timeout = ' + timeout + ' ms';
    }

    this.name = 'ConnectionTimeoutError';
}

util.inherits(ConnectionTimeoutError, Error);

exports.ConnectionTimeoutError = ConnectionTimeoutError;
