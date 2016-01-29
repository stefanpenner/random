var Promise = require('rsvp').Promise;

module.exports = CancelablePromise;

function CancelablePromise(resolver, token, name) {

  var cb;

  function onCancel(_cb) {
    cb = _cb;
  }

  Promise.call(this, function(resolve, reject) {
    r = reject;
    resolver(resolve, reject, onCancel);
  }, name);

  var p = this;

  this.finally(function() {
    t.untangle(p);
  });

  token.entangle(this, function(reason) {
    r(reason);
    cb && cb();
  });
}

CancelablePromise.prototype = Object.create(Promise.prototype);
CancelablePromise.__proto__ = Promise;

// CancelablePromise.prototype.then TODO: support cancellation
// CancelablePromise.resolve TODO: support cancellation
// CancelablePromise.reject TODO: support cancellation
// CancelablePromise.all TODO: support cancellation

function CancelationToken() {
  this.entangled = [];
  this._isCanceled = false;
}

// throw if cancelled

Object.defineProperty(CancelationToken.prototype, 'isCanceled', {
  get: function() {
    return this._isCanceled;
  }
});

function CancellationError(reason) {
  this.name = 'CancellationError';
  this.message = reason;
  Error.call(this);
}

CancellationError.prototype = Object.create(Error.prototype);

CancelationToken.prototype.cancel = function(reason) {
  this.entangled.forEach(function(task) {
    task.onCancel(new CancellationError(reason));
  });
};

CancelationToken.prototype.entangle = function(promise, onCancel) {
  this.entangled.push({
    promise: promise,
    onCancel: onCancel
  });
};

CancelationToken.prototype.untangle = function(promise) {
  var index = this.cancelations.indexOf(promise);
  delete this.cancelations[index];
};

var token = new CancelationToken();

(new CancelablePromise(function(resolve, reject) {
  setTimeout(function() {
    resolve(1);
  });
}, token)).then(function(value) {
  console.log('OMG', value);
}, function(reason) {
  console.log('rejected', reason.name, reason.message);
});

(new CancelablePromise(function(resolve, reject) {
  setTimeout(function() {
    resolve(1);
  });
}, token)).then(function(value) {
  console.log('OMG', value);
}, function(reason) {
  console.log('rejected', reason.name, reason.message);
});

token.cancel();

