
## Deprecated dependencies

```sh
$ npm i
npm WARN deprecated json3@3.3.2: Please use the native JSON object instead of JSON 3
npm WARN deprecated jscs-preset-wikimedia@1.0.1: No longer maintained. We recomment migrating to ESLint with eslint-config-wikimedia.
npm WARN deprecated nomnom@1.8.1: Package no longer supported. Contact support@npmjs.com for more info.
npm WARN deprecated mkdirp@0.5.1: Legacy versions of mkdirp are no longer supported. Please update to mkdirp 1.x. (Note that the API surface has changed 
to use Promises in 1.x.)
npm WARN deprecated istanbul@0.4.5: This module is no longer maintained, try this instead:
npm WARN deprecated   npm i nyc
npm WARN deprecated Visit https://istanbul.js.org/integrations for other alternatives.
npm WARN deprecated core-js@2.6.12: core-js@<3.3 is no longer maintained and not recommended for usage due to the number of issues. Because of the V8 
engine whims, feature detection in old core-js versions could cause a slowdown up to 100x even if nothing is polyfilled. Please, upgrade your 
dependencies to the actual version of core-js.

added 228 packages, and audited 229 packages in 7s

16 vulnerabilities (5 low, 9 high, 2 critical)
```

## Outdated dependencies

```sh
$ npm outdated
Package     Current  Wanted  Latest  Location                 Depended by
chai          3.5.0   3.5.0   4.3.4  node_modules/chai        imap-simple
iconv-lite   0.4.24  0.4.24   0.6.3  node_modules/iconv-lite  imap-simple
mocha         3.5.3   3.5.3   8.4.0  node_modules/mocha       imap-simple
utf8          2.1.2   2.1.2   3.0.0  node_modules/utf8        imap-simple
```
