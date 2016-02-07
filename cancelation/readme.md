several high level concepts:

* token based
* promise signal based
* hybrid?


TODO:

- [ ] flesh out the examples
- [ ] flesh out how signals work
- [ ] real examples
- [ ] examples for concrete issues

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


```js
import WeakMap from 'ember-weak-map;

const map = new WeakMap();
Component.reopen({
  init() {
    this._super(...arguments).
    let source = new CancelablePromise.TokenSource();
    map.set(this, source);
    this.untilDestroyed= new CancelablePromise.TokenSource();
  },

  willDestroyElement() {
    this._super(...arguments);
    map.get(this).cancel();
  }
});

// once example;
Component.extend({
    keepFresh() {
        this.get('model').reload(this.untilDestroyed).then(_ => this.keepFresh());
    },
    didInsertElement() {
      this._super(...arguments);
    }
});

// another example
function timeout(time, token) {
  return new CancelablePromise((resolve) => Ember.run.later(resove, time), token);
}

Component.extend({
    willInsertElement() {
      this._super(...arguments);

      this.marqueeLoop(this.untilDestroyed);
    },

    marqueeLoop: async function(until) {
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
