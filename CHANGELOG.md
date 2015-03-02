# Change Log
All notable changes to this project will be documented in this file.

## 1.1.2 - 2015-03-02
### Fixed
 - Put ECONNRESET error in better place, and only ignored error when calling .end()
 - 'ready' and 'error' event handlers will now only fire once when connecting

## 1.1.1 - 2015-02-27
### Fixed
 - Put in basic fix for ECONNRESET error when calling .end()

## 1.1.0 - 2015-02-27
### Added
 - added .end() method to *ImapSimple* for disconnecting from imap server

## 1.0.0 - 2015-02-27
### Added
 - Initial commit.

For more information about keeping a changelog, check out [keepachangelog.com/](http://keepachangelog.com/)
