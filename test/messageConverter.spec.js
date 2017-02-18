'use strict';

var chai = require('chai');
var assert = chai.assert;

var convertMessage = require('../lib/helpers/messageConverter');

describe("convertMessage", function () {

    it("Message conversion works", function () {
        var returnValue = convertMessage("=foo");
        assert.equal(returnValue, "=foo");

        returnValue = convertMessage("=C3=84");
        assert.equal(returnValue, "Ä");

        returnValue = convertMessage("=C3=96");
        assert.equal(returnValue, "Ö");

        returnValue = convertMessage("=C3=85");
        assert.equal(returnValue, "Å");
    });
});

