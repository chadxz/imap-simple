'use strict';
var Imap = require('imap');
var iconvlite = require('iconv-lite');
var getEncoding = require('./encoding');

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
        var isHeader = /^HEADER/g;

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

            var header = messageParts.find(function (part) {
                return isHeader.test(part.which);
            });

            var encoding;

            if (header) {
                header.body = Imap.parseHeader(convertArrayToString(header.bodyParts, 'utf8'));
                encoding = getEncoding(header.body);
            }

            resolve({
                attributes: attributes,
                parts: messageParts.map(function (part) {
                    if (!isHeader.test(part.which)) {
                        part.body = convertArrayToString(part.bodyParts, encoding);
                    }

                    delete part.bodyParts;
                    return part;
                })
            });
        }

        message.on('body', messageOnBody);
        message.once('attributes', messageOnAttributes);
        message.once('end', messageOnEnd);
    });
};

function convertArrayToString(parts, encoding) {
    var encodedParts = parts.map(function (part) {
        return iconvlite.decode(part, encoding || 'utf8');
    });
    return encodedParts.join('');
}
