'use strict';
var Imap = require('imap');
var Promise = require('es6-promise').Promise;
var nodeify = require('nodeify');
var getMessage = require('./helpers/getMessage');
var errors = require('./errors');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var qp = require('quoted-printable');

/**
 * Constructs an instance of ImapSimple
 *
 * @param {object} imap a constructed node-imap connection
 * @constructor
 * @class ImapSimple
 */
function ImapSimple(imap) {
    var self = this;
    self.imap = imap;

    // flag to determine whether we should suppress ECONNRESET from bubbling up to listener
    self.ending = false;

    // pass most node-imap `Connection` events through 1:1
    ['alert', 'mail', 'expunge', 'uidvalidity', 'update', 'close', 'end'].forEach(function (event) {
        self.imap.on(event, self.emit.bind(self, event));
    });

    // special handling for `error` event
    self.imap.on('error', function (err) {
        // if .end() has been called and an 'ECONNRESET' error is received, don't bubble
        if (err && self.ending && (err.code === 'ECONNRESET')) {
            return;
        }

        self.emit('error', err);
    });
}

util.inherits(ImapSimple, EventEmitter);

/**
 * disconnect from the imap server
 */
ImapSimple.prototype.end = function () {
    var self = this;

    // set state flag to suppress 'ECONNRESET' errors that are triggered when .end() is called.
    // it is a known issue that has no known fix. This just temporarily ignores that error.
    // https://github.com/mscdex/node-imap/issues/391
    // https://github.com/mscdex/node-imap/issues/395
    self.ending = true;

    // using 'close' event to unbind ECONNRESET error handler, because the node-imap
    // maintainer claims it is the more reliable event between 'end' and 'close'.
    // https://github.com/mscdex/node-imap/issues/394
    self.imap.once('close', function () {
        self.ending = false;
    });

    self.imap.end();
};

/**
 * Open a mailbox
 *
 * @param {string} boxName The name of the box to open
 * @param {function} [callback] Optional callback, receiving signature (err, boxName)
 * @returns {undefined|Promise} Returns a promise when no callback is specified, resolving to `boxName`
 * @memberof ImapSimple
 */
ImapSimple.prototype.openBox = function (boxName, callback) {
    var self = this;

    if (callback) {
        return nodeify(this.openBox(boxName), callback);
    }

    return new Promise(function (resolve, reject) {

        self.imap.openBox(boxName, function (err, result) {

            if (err) {
                reject(err);
                return;
            }

            resolve(result);
        });
    });
};

/**
 * Search an open box, and retrieve the results
 *
 * Results are in the form:
 *
 * [{
 *   attributes: object,
 *   parts: [ { which: string, size: number, body: string }, ... ]
 * }, ...]
 *
 * See node-imap's ImapMessage signature for information about `attributes`, `which`, `size`, and `body`.
 * For any message part that is a `HEADER`, the body is automatically parsed into an object.
 *
 * @param {object} searchCriteria Criteria to use to search. Passed to node-imap's .search() 1:1
 * @param {object} fetchOptions Criteria to use to fetch the search results. Passed to node-imap's .fetch() 1:1
 * @param {function} [callback] Optional callback, receiving signature (err, results)
 * @returns {undefined|Promise} Returns a promise when no callback is specified, resolving to `results`
 * @memberof ImapSimple
 */
ImapSimple.prototype.search = function (searchCriteria, fetchOptions, callback) {
    var self = this;

    if (!callback && typeof(fetchOptions) === 'function') {
        callback = fetchOptions;
        fetchOptions = null;
    }

    if (callback) {
        return nodeify(this.search(searchCriteria), callback);
    }

    return new Promise(function (resolve, reject) {

        self.imap.search(searchCriteria, function (err, uids) {

            if (err) {
                reject(err);
                return;
            }

            if (!uids.length) {
                resolve([]);
                return;
            }

            var fetch = self.imap.fetch(uids, fetchOptions);
            var messagesRetrieved = 0;
            var messages = [];

            function fetchOnMessage(message, seqNo) {
                getMessage(message).then(function (message) {
                    messages[seqNo] = message;

                    messagesRetrieved++;
                    if (messagesRetrieved === uids.length) {
                        fetchCompleted();
                    }
                });
            }

            function fetchCompleted() {
                // pare array down while keeping messages in order
                var pared = messages.filter(function (m) { return !!m; });
                resolve(pared);
            }

            function fetchOnError(err) {
                fetch.removeListener('message', fetchOnMessage);
                fetch.removeListener('end', fetchOnEnd);
                reject(err);
            }

            function fetchOnEnd() {
                fetch.removeListener('message', fetchOnMessage);
                fetch.removeListener('error', fetchOnError);
            }

            fetch.on('message', fetchOnMessage);
            fetch.once('error', fetchOnError);
            fetch.once('end', fetchOnEnd);
        });
    });
};

