#### Token Based Cancelation

several high level concepts:

* token based
* cancel tasks (promises or other)

* promise signal based
* hybrid?


TODO:

- [x] flesh out the examples
- [x] real examples
- [-] examples for concrete issues
- [ ] experiment with signals
- [ ] ensure is performant

## Token Based

```js
let source = new CancelablePromise.TokenSource();

promisereturningfunction(args, source.token);
otherreturningfunction(args, source.token);

source.cancel(); // races completions
```

#### pros

* top down (signal travels the same direction and permission as other state changes)
* 1 token can be used to easily coordinate N consumers
* no back-propogation, no dowstream consumers can cause plan interference
* complex structures (joining tokens, token trees) are possible

#### cons

* 1:1 case is common, tokens feel heavy weight for that.
* maybe in-ergonomic?
* appear more complicated


## Ember example


Given:
```js
import WeakMap from 'ember-weak-map';
import CancellablePromise, { TokenSource } from 'some-lib-...';

const map = new WeakMap();
Component.reopen({
  init() {
    this._super(...arguments).
    let source = new TokenSource();
    map.set(this, source);
    this.untilDestroyed = source.token;
  },

  willDestroyElement() {
    this._super(...arguments);
    map.get(this).cancel();
  }
});

```

Example 1:

```js
Component.extend({
    async keepFresh(until) {
        await this.get('model').reload(until);
        await this.keepFresh(until);
    },

    didInsertElement() {
      this._super(...arguments);
      keepFresh(this.untilDestroyed);
    }
});
```

Example 2:

```js
function timeout(time, token) {
  return new CancelablePromise((resolve) => Ember.run.later(resove, time), token);
}

Component.extend({
    willInsertElement() {
      this._super(...arguments);

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
  })
})
```

Example 3:

```js
function setInterval(cb, time, token) {
  const pid = setInterval(cb);
  token.follow(_ => cancelInterval(pid));
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

```js
function raf(cb, token) {
  let pid = requestAnimationFrame(_ => pid = requestAnimationFrame(cb));

  token.follow(_ => cancelAnimationFrame(pid));
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
TokenSource.join([
  this.untilDestroyed,
  this.untilStopReloading
]);
```

## Other ideas Promise Signal Based


```js
let p1 = promisereturningfunction(args);
let p2 = otherreturningfunction(args);

let p3 = promise.resolve().then(undefined, udnefined)

p3.finally(_ => { });

p1.cancel();
p2.cancel();
p3.cancel();
```

Pro:

* easy api

Con:

* consumers can very easily interfere with each other
* ...

Potential solution, is to allow someone to op-into this...

