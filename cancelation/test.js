var expect = require('chai').expect;
var CancellablePromise = require('./');
var RSVP = require('rsvp');

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

      var promise = new CancellablePromise(noop, source.token);

      return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
    });

    it('cancel after follow', function() {
      var promise = new CancellablePromise(noop, source.token);

      var result = promise.then(expectedRejectionNotFulfillment, expectedCancellation);

      source.cancel();

      return result;
    });
  });

  describe('unfollow before cancel', function() {
    var source;

    beforeEach(function() {
      source = new CancellablePromise.TokenSource();
    });

    it('cancel after follow', function() {
      var promise = new CancellablePromise(noop, source.token);

      var result = promise.then(expectedRejectionNotFulfillment, expectedCancellation);

      source.cancel();

      return result;
    });
    describe('resolve', function() {
      it('cancel before follow', function() {
        source.cancel();

        var promise = new CancellablePromise(function(resolve) {
          resolve();
        }, source.token);

        return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
      });

      it('cancel before follow (lazy resolve)', function() {
        source.cancel();

        var lazyResolve;
        var promise = new CancellablePromise(function(resolve) {
          lazyResolve = resolve;
        }, source.token);

        return RSVP.Promise.resolve().then(function() {
          lazyResolve();
        }).then(function() {
          return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
        });
      });

    });

    describe('reject', function() {
      it('cancel before follow', function() {
        source.cancel();

        var promise = new CancellablePromise(function(resolve, reject) {
          reject();
        }, source.token);

        return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
      });

      it('cancel before follow (lazy resolve)', function() {
        source.cancel();

        var lazyReject;
        var promise = new CancellablePromise(function(resolve, reject) {
          lazyReject = reject;
        }, source.token);

        return RSVP.Promise.resolve().then(function() {
          lazyReject();
        }).then(function() {
          return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
        });
      });
    });
  });
});
