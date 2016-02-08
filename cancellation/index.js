var Promise = require('rsvp').Promise;

module.exports = CancelablePromise;

function CancelablePromise(resolver, token, name) {

  if (token && typeof token !== 'string') {
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
  } else {
    return Promise.apply(this, arguments);
  }
}

CancelablePromise.__proto__ = Promise;
CancelablePromise.resolve = function(value, token, label) {
  if (arguments.length > 1 && typeof token === 'string') {
    return Promise.resolve.call(this, value, label);
  } else {
    return new CancelablePromise(function(resolve) {
      resolve(value);
    }, token, label);
  }
};

CancelablePromise.prototype = Object.create(Promise.prototype);
CancelablePromise.prototype.constructor = CancelablePromise;
CancelablePromise.prototype.then = function(onFulfillment, onRejection, token, label) {
  if (token && typeof token !== 'string') {
    return this.constructor.resolve(this, token, label).then(onFulfillment, onRejection);
  } else {
    return Promise.prototype.then.apply(this, arguments);
  }
};

CancelablePromise.prototype.catch = function(onFulfillment, token, label) {
  if (token && typeof token !== 'string') {
    return this.constructor.resolve(this, token, label).then(undefined, onRejection);
  } else {
    return Promise.prototype.catch.apply(this, arguments);
  }
};

CancelablePromise.prototype.finally = function(callback, token, label) {
  if (token && typeof token !== 'string') {
    return this.constructor.resolve(this, token, label).finally(callback, label);
  } else {
    return Promise.prototype.catch.apply(this, arguments);
  }
};

CancelablePromise.__proto__ = Promise;

function TokenSource() {
  this._token = new CancellationToken();
  this._isCanceled = false;
}

// TODO: needs actual tests;
TokenSource.join = function(tokens) {
  var source = new this;

  tokens.forEach(function(token) {
    token.follow(function follower() {
      tokens.forEach(function(token) {
        source.cancel();
        token.unfollow(folower);
      });
    });
  });

  return source.token;
};


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
