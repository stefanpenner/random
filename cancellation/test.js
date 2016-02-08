var expect = require('chai').expect;
var CancellablePromise = require('./');
var CancellationToken = require('./').Token;
var RSVP = require('rsvp');

function noop() { }

function expectedRejectionNotFulfillment(value) {
  expect(true, 'expected rejection, but got fulfillment').to.be.false;
}

function expectedCancellation(reason) {
  expect(reason, 'expected non falsy rejection reason').to.be;
  expect(reason.name).to.eql('CancellationError');
}

describe('CancellablePromise Constructor', function() {
  var cancel, token;

  beforeEach(function() {
    token = new CancellationToken(function(_cancel) {
      cancel = _cancel
    });
  });

  describe('basic cancellation', function() {
    it('cancel before follow', function() {
      cancel();

      var promise = new CancellablePromise(noop, token);

      return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
    });

    it('cancel after follow', function() {
      var promise = new CancellablePromise(noop, token);

      var result = promise.then(expectedRejectionNotFulfillment, expectedCancellation);

      cancel();

      return result;
    });
  });

  describe('unfollow before cancel', function() {
    it('cancel after follow', function() {
      var promise = new CancellablePromise(noop, token);

      var result = promise.then(expectedRejectionNotFulfillment, expectedCancellation);

      cancel();

      return result;
    });

    describe('resolve', function() {
      it('cancel before follow', function() {
        cancel();

        var promise = new CancellablePromise(function(resolve) {
          resolve();
        }, token);

        return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
      });

      it('cancel before follow (lazy resolve)', function() {
        cancel();

        var lazyResolve;
        var promise = new CancellablePromise(function(resolve) {
          lazyResolve = resolve;
        }, token);

        return RSVP.Promise.resolve().then(function() {
          lazyResolve();
        }).then(function() {
          return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
        });
      });
    });

    describe('reject', function() {
      it('cancel before follow', function() {
        cancel();

        var promise = new CancellablePromise(function(resolve, reject) {
          reject();
        }, token);

        return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
      });

      it('cancel before follow (lazy resolve)', function() {
        cancel();

        var lazyReject;
        var promise = new CancellablePromise(function(resolve, reject) {
          lazyReject = reject;
        }, token);

        return RSVP.Promise.resolve().then(function() {
          lazyReject();
        }).then(function() {
          return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
        });
      });
    });
  });
});

describe('CancellablePromise then', function() {
  var token, cancel;

  beforeEach(function() {
    token = new CancellationToken(function(_cancel) { cancel = _cancel; });
  });

  describe('basic cancellation', function() {

    it('cancel before follow', function() {
      cancel();

      return CancellablePromise.resolve().
        then(undefined, undefined, token).
        then(expectedRejectionNotFulfillment, expectedCancellation);
    });

    it('cancel after follow (already resolved)', function() {
      var promise = new CancellablePromise.resolve();

      cancel();

      return promise.then(undefined, undefined, token).
        then(expectedRejectionNotFulfillment, expectedCancellation);
    });
  });

  describe('unfollow before cancel', function() {
    it('cancel after follow', function() {
      var promise = new CancellablePromise(noop, token);

      var result = promise.then(expectedRejectionNotFulfillment, expectedCancellation);

      cancel();

      return result;
    });

    describe('resolve', function() {
      it('cancel before follow', function() {
        cancel();

        var promise = new CancellablePromise(function(resolve) {
          resolve();
        }, token);

        return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
      });

      it('cancel before follow (lazy resolve)', function() {
        cancel();

        var lazyResolve;
        var promise = new CancellablePromise(function(resolve) {
          lazyResolve = resolve;
        }, token);

        return RSVP.Promise.resolve().then(function() {
          lazyResolve();
        }).then(function() {
          return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
        });
      });
    });

    describe('reject', function() {
      it('cancel before follow', function() {
        cancel();

        var promise = new CancellablePromise(function(resolve, reject) {
          reject();
        }, token);

        return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
      });

      it('cancel before follow (lazy resolve)', function() {
        cancel();

        var lazyReject;
        var promise = new CancellablePromise(function(resolve, reject) {
          lazyReject = reject;
        }, token);

        return RSVP.Promise.resolve().then(function() {
          lazyReject();
        }).then(function() {
          return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
        });
      });
    });
  });
});
