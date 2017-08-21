'use strict';
var expect = require("chai").expect;


describe("encoding", function () {
    var getEncoding = require("../lib/helpers/encoding");

    it("correct encoding is found", function () {
        expect(getEncoding({ 'content-type': [ 'text/plain; charset="iso-8859-1"' ] })).to.equal('iso-8859-1');
        expect(getEncoding({})).to.equal('utf8');
    });
});
