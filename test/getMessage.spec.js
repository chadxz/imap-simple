'use strict';
var expect = require("chai").expect;
var events = require('events');
var Readable = require('stream').Readable;


describe("getMessage", function () {
    var getMessage = require("../lib/helpers/getMessage");

    it("getMessage creates correct results", function(done) {
        var emailEmitter = new events.EventEmitter();
        getMessage(emailEmitter).then(function (result) {
            expect(result.attributes).to.deep.equal(undefined);
            expect(result.parts[0]).to.deep.equal({ which: 'HEADER', size: 0, body: expectedHeaderContent });
            expect(result.parts[1]).to.deep.equal({ which: 'TEXT', size: 0, body: 'ÄÅ'});
            done();
        });

        var bodyStream = new Readable;
        emailEmitter.emit('body', bodyStream, { seqno: 0, which: 'TEXT', size: 0 });
        bodyStream.push(new Buffer([0xC4])); // Ä in iso-8859-1
        bodyStream.push(new Buffer([0xC5])); // Ö in iso-8859-1
        bodyStream.push(null);

        var headerStream = new Readable;
        emailEmitter.emit('body', headerStream, { seqno: 0, which: 'HEADER', size: 0 });
        headerStream.push(headerContent);
        headerStream.push(null);

        setTimeout(function() {
            emailEmitter.emit('end');
        })
    });
});

var headerContent = [
    'Delivered-To: delivery.address@gmail.com',
    'Received: received 1',
    'Received: received 2',
    'From: sender.address@gmail.com',
    'To: delivery.address@gmail.com',
    'Message-ID: <123.abc@abc.com>',
    'Subject: subject',
    'Content-Type: text/plain; charset="iso-8859-1"',
    'Date: Wed, 22 Mar 2017 13:10:37 +0100 (CET)'
].join('\r\n');

var expectedHeaderContent = {
    'delivered-to': ['delivery.address@gmail.com'],
    'received': ['received 1', 'received 2'],
    'from': ['sender.address@gmail.com'],
    'to': ['delivery.address@gmail.com'],
    'message-id': ['<123.abc@abc.com>'],
    'subject': ['subject'],
    'content-type': ['text/plain; charset="iso-8859-1"'],
    'date': ['Wed, 22 Mar 2017 13:10:37 +0100 (CET)']
}
