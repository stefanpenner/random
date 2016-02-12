# Token Based Cancellation braindump

---

* [tests](https://github.com/stefanpenner/random/blob/master/cancellation/test.js)
* [codes](https://github.com/stefanpenner/random/blob/master/cancellation/index.js)

---

TL;DR a way to potentially unify all forms of cancellation.

### An example:

Given a UI component, it will likely subscribe to events, poll data, and render animate.
Using tokens provides a unified way to coordinate "disinterest" which may
result in cancellations of various operations.

```js
// create a token, which is revoked on the UIComponent will be removed
let untilRemoved = new Token((cancel) => uiComponent.on('willRemove', cancel))

// imagine our UI has some state
let state = /* some plot device */

// animate state, using requestAnimationFrame
animate(function() {
  render(state);
}, untilRemoved);

// subscribe to user changes
mouseDrags(document.body).subscribe({
  next(e) { state.mouseWasDragged(e); }
}, untilRemoved);

// also poll from some foreign source;
poll(async () => {
  let data = await ajax(url, untilRemoved);

  await timeout(1000, untilRemoved);

  state.updateDataFromServer(data);
}, untilRemoved);
```

potential implementations for the the above functions

#### requestAnimationFrame

```
animate(() => {
  // animate something, but only until the token is revoked
}, token);
```

```
function animate(cb, token) {
  if (token.isCancelled) { return; }

  requestAnimationFrame(function() {
    raf(cb, token);
    cb();
  });
}
```

### timeout

currently we do (which is more or less fine):

```
let cookie = setTimeout(cb, time);

// then something wants to clear the timeout

clearTimeout(cookie);
```

With tokens one could associate a given timeout with a token

```
timeout(cb, time, token);

// the timeout will be cleared when the token is revoked
```

a potential user-land implementation of a token based setTimeout

```
functions timeout(cb, time, token) {
  if (token.isCancelled) { return; }

  let cookie = setTimeout(_ => {
    token.unregister(registration);
    cb();
  }, time);

  function registration() {
    return clearTiemout(cookie)
  }

  token.register(registration);
}
```

### Observable

currently:

```
let subscription = observable.subscribe()
subscription.unsubscribe();
```

with tokens:

```
observable.subscribe(token)
```

### Promises

Any promise producing function takes an optional cancellation token as the last arge. Entangling the produced promise with the token, and cancellation if the token is cancelled.

```js
new Promise(resolve, token);

Promise.all(iterable, token);
Promise.race(iterable, token);

promise.then(undefined, undefined, token);
promise.catch(undefined, token);

source.cancel(); // races completions
```

Cancellation triggers synchronously, and in this prototype uses a CancellationError rejection. Although some experiments with a new completion type of cancellation are on-going. (Just not implemented here yet...)

#### pros

* top down (signal travels the same direction and permission as other state changes)
* 1 token can be used to easily coordinate N consumers
* no back-propogation, no dowstream consumers can cause plan interference
* complex structures (joining tokens, token trees) are possible

#### cons

* 1:1 case is common, tokens feel heavy weight for that.
* maybe in-ergonomic?
* appear more complicated

## UI example

Given a UI Component with the following lifecycle hooks:

1. init ( on initialization of the component)
2. didInsertElement (on insert of the element)
3. willDestroyElement (on destruction of the element)

```js
import WeakMap from 'ember-weak-map'; // use this to get private state, don't want the cancel leaking
import CancellablePromise, { Token } from 'some-lib-...';

const map = new WeakMap();

Component.reopen({
  init() {
    this._super(...arguments);

    this.untilDestroyed = new Token((cancel) => map.set(this, cancel));
  },

  willDestroyElement() {
    this._super(...arguments);

    map.get(this)(); // cancel the this.untilDestroyed token
  }
});

```

Example 1:

Imagine a UI component, that continously reloads its data (likely fetching from a server).

```js
Component.extend({

    async keepFresh(until) {
        await this.data.reload(until);
        await this.keepFresh(until);
    },

    // when the element is inserted
    didInsertElement() {
      this._super(...arguments);
      // begin reloading the data, but stop once the UI component is destroyed (using a token)
      keepFresh(this.untilDestroyed);
    }
});
```

Example 2:

```js
function timeout(time, token) {
  return new CancelablePromise((resolve) => setTimeout(resove, time), token);
}

Component.extend({

    // when the component is inserted
    willInsertElement() {
      this._super(...arguments);

      // begin UI animation, until the element is destroyed (using the untilDestroyed token)
      this.marqueeLoop(this.untilDestroyed);
    },

    async marqueeLoop(until) {
      let text = this.get('text');

      while (true) {
        this.set('formattedText', text);
        await timeout(1500, until);
        for (let i = 0; i < text.length; ++i) {
          this.set('formattedText', capitalizeAt(text, i));
          await timeout(50, until);
        }
      }

      this.marqueeLoop(this.untilDestroyed);

  })
})
```

Example 3:

token based termination of setInterval

```js
function setInterval(cb, time, token) {
  const pid = window.setInterval(cb);
  token.register(_ => window.cancelInterval(pid));
}

Component.extend({
    willInsertElement() {
      this._super(...arguments);

      setInterval(_ => this.reload(), 500, this.untilDestroyed);
    }
  })
})
```

Example 4:

token based termination of requestAnimationFrame

```js

function raf(cb, token) {
  if (token.isCancelled) { return; }

  requestAnimationFrame(_ => raf(cb, token);
}

Component.extend({
    willInsertElement() {
      this._super(...arguments);

      raf(_ => this.reload(), this.untilDestroyed);
    }
  })
})
```

Example 5:

Combining multiple tokens

```js
Token.join([
  this.untilDestroyed,
  this.untilStopReloading
]);
```

## Further exploration of ergonomic solutions for 1:1

# open questions


* can async functions be cancelled form the outside without tokens? Like how generators work?
* if so, should this by via a sort of implicit token?
* can one opt out of such an implicit token?
* are cancellation signals sync (in my example they are)
* should cancellation signals transmit cancellation reasons?
* should cancellations be rejections? What sort of rejection reason would they provide
* are there some considerations to take now to ensure high performance?
