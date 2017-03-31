'use strict';
var Imap = require('imap');
var iconvlite = require('iconv-lite');
var getEncoding = require('./encoding');


var isHeader = /^HEADER/g;

/**
 * Given an 'ImapMessage' from the node-imap library,
 * retrieves the message formatted as:
 *
 * {
 *   attributes: object,
 *   parts: [ { which: string, size: number, body: string }, ... ]
 * }
 *
 * @param {object} message an ImapMessage from the node-imap library
 * @returns {Promise} a promise resolving to `message` with schema as described above
 */
module.exports = function getMessage(message) {
    return new Promise(function (resolve) {
        var attributes;
        var messageParts = [];

        function messageOnBody(stream, info) {
            var bodyParts = [];

            function streamOnData(chunk) {
                bodyParts.push(chunk);
            }

            stream.on('data', streamOnData);

            stream.once('end', function streamOnEnd() {
                stream.removeListener('data', streamOnData);

                var part = {
                    which: info.which,
                    size: info.size,
                    bodyParts: bodyParts
                };

                messageParts.push(part);
            });
        }

        function messageOnAttributes(attrs) {
            attributes = attrs;
        }

        function messageOnEnd() {
            message.removeListener('body', messageOnBody);
            message.removeListener('attributes', messageOnAttributes);

            var encoding = getEncodingFromMessageParts(messageParts);

            resolve({
                attributes: attributes,
                parts: messageParts
                    .map(function (part) {
                        if (isHeader.test(part.which)) {
                            part.body = Imap.parseHeader(convertArrayToString(part.bodyParts, 'utf8'));
                        }
                        else {
                            part.body = convertArrayToString(part.bodyParts, encoding);
                        }

                        delete part.bodyParts;
                        return part;
                    })
                    .sort(function (part) {
                        return isHeader.test(part.which) ? -1 : 1
                    })
            });
        }

        message.on('body', messageOnBody);
        message.once('attributes', messageOnAttributes);
        message.once('end', messageOnEnd);
    });
};

function getEncodingFromMessageParts(messageParts) {
    var header = messageParts.find(function (part) {
        return isHeader.test(part.which);
    });

    if (header) {
        var body = Imap.parseHeader(convertArrayToString(header.bodyParts, 'utf8'));
        return getEncoding(body);
    }

    return 'utf8';
}

function convertArrayToString(parts, encoding) {
    var encodedParts = parts.map(function (part) {
        return iconvlite.decode(part, encoding || 'utf8');
    });
    return encodedParts.join('');
}