/**
 * Download a "part" (either the message body, or an attachment)
 */
ImapSimple.prototype.getPartData = function(message, part) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var fetch = self.imap.fetch(message.attributes.uid, {bodies: [part.partID], struct: true});
        function fetchOnMessage(msg, seqNo) {
            getMessage(msg).then(function(result) {
                if (result.parts.length != 1)
                    reject(Error('Got ' + result.parts.length + ' parts, should get 1'));
                var data = result.parts[0].body;

                if (part.encoding === 'BASE64')
                    var decoded = new Buffer(data, 'base64');
                else if (part.encoding === 'QUOTED-PRINTABLE')
                    var decoded = new Buffer(qp.decode(data));
                else if (part.encoding === '7BIT')
                    var decoded = new Buffer(data); // that's fine
                else
                    reject(Error('Unknown encoding ' + part.encoding));

                resolve(decoded);
	    });
	}

        function fetchOnError(err) {
            fetch.removeListener('message', fetchOnMessage);
            fetch.removeListener('end', fetchOnEnd);
            reject(err);
        }

        function fetchOnEnd() {
            fetch.removeListener('message', fetchOnMessage);
            fetch.removeListener('error', fetchOnError);
        }


        fetch.once('message', fetchOnMessage);
        fetch.once('error', fetchOnError);
        fetch.once('end', fetchOnEnd);
    });
}

/**
 * Connect to an Imap server, returning an ImapSimple instance, which is a wrapper over node-imap to
 * simplify it's api for common use cases.
 *
 * @param {object} options
 * @param {object} options.imap Options to pass to node-imap constructor 1:1
 * @param {function} [callback] Optional callback, receiving signature (err, connection)
 * @returns {undefined|Promise} Returns a promise when no callback is specified, resolving to `connection`
 */
function connect(options, callback) {
    options = options || {};
    options.imap = options.imap || {};

    // support old connectTimeout config option. Remove in v2.0.0
    if (options.hasOwnProperty('connectTimeout')) {
        console.warn('[imap-simple] connect: options.connectTimeout is deprecated. ' +
                     'Please use options.imap.authTimeout instead.');
        options.imap.authTimeout = options.connectTimeout;
    }

    // set default authTimeout
    options.imap.authTimeout = options.imap.hasOwnProperty('authTimeout') ? options.imap.authTimeout : 2000;

    if (callback) {
        return nodeify(connect(options), callback);
    }

    return new Promise(function (resolve, reject) {
        var timeout;
        var imap = new Imap(options.imap);

        function imapOnReady() {
            imap.removeListener('error', imapOnError);
            resolve(new ImapSimple(imap));
        }

        function imapOnError(err) {
            if (err.source === 'timeout-auth') {
                err = new errors.ConnectionTimeoutError(options.imap.authTimeout);
            }

            imap.removeListener('ready', imapOnReady);
            reject(err);
        }

        imap.once('ready', imapOnReady);
        imap.once('error', imapOnError);
        imap.connect();
    });
}

/**
 * Returns a list of the parts.
 * A part is either a message or an attachment.
 * Parts are usually nested and numbered things like 1, 1.1, 1.2, ...
 * Code taken from http://stackoverflow.com/questions/25247207/how-to-read-and-save-attachments-using-node-imap
 */
function getParts(struct, parts) {
    parts = parts ||  [];
    for (var i = 0; i < struct.length; i++) {
        if (Array.isArray(struct[i])) {
	    getParts(struct[i], parts);
	} else if (struct[i].partID) {
	    parts.push(struct[i]);
	}
    }
    return parts;
}

module.exports = {
    connect: connect,
    ImapSimple: ImapSimple,
    parseHeader: Imap.parseHeader,
    getParts: getParts,
    errors: errors
};
