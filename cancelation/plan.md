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
let source = new tokensounrce();

promisereturningfunction(args, source.token());
otherreturningfunction(args, source.token());

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

## Promise Signal Based


```js
let p1 = promisereturningfunction(args);
let p2 = otherreturningfunction(args);

let p3 = promise.resolve().then(undefined, udnefined)

p3.finally(_ => { });

p1.cancel();
p2.cancel();
p3.cancel();
```
