'use strict';
var expect = require("chai").expect;


describe("imap-simple", function () {
    var getEncoding = require("../lib/helpers/encoding");

    it("correct encoding is found ", function () {
        expect(getEncoding({ 'content-type': [ 'text/plain; charset="iso-8859-1"' ] })).to.equal('latin1');
        expect(getEncoding({})).to.equal('utf8');
    });
});
