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

  token.follow(function(reason) {
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

function TokenSource() {
  this.tokens = [];
  this._isCanceled = false;
}

// throw if cancelled

Object.defineProperty(TokenSource.prototype, 'isCanceled', {
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

TokenSource.prototype.cancel = function(reason) {
  if (this._isCanceled === true) {
    return;
    // already canceled
  }
  this.tokens.forEach(function(token) {
    token._signalCancel(new CancellationError(reason));
  });
};

TokenSource.prototype.token = function() {
  var token = new CancellationToken(this._isCanceled);
  this.tokens.push(token);
  return token;
};

CancelablePromise.TokenSource = TokenSource;

function CancellationToken(isCanceled) {
  this._isCanceled = !!isCanceled;
  this._followers = [];
}

Object.defineProperty(CancellationToken.prototype, 'isCanceled', {
  get: function() {
    return this._isCanceled;
  }
});

CancellationToken.prototype._signalCancel = function() {
  this._isCanceled = true;
  if (Array.isArray(this._followers)) {
      var followers = this._followers;
      this._followers = [];
      followers.forEach(function(cancel) {
        cancel(new CancellationError('cancelled yo'));
      });
  }
};

CancellationToken.prototype.follow = function(cancel) {
  if (this._isCanceled) {
    cancel(new CancellationError('cancelled yo'));
  } else {
    this._followers.push(cancel);
  }
};
