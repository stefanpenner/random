var Promise = require('rsvp').Promise;

module.exports = CancelablePromise;

function CancelablePromise(resolver, token, name) {

  if (token && typeof token !== 'string') {
    var registration;

    Promise.call(this, function(resolve, reject) {
      registration = function(reason) {
        reject(reason);
      };

      token.register(registration);

      resolver(resolve, reject);
    }, name);

    var promise = this;

    this.finally(function() {
      promise.unregister(registration);
    });
  } else {
    Promise.apply(this, arguments);
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
    return Promise.prototype.finally.apply(this, arguments);
  }
};

CancelablePromise.__proto__ = Promise;


function CancellationError(reason) {
  this.name = 'CancellationError';
  this.message = reason;
  Error.call(this);
}

CancellationError.prototype = Object.create(Error.prototype);

CancelablePromise.Token = Token;
function Token(executor) {
  this._isCanceled = false;
  this._registrations = [];
  this._reason = undefined;

  if (typeof executor !== 'function') {
    throw new TypeError('Token exeuctor must be a function');
  }

  var token = this;

  executor(function cancel(reason) {
    if (token._isCanceled === true) {
      return;
      // already canceled
    }

    token._reason = reason;
    token._isCanceled = true;

    var registrations = token._registrations;
    token._registrations = undefined;

    registrations.forEach(function(cancel) {
      cancel(new CancellationError(reason));
    });
  });
}

// TODO: needs actual tests;
Token.join = function(tokens) {
  var cancel;
  var token = new this(function(_cancel) { cancel = _cancel; });;

  tokens.forEach(function(token) {
    token.register(function registration() {
      cancel();

      tokens.forEach(function(token) {
        token.unregister(folower);
      });
    });
  });

  return token;
};

Token.prototype.throwIfRequested = function() {
  if (this._isCanceled) {
    throw new CancellationError(this._reason);
  }
};

Token.prototype.constructor = Token;
Object.defineProperty(Token.prototype, 'isCanceled', {
  get: function() {
    return this._isCanceled;
  }
});

Token.prototype.register = function(cancel) {
  if (this._isCanceled) {
    cancel(new CancellationError(this._reason));
  } else {
    this._registrations.push(cancel);
  }
};
