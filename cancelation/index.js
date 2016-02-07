var Promise = require('rsvp').Promise;

module.exports = CancelablePromise;

function CancelablePromise(resolver, token, name) {
  var follower;
  Promise.call(this, function(resolve, reject) {
    var cb;

    function onCancel(_cb) {
      cb = _cb;
    }

    follower = function follower(reason) {
      reject(reason);
      cb && cb();
    };

    token.follow(follower);

    resolver(resolve, reject, onCancel);
  }, name);


  var p = this;

  this.finally(function() {
    t.unfollow(follower);
  });
}

CancelablePromise.prototype = Object.create(Promise.prototype);
CancelablePromise.__proto__ = Promise;

// CancelablePromise.prototype.then TODO: support cancellation
// CancelablePromise.resolve TODO: support cancellation
// CancelablePromise.reject TODO: support cancellation
// CancelablePromise.all TODO: support cancellation

function TokenSource() {
  this._token = new CancellationToken();
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

  this._isCanceled = true;
  this._token._isCanceled = true;

  var followers = this._token._followers;
  this._token._followers = undefined;

  followers.forEach(function(cancel) {
    cancel(new CancellationError('cancelled yo'));
  });
};

Object.defineProperty(TokenSource.prototype, 'token', {
  get: function() {
    return this._token;
  }
});

CancelablePromise.TokenSource = TokenSource;

function CancellationToken() {
  this._followers = [];
}

Object.defineProperty(CancellationToken.prototype, 'isCanceled', {
  get: function() {
    return this._isCanceled;
  }
});

CancellationToken.prototype.follow = function(cancel) {
  if (this._isCanceled) {
    cancel(new CancellationError('cancelled yo'));
  } else {
    this._followers.push(cancel);
  }
};
