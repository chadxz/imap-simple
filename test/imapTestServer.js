const hoodiecrow = require('hoodiecrow-imap');

function startTestServer(port = 1143, debug = false) {
  const server = hoodiecrow({
    plugins: ['ID', 'STARTTLS' /* , "LOGINDISABLED" */, 'SASL-IR', 'AUTH-PLAIN', 'NAMESPACE', 'IDLE', 'ENABLE', 'CONDSTORE', 'XTOYBIRD', 'LITERALPLUS', 'UNSELECT', 'SPECIAL-USE', 'CREATE-SPECIAL-USE'],
    id: {
      name: 'hoodiecrow',
      version: '0.1',
    },

    storage: {
      INBOX: {},
    },
    debug,
  });

  return new Promise((resolve, reject) => {
    try {
      server.listen(port, () => {
        resolve(server);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function appendMessage(connection, to, subject, flags = '') {
  const message = `Content-Type: text/plain
To: ${to}
Subject: ${subject}

This is a test message`;
  connection.append(message, { mailbox: 'INBOX', flags });
}

module.exports = { startTestServer, appendMessage };
