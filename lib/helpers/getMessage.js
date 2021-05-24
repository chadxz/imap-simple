const Imap = require('imap');

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
  return new Promise((resolve) => {
    let attributes;
    const messageParts = [];
    const isHeader = /^HEADER/g;

    function messageOnBody(stream, info) {
      let body = '';

      function streamOnData(chunk) {
        body += chunk.toString('utf8');
      }

      stream.on('data', streamOnData);

      stream.once('end', () => {
        stream.removeListener('data', streamOnData);

        const part = {
          which: info.which,
          size: info.size,
          body,
        };

        if (isHeader.test(part.which)) {
          part.body = Imap.parseHeader(part.body);
        }

        messageParts.push(part);
      });
    }

    function messageOnAttributes(attrs) {
      attributes = attrs;
    }

    function messageOnEnd() {
      message.removeListener('body', messageOnBody);
      message.removeListener('attributes', messageOnAttributes);
      resolve({
        attributes,
        parts: messageParts,
      });
    }

    message.on('body', messageOnBody);
    message.once('attributes', messageOnAttributes);
    message.once('end', messageOnEnd);
  });
};
