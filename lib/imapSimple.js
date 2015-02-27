'use strict';
var Imap = require('imap');
var Promise = require('es6-promise').Promise;
var nodeify = require('nodeify');
var getMessage = require('./helpers/getMessage');
var errors = require('./errors');

/**
 * Constructs an instance of ImapSimple
 *
 * @param {object} imap a constructed node-imap connection
 * @constructor
 * @class ImapSimple
 */
function ImapSimple(imap) {
    this.imap = imap;
}

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
 * Connect to an Imap server, returning an ImapSimple instance, which is a wrapper over node-imap to
 * simplify it's api for common use cases.
 *
 * @param {object} options
 * @param {object} options.imap Options to pass to node-imap constructor 1:1
 * @param {number} options.connectTimeout Time in milliseconds to wait before giving up on a connection attempt
 * @param {function} [callback] Optional callback, receiving signature (err, connection)
 * @returns {undefined|Promise} Returns a promise when no callback is specified, resolving to `connection`
 */
function connect(options, callback) {
    options = options || {};

    if (callback) {
        return nodeify(connect(options), callback);
    }

    return new Promise(function (resolve, reject) {
        var timeout;
        var imap = new Imap(options.imap);

        function imapOnReady() {
            clearTimeout(timeout);
            imap.removeListener('error', imapOnError);
            resolve(new ImapSimple(imap));
        }

        function imapOnError(err) {
            clearTimeout(timeout);
            imap.removeListener('ready', imapOnReady);
            reject(err);
        }

        imap.on('ready', imapOnReady);
        imap.on('error', imapOnError);

        imap.connect();

        var timeoutAfterMs = options.connectTimeout || 2000;
        timeout = setTimeout(function () {
            imap.removeListener('ready', imapOnReady);
            imap.removeListener('error', imapOnError);
            reject(new errors.ConnectionTimeoutError(timeoutAfterMs));
        }, timeoutAfterMs);
    });
}

module.exports = {
    connect: connect,
    ImapSimple: ImapSimple,
    parseHeader: Imap.parseHeader,
    errors: errors
};
