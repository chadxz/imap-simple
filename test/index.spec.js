'use strict';

describe("imap-simple", function () {
    this.timeout(20000);

    var imaps = require("../");

    it("works", function () {
        var config = {
            imap: {
                user: 'FILL THIS IN',
                password: 'FILL THIS IN',
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
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

                    console.log(subjects);
                });
            });
        });
    });
});
