#imap-simple

A library providing a simpler interface for common use cases of [node-imap][], a robust imap client for node.js.

This library is only currently fleshed out for the use case of retrieving email from an imap server.

###Example:

```js
var imaps = require('imap-simple');

var config = {
    imap: {
        user: 'your@email.address',
        password: 'yourpassword',
        host: 'imap.gmail.com',
        port: 993,
        tls: true
    },
    connectTimeout: 3000
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

##API

###Exported module
- **connect**(<*object*> options, [<*function*> callback]) - *Promise* - Main entry point. Connect to an Imap server.
Upon successfully connecting to the Imap server, either calls the provided callback with signature `(err, connection)`,
or resolves the returned promise with `connection`, where `connection` is an instance of *ImapSimple*. If the connection
times out, either the callback will be called with the `err` property set to an instance of *ConnectionTimeoutError*, or
the returned promise will be rejected with the same. Valid `options` properties are:

    - **imap**: Options to pass to node-imap constructor 1:1
    - **connectTimeout**: Time in milliseconds to wait before giving up on a connection attempt

- **ImapSimple**(<*object*> imap) - *ImapSimple* - constructor for creating an instance of ImapSimple. Mostly used for
testing.

- **errors.ConnectionTimeoutError**(<*number*> timeout) - *ConnectionTimeoutError* - Error thrown when a connection
attempt has timed out.


###ImapSimple class

- **openBox**(<*string*> boxName, [<*function*> callback]) - *Promise* - Open a mailbox. If successful, either calls the
provided callback with signature `(err, boxName)`, or resolves the returned promise with `boxName`.

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

##Contributing
Pull requests welcome! This project really needs tests, so those would be very welcome. If you have a use case you want
supported, please feel free to add, but be sure to follow the patterns established thus far, mostly:

- support promises **AND** callbacks
- make your api as simple as possible
- don't worry about exposing implementation details of [node-imap][] when needed

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details about contributing.

##License
[MIT](LICENSE-MIT)

[node-imap]: https://github.com/mscdex/node-imap
