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
    it('cancel before register', function() {
      cancel();

      var promise = new CancellablePromise(noop, token);

      return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
    });

    it('cancel after register', function() {
      var promise = new CancellablePromise(noop, token);

      var result = promise.then(expectedRejectionNotFulfillment, expectedCancellation);

      cancel();

      return result;
    });
  });

  describe('unregister after settling', function () {
    it('never cancel, but fulfill', function() {
      var expectedFulfillment = 'such resolve!'
      var promise = new CancellablePromise(function(resolve) {
        resolve(expectedFulfillment);
      }, token);

      return promise.then(function(value) {
        expect(value).to.eql(expectedFulfillment);
      });
    });

    it('never cancel, but reject', function() {
      var expectedReason = 'such reason';
      var promise = new CancellablePromise(function(resolve, reject) {
         reject(expectedReason);
      }, token);

      return promise.then(function() {
        expect(false).to.be.true;
      }, function(reason) {
        expect(reason).to.eql(expectedReason);
      });
    });
  });

  describe('unregister before cancel', function() {
    it('cancel after register', function() {
      var promise = new CancellablePromise(noop, token);

      var result = promise.then(expectedRejectionNotFulfillment, expectedCancellation);

      cancel();

      return result;
    });

    describe('resolve', function() {
      it('cancel before register', function() {
        cancel();

        var promise = new CancellablePromise(function(resolve) {
          resolve();
        }, token);

        return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
      });

      it('cancel before register (lazy resolve)', function() {
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
      it('cancel before register', function() {
        cancel();

        var promise = new CancellablePromise(function(resolve, reject) {
          reject();
        }, token);

        return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
      });

      it('cancel before register (lazy resolve)', function() {
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

    it('cancel before register', function() {
      cancel();

      return CancellablePromise.resolve().
        then(undefined, undefined, token).
        then(expectedRejectionNotFulfillment, expectedCancellation);
    });

    it('cancel after register (already resolved)', function() {
      var promise = new CancellablePromise.resolve();

      cancel();

      return promise.then(undefined, undefined, token).
        then(expectedRejectionNotFulfillment, expectedCancellation);
    });
  });

  describe('unregister before cancel', function() {
    it('cancel after register', function() {
      var promise = new CancellablePromise(noop, token);

      var result = promise.then(expectedRejectionNotFulfillment, expectedCancellation);

      cancel();

      return result;
    });

    describe('resolve', function() {
      it('cancel before register', function() {
        cancel();

        var promise = new CancellablePromise(function(resolve) {
          resolve();
        }, token);

        return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
      });

      it('cancel before register (lazy resolve)', function() {
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
      it('cancel before register', function() {
        cancel();

        var promise = new CancellablePromise(function(resolve, reject) {
          reject();
        }, token);

        return promise.then(expectedRejectionNotFulfillment, expectedCancellation);
      });

      it('cancel before register (lazy resolve)', function() {
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
