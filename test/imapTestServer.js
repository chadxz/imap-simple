'use strict';

var hoodiecrow = require("hoodiecrow-imap");

function startTestServer(port=1143, debug=false) {
    var server = hoodiecrow({
        plugins: ["ID", "STARTTLS" /*, "LOGINDISABLED"*/ , "SASL-IR", "AUTH-PLAIN", "NAMESPACE", "IDLE", "ENABLE", "CONDSTORE", "XTOYBIRD", "LITERALPLUS", "UNSELECT", "SPECIAL-USE", "CREATE-SPECIAL-USE"],
        id: {
            name: "hoodiecrow",
            version: "0.1"
        },

        storage: {
            INBOX: {}
        },
        debug: debug
    });

    return new Promise(function (resolve, reject) {
        server.listen(port, function () {
            resolve(server);
        });
    });
}

function appendMessage(connection, to, subject, flags = '') {
    var message = `Content-Type: text/plain
To: ${to}
Subject: ${subject}

This is a test message`;
    connection.append(message, { mailbox: 'INBOX', flags: flags });
}

module.exports = { startTestServer, appendMessage };
