'use strict';
var imapServer = require('./testserver');
var expect = require('chai').expect

var serverInstance = null;
beforeEach(function () {
    return imapServer().then(function (server) {
        serverInstance = server;
    });
});
afterEach(function () {
    serverInstance.close();
});

describe('imap-simple', function () {
    this.timeout(20000);

    var imaps = require('../');

    it('lists emails', function () {
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

        return imaps.connect(config).then(function (connection) {

            return connection.openBox('INBOX').then(function () {
                var searchCriteria = [
                    'UNSEEN'
                ];

                var fetchOptions = {
                    bodies: ['HEADER', 'TEXT'],
                    markSeen: false
                };

                return connection.search(searchCriteria, fetchOptions).then(function (results) {
                    var subjects = results.map(function (res) {
                        return res.parts.filter(function (part) {
                            return part.which === 'HEADER';
                        })[0].body.subject[0];
                    });

                    expect(subjects).to.eql([
                        "hello 1",
                        "hello 3",
                        "hello 4",
                        "hello 5",
                        "hello 6"
                    ])
                    console.log(subjects);
                });
            });
        });

    });
});

