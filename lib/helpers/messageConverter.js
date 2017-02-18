'use strict';

module.exports = function convertMessage(message) {
    return new Buffer(message.replace(/=([A-Fa-f0-9]{2})/g, function (m, byte) {
        return String.fromCharCode(parseInt(byte, 16));
    }), 'binary').toString('utf8');
};
