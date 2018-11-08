# imap-simple

A library providing a simpler interface for common use cases of [node-imap][], a robust imap client for node.js.

**Warning**: This library is missing a great deal of functionality from node-imap. If you have functionality you would
like to see, we're accepting pull requests!

### Examples

#### Retrieve the subject lines of all unread email

```js
var imaps = require('imap-simple');

var config = {
    imap: {
        user: 'your@email.address',
        password: 'yourpassword',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000
    }
};

imaps.connect(config).then(function (connection) {

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
            // =>
            //   [ 'Hey Chad, long time no see!',
            //     'Your amazon.com monthly statement',
            //     'Hacker Newsletter Issue #445' ]
        });
    });
});
```

#### Download all attachments from all unread email since yesterday

```js
var imaps = require('imap-simple');

var config = {
    imap: {
        user: 'your@email.address',
        password: 'yourpassword',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000
    }
};

imaps.connect(config).then(function (connection) {

    connection.openBox('INBOX').then(function () {

        // Fetch emails from the last 24h
        var delay = 24 * 3600 * 1000;
        var yesterday = new Date();
        yesterday.setTime(Date.now() - delay);
        yesterday = yesterday.toISOString();
        var searchCriteria = ['UNSEEN', ['SINCE', yesterday]];
        var fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true };

        // retrieve only the headers of the messages
        return connection.search(searchCriteria, fetchOptions);
    }).then(function (messages) {

        var attachments = [];

        messages.forEach(function (message) {
            var parts = imaps.getParts(message.attributes.struct);
            attachments = attachments.concat(parts.filter(function (part) {
                return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
            }).map(function (part) {
                // retrieve the attachments only of the messages with attachments
                return connection.getPartData(message, part)
                    .then(function (partData) {
                        return {
                            filename: part.disposition.params.filename,
                            data: partData
                        };
                    });
            }));
        });

        return Promise.all(attachments);
    }).then(function (attachments) {
        console.log(attachments);
        // =>
        //    [ { filename: 'cats.jpg', data: Buffer() },
        //      { filename: 'pay-stub.pdf', data: Buffer() } ]
    });
});
```

### Append a message to your drafts folder

```js
var imaps = require('imap-simple');

var config = {
    imap: {
        user: 'your@email.address',
        password: 'yourpassword',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000
    }
};

imaps.connect(config).then(function (connection) {
  const message = `Content-Type: text/plain
To: jhannes@gmail.com
Subject: Hello world

Hi
This is a test message
`;
  connection.append(message.toString(), {mailbox: 'Drafts', flags: '\\Draft'});
});
```

## API

### Exported module
- **connect**(<*object*> options, [<*function*> callback]) - *Promise* - Main entry point. Connect to an Imap server.
Upon successfully connecting to the Imap server, either calls the provided callback with signature `(err, connection)`,
or resolves the returned promise with `connection`, where `connection` is an instance of *ImapSimple*. If the connection
times out, either the callback will be called with the `err` property set to an instance of *ConnectionTimeoutError*, or
the returned promise will be rejected with the same. Valid `options` properties are:

    - **imap**: Options to pass to node-imap constructor 1:1
    - **connectTimeout**: Time in milliseconds to wait before giving up on a connection attempt. *(Deprecated: please
    use `options.imap.authTimeout` instead)*

- **errors.ConnectionTimeoutError**(<*number*> timeout) - *ConnectionTimeoutError* - Error thrown when a connection
attempt has timed out.

- **getParts**(<*Array*> struct) - *Array* - Given the `message.attributes.struct`, retrieve a flattened array of `parts`
objects that describe the structure of the different parts of the message's body. Useful for getting a simple list to
iterate for the purposes of, for example, finding all attachments.

- **ImapSimple**(<*object*> imap) - *ImapSimple* - constructor for creating an instance of ImapSimple. Mostly used for
testing.

### ImapSimple class

- **addFlags**(<*mixed*> uid, <*string*> flag, [<*function*> callback]) - *Promise* - Adds the provided
flag(s) to the specified message(s). `uid` is the *uid* of the message you want to add the flag to or an array of
*uids*. `flag` is either a string or array of strings indicating the flags to add. When completed, either calls
the provided callback with signature `(err)`, or resolves the returned promise.

- **addMessageLabel**(<*mixed*> source, <*mixed*> label, [<*function*> callback]) - *Promise* - Adds the provided
label(s) to the specified message(s). `source` corresponds to a node-imap *MessageSource* which specifies the messages
to be moved. `label` is either a string or array of strings indicating the labels to add. When completed, either calls
the provided callback with signature `(err)`, or resolves the returned promise.

