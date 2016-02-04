class Cell() {
  constructor(obj) {
    this._obj = obj;
  }

  release() {
    let obj = this._obj;
    if (!obj) { return; }
    this._obj = undefined;
    let cells = cellMap.get(this);
    if (!cells) { return; }
    let index = cells.indexOf(this);
    cells.splice(index, 1);
  }

  set(key, value) {
    return this._obj && Ember.set(this._obj, key, value);
  }

  get(key) {
    return this._obj && Ember.get(this._obj, key);
  }

  invoke(key, ...args) {
    return this._obj && this._obj[key](...args);
  }
}

const cellMap = new Ember.WeakMap();
/*
 *
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
          component.set('saving',  false);
          component.release();
        }
      }
    }
  })
```

 */
Ember.Object.reopen({
  weak() {
    let cell = new Cell(this);
    let cells = cellMap.get(this) || [];
    cellMap.set(this, cells);
    cells.push(cell);
    return cell;
  },

  destroy() {
    let cells = cellMap.get(this);
    if (cells) {
      cells.forEach(cell => cell.release());
    }

    this._super(...arguments);
  },
});
