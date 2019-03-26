'use strict';

var hoodiecrow = require("hoodiecrow-imap")
var server = hoodiecrow({
    plugins: ["ID", "STARTTLS" /*, "LOGINDISABLED"*/ , "SASL-IR", "AUTH-PLAIN", "NAMESPACE", "IDLE", "ENABLE", "CONDSTORE", "XTOYBIRD", "LITERALPLUS", "UNSELECT", "SPECIAL-USE", "CREATE-SPECIAL-USE"],
    id: {
        name: "hoodiecrow",
        version: "0.1"
    },

    storage: {
        "INBOX": {
            messages: [{
                raw: "Subject: hello 1\r\n\r\nWorld 1!",
                internaldate: "14-Sep-2013 21:22:28 -0300"
            }, {
                raw: "Subject: hello 2\r\n\r\nWorld 2!",
                flags: ["\\Seen"]
            }, {
                raw: "Subject: hello 3\r\n\r\nWorld 3!"
            }, {
                raw: "From: sender name <sender@example.com>\r\n" +
                    "To: Receiver name <receiver@example.com>\r\n" +
                    "Subject: hello 4\r\n" +
                    "Message-Id: <abcde>\r\n" +
                    "Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n" +
                    "\r\n" +
                    "World 4!"
            }, {
                raw: "Subject: hello 5\r\n\r\nWorld 5!"
            }, {
                raw: "Subject: hello 6\r\n\r\nWorld 6!"
            }]
        },
        "": {
            "separator": "/",
            "folders": {
                "[Gmail]": {
                    "flags": ["\\Noselect"],
                    "folders": {
                        "All Mail": {
                            "special-use": "\\All"
                        },
                        "Drafts": {
                            "special-use": "\\Drafts"
                        },
                        "Important": {
                            "special-use": "\\Important"
                        },
                        "Sent Mail": {
                            "special-use": "\\Sent"
                        },
                        "Spam": {
                            "special-use": "\\Junk"
                        },
                        "Starred": {
                            "special-use": "\\Flagged"
                        },
                        "Trash": {
                            "special-use": "\\Trash"
                        }
                    }
                }
            }
        }
    },
    debug: false
});

function start(){
    return new Promise(function (resolve, reject) {
        server.listen(1143, function () {
            resolve(server);
        });
    });
}


module.exports = start