- **append**(<*mixed*> message, [<*object*> options], [<*function*> callback]) - *Promise* - Appends the argument
message to the currently open mailbox or another mailbox. `message` is a RFC-822 compatible MIME message. Valid `options`
are *mailbox*, *flags* and *date*. When completed, either calls the provided callback with signature `(err)`, or resolves
the returned promise.

- **delFlags**(<*mixed*> uid, <*string*> flag, [<*function*> callback]) - *Promise* - Removes the provided
flag(s) from the specified message(s). `uid` is the *uid* of the message you want to remove the flag from or an array of
*uids*. `flag` is either a string or array of strings indicating the flags to remove. When completed, either calls
the provided callback with signature `(err)`, or resolves the returned promise.

- **end**() - *undefined* - Close the connection to the imap server.

- **getBoxes**([<*function*> callback]) - *Promise* - Returns the full list of mailboxes (folders). Upon success, either
the provided callback will be called with signature `(err, boxes)`, or the returned promise will be resolved with `boxes`.
`boxes` is the exact object returned from the node-imap *getBoxes()* result.

- **getPartData**(<*object*> message, <*object*> part, [<*function*> callback]) - *Promise* - Downloads part data
(which is either part of the message body, or an attachment). Upon success, either the provided callback will be called
with signature `(err, data)`, or the returned promise will be resolved with `data`. The data will be automatically
decoded based on its encoding. If the encoding of the part is not supported, an error will occur.

- **moveMessage**(<*mixed*> source, <*string*> boxName, [<*function*> callback]) - *Promise* - Moves the specified
message(s) in the currently open mailbox to another mailbox. `source` corresponds to a node-imap *MessageSource* which
specifies the messages to be moved. When completed, either calls the provided callback with signature `(err)`, or
resolves the returned promise.

- **openBox**(<*string*> boxName, [<*function*> callback]) - *Promise* - Open a mailbox, calling the provided callback
with signature `(err, boxName)`, or resolves the returned promise with `boxName`.

- **addBox**(<*string*> boxName, [<*function*> callback]) - *Promise* - Create a mailbox, calling the provided callback
with signature `(err, boxName)`, or resolves the returned promise with `boxName`.

- **delBox**(<*string*> boxName, [<*function*> callback]) - *Promise* - Delete a mailbox, calling the provided callback
with signature `(err, boxName)`, or resolves the returned promise with `boxName`.

- **search**(<*object*> searchCriteria, [<*object*> fetchOptions], [<*function*> callback]) - *Promise* - Search for and
retrieve mail in the previously opened mailbox. The search is performed based on the provided `searchCriteria`, which is
the exact same format as [node-imap][] requires. All results will be subsequently downloaded, according to the options
provided by `fetchOptions`, which are also identical to those passed to `fetch` of [node-imap][]. Upon a successful
search+fetch operation, either the provided callback will be called with signature `(err, results)`, or the returned
promise will be resolved with `results`. The format of `results` is detailed below. See node-imap's *ImapMessage*
signature for information about `attributes`, `which`, `size`, and `body`. For any message part that is a `HEADER`, the
body is automatically parsed into an object.
    ```js
        // [{
        //      attributes: object,
        //      parts: [ { which: string, size: number, body: string }, ... ]
        //  }, ...]
    ```

## Server events
Functions to listen to server events are configured in the configuration object that is passed to the `connect` function.
ImapSimple only implements a subset of the server event functions that *node-imap* supports, [see here](https://github.com/mscdex/node-imap#connection-events),
which are `mail`, `expunge` and `update`. Add them to the configuration object as follows:

```
var config = {
    imap: {
        ...
    },
    onmail: function (numNewMail) {
      ...
    },
    onexpunge: function (seqno) {
        ...
    },
    onupdate: function (seqno, info) {
        ...
    }
};
```

For more information [see here](https://github.com/mscdex/node-imap#connection-events).

## Contributing
Pull requests welcome! This project really needs tests, so those would be very welcome. If you have a use case you want
supported, please feel free to add, but be sure to follow the patterns established thus far, mostly:

- support promises **AND** callbacks
- make your api as simple as possible
- don't worry about exposing implementation details of [node-imap][] when needed

This project is **OPEN** open source. See [CONTRIBUTING.md](CONTRIBUTING.md) for more details about contributing.

## Semver
This project follows [semver](http://semver.org/). Namely:

- new MAJOR versions when incompatible API changes are made,
- new MINOR versions for backwards-compatible feature additions,
- new PATCH versions for backwards-compatible bug fixes

## License
[MIT](LICENSE-MIT)

[node-imap]: https://github.com/mscdex/node-imap
