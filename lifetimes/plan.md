being explicit about life-times and side-affects may allow us to address some common UI problems:

* latency increases the chances of concurrency related interference, but we
  should aim for no possibility of plan interference if possible
* common patterns cause happy paths to be susceptible to these sorts of
  problems

**NOTE: this example (using async/await) will likely not work, as the function
implicitly retains the `this`.**

POC: [ember-weak-ref](https://github.com/stefanpenner/ember-weak-ref)

### example

```js
export default Component.extend({
  actions: {
    save() {
      this.saving = true;
      try {
        let model = await this.model.save();
      } finally {
        this.saving = false
      }
    }
  }
})
```

#### problems

The lifetime of the await is different from that of the UI component, if the
await returns and the component is still rendered, all is well. Unfortunately,
if the await completes and the component is no longer present, bad things can happen.

1. the component is currently retained until the await completes
2. operations on the component may not be valid once the await completes (imagine save being invoked again, before the first completes);


#### Some approaches

Assigning each operation a unique id, then on completion of the operation
checking to see if that operations corresponding ID is still current. If it is,
allow the operation to complete, if not, skip it.

```js
export default Component.extend({
  init() {
    this._super(...arguments);
    this._saveIdentifier = 0;
  },

  actions: {
    save() {
      this.saving = true;
      let id = this._saveIdentifier++;

      try {
        let model = await this.model.save();

      } finally {
        if (id === this._saveIdentifier) {
          this.saving = false
        }
      }
    }
  }
})
```

pros:

* fixes obvioius plan interference problems

cons:

* tedious
* non-ergonomic
* doesn't address memory leak potential of retaining the component


-----------------

cancellation

```js
export default Component.extend({
  actions: {
    @cancelPending // on re-invocation, cancel pending
    async save() {
      this.saving = true;

      try {
        let model = await this.model.save();
      } finally {
        this.saving = false
      }
    }
  }
})
```

pros:

* exists early, preventing operations from piling up (if that is what one wants)
* generaly nice
* memory leak issue is sometimes addressed

con:

* finally still runs
* memory leak is still possible, as await's in finally's would still may hang ...
* no granular control
* component is still mutated after the fact.

-------

WeakCell

```js
export default Component.extend({
  actions: {
    @cancelPending // on re-invocation, cancel pending
    async save() {
      this.saving = true;
      const cell = new WeakRef(this);

      try {
        let model = await this.model.save();
      } finally {
        let component = cell.get()
        if (component) component.saving = false;
      }
    }
  }
})
```

pros:

* may only retains the cell (prevents large leaks, just leaves some book
  keeping stuff around)
* cancelation kills pending saves (assumes all tasks are safely cancelled)

cons:

* not-really ergonomic
* WeakCell may retain the component, so operating on the component may be
  possible, although likely not intended

--------

WeakCell \w ergonomic noop proxy

```js
export default Component.extend({
  actions: {
    @cancelPending // on re-invocation, cancel pending
    async save() {
      this.saving = true;
      const component = this.weak();

      try {
        let model = await this.model.save();
      } finally {
        // ignore these operations, if
        // * the component is destroyed
        // * if the compnoent has been released
        component.saving = false;
      }
    }
  }
})
```


pros:

* same pros as weakcell
* more ergonomic
* weak proxy could do noops for operations if the given component is gone.

con:

* not all cases can safely cancel pending tasks


---------------


WeakCell \w ergonomic noop proxy \w operationIdentifiers

```js
export default Component.extend({
  actions: {
    async save() {
      this.saving = true;
      const component = this.weak('save');

      try {
        let model = await this.model.save();
      } finally {
        // ignore these operations, if
        // * the this.weak('save') is invoked again, resulting in a new operation id
        // * the component is destroyed
        // * if the compnoent has been released
        component.saving = false;
      }
    }
  }
})
```


pros:

* same pros as weakcell etc
* more ergonomic
* weak proxy could do noops for operations if the given component is gone.

con:

* not all cases can safely cancel pending tasks


