// https://users.ece.cmu.edu/~koopman/stack_computers/sec3_2.html
const PUSH  = 0;
const ADD   = 1;
const PRINT = 2;
const POP   = 3;
const PRINT_STACK = 4; // -1 ?
const SUB    = 5;
const AND    = 6;
const OR     = 7;
const XOR    = 8;
const DROP   = 9;
const DUP    = 10;
const OVER   = 11;
const SWAP   = 12;
const STORE  = 13;
const LOAD   = 14;

const STACK = [];

const SOURCE = [
  /*  0 */`$STACK.push($VAL);`,
  /*  1 */`$STACK.push($STACK.pop() + $STACK.pop());`,
  /*  2 */`console.log($STACK[$STACK.length - 1]);`,
  /*  3 */`$STACK.pop();`,
  /*  4 */`console.log($STACK);`,
  /*  5 */`$STACK.push($STACK.pop() - $STACK.pop());`,
  /*  6 */`$STACK.push($STACK.pop() & $STACK.pop());`,
  /*  7 */`$STACK.push($STACK.pop() ^ $STACK.pop());`,
  /*  8 */`let a = $stack.pop();
          let b = $stack.pop();
          $stack.push(( a || b ) && !( a && b )); `,
  /*  9 */`$stack.pop()`,
  /* 10 */`$stack.push($stack[$STACK.length - 1])`,
  /* 11 */`$stack.push($stack[$STACK.length - 2])`,
  /* 12 */`let a = $STACK[$STACK.length - 1];
           let b = $STACK[$STACK.length - 2];
           $STACK.push(a)
           $STACK.push(b)`,
  /* 13 */ `$MEM.set($VAL, $STACK[$STACK.length - 1])`,
  /* 14 */ `$STACK.push($MEM.get($VAL))`
];
// MORE programs
// less stupid code
// some tests

const PROCEDURES = SOURCE.map(source => new Function('$STACK', '$VAL', source));
// PROCEDURES.forEach( p => p([], 1)); // TODO: why is this slow

var MY_PROGRAM = [
  [PUSH, 1],
  [PUSH, 1],
  [ADD],
  [PRINT],
  [POP],
  [PRINT_STACK],
  [PUSH, 1],
  [PUSH, 1],
  [ADD],
  [PRINT],
  [POP],
  [PRINT_STACK],
]
var source = compile(MY_PROGRAM);

// console.log(source);

const program = new Function(source);
program();
console.time('compiled');
program();
console.timeEnd('compiled');

console.time('interpret');
interpret(MY_PROGRAM);
console.timeEnd('interpret');

function interpret(program) {
  for (let i = 0; i < program.length; i++) {
    let [op, value] = program[i];
    let procedure = PROCEDURES[op];
    // console.log(procedure.name, value);
    // console.log('STACK', STACK);
    procedure(STACK, value);
  }
}

function compile(program) {
  var result = 'let $VAL;\n';
  result += 'const $STACK = [];\n';
  for (let i = 0; i < program.length; i++) {
    let step = program[i];
    let [op, value] = step;
    let procedure = SOURCE[op];
    if (step.length > 1) {
      procedure = procedure.replace('$VAL', value);
    }
    result += procedure  +'\n';
  }
  return result;
}
