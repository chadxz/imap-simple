'use strict';
var { startTestServer,appendMessage } = require('./imapTestServer');
var expect = require('chai').expect;

var serverInstance = null;
beforeEach(function () {
    return startTestServer()
        .then(function (server) {
            serverInstance = server;
        });
});
afterEach(function () {
    serverInstance.close();
});

var config = {
    imap: {
        user: 'testuser',
        password: 'testpass',
        host: 'localhost',
        port: 1143,
        tls: false,
        authTimeout: 3000
    }
};

describe('imap-simple', function () {
    this.timeout(20000);

    var imaps = require('../');

    it('lists unseen emails only', function () {

        return imaps.connect(config).then(function (connection) {

            return connection.openBox('INBOX')
                .then(function () {return appendMessage(connection, 'jim@example.com', 'unseen 1');})
                .then(function () {return appendMessage(connection, 'john@example.com', 'seen 2', '\\Seen');})
                .then(function () {return appendMessage(connection, 'james@example.com', 'unseen 3');})
                .then(function () {
                    var searchCriteria = [
                        'UNSEEN'
                    ];

                    var fetchOptions = {
                        bodies: ['HEADER', 'TEXT'],
                        markSeen: false
                    };

                    return connection
                        .search(searchCriteria, fetchOptions)
                        .then(function (results) {
                            var subjects = results.map(function (res) {
                                return res.parts.filter(function (part) {
                                    return part.which === 'HEADER';
                                })[0].body.subject[0];
                            });

                            expect(subjects).to.eql([
                                'unseen 1',
                                'unseen 3'
                            ]);
                            console.log(subjects);
                        });
                });
        });

    });
});

