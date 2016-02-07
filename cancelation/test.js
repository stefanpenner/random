var expect = require('chai').expect;
var CancellablePromise = require('./');

function noop() { }

function expectedRejectionNotFulfillment(value) {
  expect(true, 'expected rejection, but got fulfillment').to.be.false;
}

function expectedCancellation(reason) {
  expect(reason, 'expected non falsy rejection reason').to.be;
  expect(reason.name).to.eql('CancellationError');
}

describe('CancellablePromise', function() {
  describe('basic cancellation', function() {
    var source;
    beforeEach(function() {
      source = new CancellablePromise.TokenSource();
    });

    it('cancel before follow', function() {
      source.cancel();

      var promise = new CancellablePromise(noop, source.token());

      return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
    });

    it('cancel after follow', function() {
      var promise = new CancellablePromise(noop, source.token());

      var result = promise.then(expectedRejectionNotFulfillment, expectedCancellation);

      source.cancel();

      return result;
    });
  });
});
