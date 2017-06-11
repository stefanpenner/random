const fs = require('fs');
const assert = require('assert');

// validate


class Heapsnapshot {
  constructor(parsed) {
    this.parsed = parsed;

    let meta     = this.meta = parsed.snapshot.meta;
    let fields   = this.node_fields = meta.node_fields
    let types    = this.node_types = meta.node_types;

    // offsets
    this.NODE_TYPE = fields.indexOf('type');
    this.NODE_NAME = fields.indexOf('name');
    this.NODE_ID = fields.indexOf('id');
    this.NODE_SELF_SIZE = fields.indexOf('self_size');
    this.NODE_EDGE_COUNT = fields.indexOf('edge_count');
    this.NODE_TRACE_NODE_ID = fields.indexOf('trace_node_id');
    this.NODE_TYPES = types[this.NODE_TYPE];
    this.NODE_FIELD_COUNT = fields.length;

    // validate
    const NODE_TOTAL = this.NODE_TOTAL = parsed.nodes.length / this.NODE_FIELD_COUNT;
    assert.equal(NODE_TOTAL, NODE_TOTAL | 0);

    this._nodes = Object.create(null);
  }

  summary() {
    const iterator = this.nodeIterator();
    let summary = Object.create(null);
    for (let node of iterator) {
      summary[node.type] = summary[node.type] || 0;
      summary[node.type]++;
    }

    return summary;
  }

  static fromFileSync(filePath) {
    return new this(JSON.parse(fs.readFileSync(filePath, 'UTF8')));
  }

  * nodeIterator() {
    let index = 0;

    while(this.parsed.nodes.length > index) {
      yield this.nodeForIndex(index);
      index += this.NODE_FIELD_COUNT;
    }
  }

  _createNode(index) {
    let number = index / snapshot.NODE_FIELD_COUNT;
    let parsed = snapshot.parsed;
    let nodes = parsed.nodes;
    let strings = parsed.strings;

    // 'type', 'name', 'id', 'self_size', 'edge_count', 'trac
    let type = snapshot.NODE_TYPES[parsed.nodes[index + snapshot.NODE_TYPE]];
    if (type === undefined) {
      // strange, sometimes we have a type value of 12, but never greater...
      // console.log(`index: ${index} value: ${parsed.nodes[index + NODE_TYPE]}`);
    }

    let name = strings[parsed.nodes[index + snapshot.NODE_NAME]];
    let id = nodes[index + snapshot.NODE_ID];
    let self_size = nodes[index + snapshot.NODE_SELF_SIZE];
    let edge_count = nodes[index + snapshot.NODE_EDGE_COUNT];
    let trace_node_id = nodes[index + snapshot.NODE_TRACE_NODE_ID];

    return new Node(index, number, name, type, id, self_size, edge_count, trace_node_id);
  }

  nodeForIndex(index) {
    return this._nodes[index] = (this._nodes[index] = this._createNode(index));
  }
}

class Node {
  constructor(index, number, name, type, id, self_size, edge_count, trace_node_id) {
    this.index = index;
    this.number = number;
    this.name = name;
    this.type = type;
    this.id = id;
    this.self_size = self_size;
    this.edge_count = edge_count;
    this.trace_node_id = this.trace_node_id;
  }
}

const snapshot = Heapsnapshot.fromFileSync('./small.heapsnapshot');
let s = snapshot.nodeIterator();
console.log(s.next().value);
console.log(s.next().value);
console.log(s.next().value);
console.log(s.next().value);
console.log(snapshot.summary());
