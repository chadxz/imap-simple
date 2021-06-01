# Change Log

All notable changes to this project will be documented in this file.

## 6.0.0 - 2021-06-01

#### EOL

- This library is no longer actively maintained. @chadxz no longer uses it and hasn't
  for years. It has been archived on Github and deprecated on NPM. No replacement is
  suggested. Good luck.

## 5.1.0 - 2021-06-01

#### Added

- \#89 - @mgkha
    - Added wrapper for node-imap's `removeMessageLabel`

## 5.0.0 - 2020-03-30

#### Added

- \#40 - @brbeaird
    - Added wrapper for node-imap's `closeBox` with support for autoExpunge
    - This change makes use of default parameters in javascript, which was first
    supported in Node.js v6. Previously this library did not explicitly specify
    what Node.js versions it supported, so using this opportunity to specify that
    and bump major version to ensure it does not inadvertently break people.

- \#60 - @synox
    - Added `delete` which allows for deleting messages by uid.

## 4.3.0 - 2019-01-21

#### Added

- \#53 - @u2ros
    - Added support for `UUENCODE` encoded attachment part decoding.

## 4.2.0 - 2018-11-08

#### Added

- \#50 - @iaarnio
    - Added `ImapSimple.prototype.addBox()` and `ImapSimple.prototype.delBox()`
    as wrappers around the same-named functions in the underlying node-imap
    library.

## 4.1.0 - 2018-05-31

#### Added

- \#47 - @AurisAudentis
    - Added `ImapSimple.prototype.getBoxes()` as a wrapper around the same-named
    function in the underlying node-imap library.

## 4.0.0 - 2018-01-09

Between v3.1.0 and v3.2.0 #29 was merged to remove the `es6-promise` library from
this package's dependencies, but was never released as it was a semver major change.

Later, #41 was merged to add a new feature. #29 had been forgotten about, and
v3.2.0 (a semver-minor release) was issued for the library.

Because v3.2.0 contained breaking changes for users of the library on versions
of Node that don't include Promise support, we marked it as deprecated on the
npm registry and are issuing this 4.0.0 release as the current recommended
version.

Sorry :(

## 3.2.0 - 2017-08-21

#### Added

- \#41 - @jhannes
    - Added wrapper function `append` on the connection object to append a message
    to a mailbox.

## 3.1.0 - 2016-11-15

#### Added

- \#19 - @redpandatronicsuk
    - Added wrapper functions to add and delete flags from messages.
    - Added event listeners and corresponding options for listening for receiving
    new mails, message updates (such as flag changes) and external message delete
    events.
    - Added `seqno` property to retrieved messages, so the message can be
    correlated to received events.

## 3.0.0 - 2016-10-26

#### Fixed

- The ConnectionTimeoutError previously had its name set to 'BaseUrlNotSetError'.
This version fixes that, but since the error was part of the library's public API
and the name is technically something people could code against, the version has
received a major bump.

## 2.0.0 - 2016-09-28

Updated dependencies.

#### Changed

- The `es6-promise` module has changed its scheduler from `setImmediate()` to
`nextTick()` on Node 0.10. This directly affects this module's promise API,
so the major version has been bumped to indicate this. See
[the es6-promise changelog](https://github.com/stefanpenner/es6-promise/blob/master/CHANGELOG.md#300)
for more details about the change.

## 1.6.3 - 2016-07-20

#### Fixed

- \#15 - @johnkawakami - Parts of an email with 'BINARY' encoding will now be
    decoded as such.

## 1.6.2 - 2016-05-17

#### Fixed

- \#11 - @nytr0gen - Library will now reject properly when a close or end event
    is received when trying to connect.

## 1.6.1 - 2016-04-25

#### Fixed

- \#10 - @tuomastanner - fixed issue with decoding utf8 parts, specifically with
    respect to interacting with gmail.


## 1.6.0 - 2016-03-11

#### Added

- \#9 - @bvschwartz - `getPartData` is now using [iconv-lite][iconv-lite] to automatically
    decode message parts with an '8BIT' encoding, with a default 'utf-8' encoding set.

[iconv-lite]: https://github.com/ashtuchkin/iconv-lite

## 1.5.2 - 2016-02-04

#### Fixed

- \#7 - @srinath-imaginea - `fetchOptions` is now properly passed when using the callback
    api of `search()`

## 1.5.1 - 2015-12-04

#### Fixed

- \#5 - @jbilcke - fixed incompatible use of all upper-case encoding name, instead of treating
    the encoding as case-insensitive.

## 1.5.0 - 2015-05-22

#### Added

- added `addMessageLabel` and `moveMessage` wrapper methods to ImapSimple class

## 1.4.0 - 2015-05-22

#### Added

- added `getParts` to module export and `getPartData` to ImapSimple class

#### Fixed

- fixed strange bug where header was sometimes not being parsed

## 1.3.2 - 2015-03-06

#### Fixed

- fixed property used to determine whether an error was an authTimeout

## 1.3.1 - 2015-03-04

#### Fixed

- fixed `connect()` option `imap.authTimeout` default not being properly set.

## 1.3.0 - 2015-03-04

#### Removed

- removed `options.connectTimeout`. Support has remained for backwards
    compatibility, but the recommended option for setting a connection timeout
    moving forward is `options.imap.authTimeout`. Support for
    `options.connectTimeout` will be removed on the next major release.

## 1.2.0 - 2015-03-02

#### Added

- made `ImapSimple` an event emitter

## 1.1.2 - 2015-03-02

#### Fixed

- Put ECONNRESET error in better place, and only ignored error when calling .end()
- 'ready' and 'error' event handlers will now only fire once when connecting

## 1.1.1 - 2015-02-27

#### Fixed

- Put in basic fix for ECONNRESET error when calling .end()

## 1.1.0 - 2015-02-27

#### Added

- added .end() method to `ImapSimple` for disconnecting from imap server

## 1.0.0 - 2015-02-27

#### Added

- Initial commit.

For more information about keeping a changelog, check out [keepachangelog.com/](http://keepachangelog.com/)
