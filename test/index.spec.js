const { expect } = require('chai');
const { startTestServer, appendMessage } = require('./imapTestServer');
const imaps = require('../index'); // .default;

let serverInstance = null;

beforeEach(() => startTestServer()
  .then((server) => {
    serverInstance = server;
  })
  .catch((error) => {
    console.error(error);
  }));

afterEach(() => {
  serverInstance.close();
});

const config = {
  imap: {
    user: 'testuser',
    password: 'testpass',
    host: 'localhost',
    port: 1143,
    tls: false,
    authTimeout: 3000,
  },
};

describe('imap-simple', function () {
  this.timeout(20000);

  it('lists unseen emails only', () => imaps.connect(config).then((connection) => connection.openBox('INBOX')
    .then(() => appendMessage(connection, 'jim@example.com', 'unseen 1'))
    .then(() => appendMessage(connection, 'john@example.com', 'seen 2', '\\Seen'))
    .then(() => appendMessage(connection, 'james@example.com', 'unseen 3'))
    .then(() => {
      const searchCriteria = [
        'UNSEEN',
      ];

      const fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        markSeen: false,
      };

      return connection
        .search(searchCriteria, fetchOptions)
        .then((results) => {
          const subjects = results.map((res) => res.parts.filter((part) => part.which === 'HEADER')[0].body.subject[0]);

          expect(subjects).to.eql([
            'unseen 1',
            'unseen 3',
          ]);
          console.log(subjects);
        });
    })));

  it('deletes messages', () => imaps.connect(config).then((connection) => connection.openBox('INBOX')
    .then(() => appendMessage(connection, 'jim@example.com', 'hello from jim'))
    .then(() => appendMessage(connection, 'bob@example.com', 'hello from bob'))
    .then(() => appendMessage(connection, 'bob@example.com', 'hello again from bob'))
    .then(() => connection.search(['ALL'], { bodies: ['HEADER'] }))
    .then((messages) => {
      const uidsToDelete = messages
        .filter((message) => message.parts.filter((part) => part.which === 'HEADER')[0].body.to[0] === 'bob@example.com')
        .map((message) => message.attributes.uid);

      return connection.deleteMessage(uidsToDelete);
    })
    .then(() => connection.search(['ALL'], { bodies: ['HEADER'] }))
    .then((messages) => {
      const subjects = messages.map((res) => res.parts.filter((part) => part.which === 'HEADER')[0].body.subject[0]);

      expect(subjects).to.eql([
        'hello from jim',
      ]);
      console.log(subjects);
    })));
});
