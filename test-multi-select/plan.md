QUnit default test runner is quite bad for big code-bases, allowing the test
runner to run specific modules (but more then 1) will enable a better UI.

An initial UI could be a simple as a multi-select, but a more advanced one may be a grouped multi-select.
Allowing for groups to be visible and toggled

- [ ] make ?module take an array
  - [ ] tests
  - [ ] upstream

- [ ] provide POC UI that updates URL
- [ ] group in ember-apps based on type (acceptance/unit/integration etc)
- [ ] use in ember

![Alt Text](https://github.com/stefanpenner/random/blob/master/test-multi-select/qunit-grouped-multiselect.gif)
